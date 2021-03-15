import { Operation, Path, Point, SelectionOperation } from "slate"

export function transform(left: Operation | null, top: Operation | null): [Operation | null, Operation | null] {
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
