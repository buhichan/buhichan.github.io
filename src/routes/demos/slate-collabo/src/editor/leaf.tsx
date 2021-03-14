import * as React from "react"
import { Caret, CursorRange } from "./cursor"

export const Leaf = ({ attributes, children, leaf }) => {
    if (leaf.bold) {
        children = <strong>{children}</strong>
    }

    if (leaf.italic) {
        children = <em>{children}</em>
    }

    if (leaf.underlined) {
        children = <u>{children}</u>
    }

    return (
        <span
            {...attributes}
            style={{
                background: leaf.isCaret ? (leaf as CursorRange).userInfo.color : undefined,
                ...attributes.style,
            }}
        >
            {leaf.isCaret ? <Caret {...leaf} /> : null}
            {children}
        </span>
    )
}
