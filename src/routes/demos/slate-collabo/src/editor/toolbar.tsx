import * as React from "react"
import { Editor, Range, Text, Transforms } from "slate"
import { ReactEditor, useSlate } from "slate-react"

export const toggleFormat = (editor: Editor, format: string) => {
    const isActive = isFormatActive(editor, format)
    Transforms.setNodes(editor, { [format]: isActive ? null : true }, { match: Text.isText, split: true })
}

const isFormatActive = (editor, format) => {
    const [match] = Array.from(
        Editor.nodes(editor, {
            match: n => n[format] === true,
            mode: "all",
        })
    )
    return !!match
}

export const Toolbar = () => {
    const ref = React.useRef<HTMLDivElement | null>()
    const editor = useSlate()

    React.useEffect(() => {
        const el = ref.current
        const { selection } = editor

        if (!el) {
            return
        }

        if (!selection || !ReactEditor.isFocused(editor) || Range.isCollapsed(selection) || Editor.string(editor, selection) === "") {
            el.removeAttribute("style")
            return
        }

        const domSelection = window.getSelection()
        const domRange = domSelection?.getRangeAt(0)
        const rect = domRange?.getBoundingClientRect()
        if (rect) {
            el.style.opacity = "1"
            el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight}px`
            el.style.left = `${rect.left + window.pageXOffset - el.offsetWidth / 2 + rect.width / 2}px`
        }
    })

    return (
        <div>
            <FormatButton format="bold" icon="format_bold" />
            <FormatButton format="italic" icon="format_italic" />
            <FormatButton format="underlined" icon="format_underlined" />
        </div>
    )
}

const Button = ({ active, children, ...rest }: { active: boolean } & React.HTMLAttributes<HTMLButtonElement>) => {
    return (
        <button
            {...rest}
            style={{
                color: active ? "blue" : "gray",
                ...rest.style,
            }}
        >
            <span>{children}</span>
        </button>
    )
}

const Icon = ({ children }) => {
    return <div>{children}</div>
}

const FormatButton = ({ format, icon }) => {
    const editor = useSlate()
    return (
        <Button
            active={isFormatActive(editor, format)}
            onMouseDown={event => {
                event.preventDefault()
                toggleFormat(editor, format)
            }}
        >
            <Icon>{icon}</Icon>
        </Button>
    )
}
