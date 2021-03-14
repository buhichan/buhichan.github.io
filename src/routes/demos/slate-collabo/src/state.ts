import { asapScheduler, BehaviorSubject } from "rxjs"
import { observeOn } from "rxjs/operators"
import { Editor, Operation, Path, Point, Range, RangeRef, SelectionOperation } from "slate"
import { IPeer } from "./collabo"

type Patch = {
    version: number
    ops: Operation[]
}

export class DocumentState<P extends IPeer> {
    constructor(private editor: Editor, private apply: Editor["apply"]) {}
    version = 0
    private _cursors = new BehaviorSubject(new Map<P, RangeRef>())
    cursors = this._cursors.pipe(observeOn(asapScheduler))
    removeCursor(peer: P) {
        this._cursors.value.delete(peer)
        this._cursors.next(this._cursors.value)
    }
    mergePatch(patch: Patch, from: P) {
        if (patch.version <= this.version) {
            let left = this.editor.operations.slice(patch.version)
            let top = patch.ops as (Operation | null)[]
            let right: (Operation | null)[] = []
            let bottom: (Operation | null)[] = []
            if (!left.length || !top.length) {
                bottom = top
                right = left
            } else {
                for (let i = 0; i < left.length; i++) {
                    let leftOp = left[i] as Operation | null
                    for (let j = 0; j < top.length; j++) {
                        let topOp = top[j]
                        const [rightOp, bottomOp] = transform(leftOp, topOp)
                        leftOp = rightOp
                        bottom.push(bottomOp)
                    }
                    right.push(leftOp)
                    top = bottom
                }
            }
            Editor.withoutNormalizing(this.editor, () => {
                bottom.forEach(op => {
                    if (op) {
                        this.applyRemoteOp(op, from)
                    }
                    this.version++
                })
            })
            this.editor.onChange()
            return right
        } else {
            return false
        }
    }
    private applyRemoteOp(op: Operation, from: P) {
        if (op.type === "set_selection") {
            if (op.newProperties) {
                let rangeRef = this._cursors.value.get(from)
                if (!rangeRef) {
                    rangeRef = Editor.rangeRef(this.editor, op.newProperties as Range)
                    this._cursors.value.set(from, rangeRef)
                }
                if (rangeRef.current) {
                    rangeRef.current = {
                        anchor: op.newProperties.anchor || rangeRef.current?.anchor,
                        focus: op.newProperties.focus || rangeRef.current?.focus,
                    }
                }
            } else {
                this._cursors.value.get(from)?.unref()
            }
            this._cursors.next(this._cursors.value)
        } else {
            this.apply(op)
        }
    }
    ackMerge(newVersion: number, ops: (Operation | null)[], from: P) {
        Editor.withoutNormalizing(this.editor, () => {
            ops.forEach(op => {
                if (op) {
                    this.applyRemoteOp(op, from)
                }
            })
        })
        this.version = newVersion
        this.editor.onChange()
    }
}

function transform(left: Operation | null, top: Operation | null): [Operation | null, Operation | null] {
    if (!left || !top) {
        return [left, top]
    }
    switch (left.type) {
        case "remove_text":
        case "insert_text": {
            switch (top.type) {
                case "remove_text":
                case "insert_text": {
                    if (Path.equals(top.path, left.path)) {
                        if (top.offset > left.offset) {
                            if (left.type === "insert_text") {
                                top.offset += left.text.length
                            } else {
                                top.offset -= left.text.length
                            }
                        } else {
                            if (top.type === "insert_text") {
                                left.offset += top.text.length
                            } else {
                                left.offset -= top.text.length
                            }
                        }
                    }
                    break
                }
                case "set_selection": {
                    transformSelection(top, left)
                    break
                }
                default: {
                    const rightPath = Path.transform(left.path, top)
                    const bottomPath = Path.transform(top.path, left)
                    if (!rightPath) {
                        left = null
                    }
                    if (!bottomPath) {
                        top = null
                    }
                }
            }
            break
        }
        case "set_selection": {
            switch (top.type) {
                case "set_selection": {
                    break
                }
                default: {
                    transformSelection(left, top)
                }
            }
            break
        }
        case "move_node": {
            switch (top.type) {
                case "set_selection": {
                    transformSelection(top, left)
                    break
                }
                case "move_node": {
                    const rightPath = Path.transform(left.path, top)
                    const rightNewPath = Path.transform(left.newPath, top)
                    const bottomPath = Path.transform(top.path, left)
                    const bottomNewPath = Path.transform(top.newPath, left)
                    if (!rightNewPath || !rightPath) {
                        left = null
                    } else {
                        left.path = rightPath
                        left.newPath = rightNewPath
                    }
                    if (!bottomNewPath || !bottomPath) {
                        top = null
                    } else {
                        top.path = bottomPath
                        top.newPath = bottomNewPath
                    }
                    break
                }
                default: {
                    const rightPath = Path.transform(left.path, top)
                    const rightNewPath = Path.transform(left.newPath, top)
                    const bottomPath = Path.transform(top.path, left)
                    if (!rightPath || !rightNewPath) {
                        left = null
                    } else {
                        left.path = rightPath
                        left.newPath = rightNewPath
                    }
                    if (!bottomPath) {
                        top = null
                    } else {
                        top.path = bottomPath
                    }
                }
            }
            break
        }
        default: {
            switch (top.type) {
                case "set_selection": {
                    transformSelection(top, left)
                    break
                }
                default: {
                    const rightPath = Path.transform(left.path, top)
                    const bottomPath = Path.transform(top.path, left)
                    if (!rightPath) {
                        left = null
                    } else {
                        left.path = rightPath
                    }
                    if (!bottomPath) {
                        top = null
                    } else {
                        top.path = bottomPath
                    }
                }
            }
            break
        }
    }
    return [left, top]
}

function transformSelection(a: SelectionOperation, by: Operation) {
    if (a.properties) {
        a.properties.anchor = (a.properties.anchor && Point.transform(a.properties.anchor, by)) || undefined
        a.properties.focus = (a.properties.focus && Point.transform(a.properties.focus, by)) || undefined
    }
    if (a.newProperties) {
        a.newProperties.anchor = (a.newProperties.anchor && Point.transform(a.newProperties.anchor, by)) || undefined
        a.newProperties.focus = (a.newProperties.focus && Point.transform(a.newProperties.focus, by)) || undefined
    }
}
