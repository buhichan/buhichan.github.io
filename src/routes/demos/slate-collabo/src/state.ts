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
function transform(leftOp: Operation, topOp: Operation): [any, any] {
    throw new Error("Function not implemented.")
}
