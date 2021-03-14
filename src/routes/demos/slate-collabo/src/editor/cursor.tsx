import * as React from "react"
import { Range } from "slate"
import { UserInfo } from "../protocol"

export interface CursorRange extends Range {
    userInfo: UserInfo
    isCaret: boolean
    isForward: boolean
}

const cursorStyleBase = {
    position: "absolute",
    top: -2,
    pointerEvents: "none",
    userSelect: "none",
    transform: "translateY(-100%)",
    fontSize: 10,
    background: "palevioletred",
    whiteSpace: "nowrap",
} as React.CSSProperties

const caretStyleBase = {
    position: "absolute",
    pointerEvents: "none",
    userSelect: "none",
    height: "1.2em",
    width: 2,
    background: "palevioletred",
} as React.CSSProperties

export function Caret({ userInfo, isForward }: CursorRange) {
    const cursorStyles = {
        ...cursorStyleBase,
        background: userInfo.color,
        color: "black",
        // left: isForward ? "100%" : "0%",
        left: "0%",
    } as React.CSSProperties
    const caretStyles = {
        ...caretStyleBase,
        position: "relative",
        background: userInfo.color,
        // left: isForward ? "100%" : "0%",
        left: "0%",
    } as React.CSSProperties

    caretStyles[isForward ? "bottom" : "top"] = 0

    return (
        <span
            style={{
                backgroundColor: userInfo.color,
            }}
        >
            <span className="caret" contentEditable={false} style={caretStyles}>
                <span style={{ position: "relative" }}>
                    <span contentEditable={false} style={cursorStyles}>
                        {userInfo.username}
                    </span>
                    <span
                        style={{
                            borderLeft: "1px solid currentColor",
                            borderTop: "1px solid currentColor",
                            borderBottom: "1px solid currentColor",
                            animation: "cursor 1s steps(2, jump-both) infinite",
                        }}
                    ></span>
                </span>
            </span>
        </span>
    )
}
