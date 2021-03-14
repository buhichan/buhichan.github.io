import * as React from "react"
import { Subject } from "rxjs"
import { createEditor, Editor, Node, NodeEntry, Path, Range, RangeRef, Text } from "slate"
import { withHistory } from "slate-history"
import { Editable, ReactEditor, Slate, withReact } from "slate-react"
import { useSuspendable } from "use-suspendable"
import withCollabo, { CollaboApi, CollaboEvent } from "./collabo"
import { createClientConnection } from "./connection"
import { CursorRange } from "./editor/cursor"
import { Leaf } from "./editor/leaf"
import { toggleFormat, Toolbar } from "./editor/toolbar"
import { Peer, PeerSignal } from "./peer"
import { ClientEventType, RoomInfo, UserInfo } from "./protocol"

type Props = {}

// "ws://158.247.213.142:9083/signal-server"
const connection = createClientConnection("ws://158.247.213.142:9083/signal-server")

// const connection = createClientConnection("ws://localhost:9083/signal-server")

export default function App() {
    return (
        <React.Suspense fallback="加载中...">
            <HomePage />
        </React.Suspense>
    )
}

function HomePage() {
    const [myUserInfo] = useSuspendable(connection.thisIsMe)

    if (!myUserInfo) {
        return <span>加载用户信息...</span>
    }
    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                background: "#fff",
                display: "grid",
                gridTemplateColumns: "250px 1fr",
            }}
        >
            <div>
                <div>这个是你:</div>
                <div>
                    <UserAvatar userInfo={myUserInfo} />
                    {myUserInfo.username}
                </div>
            </div>
            <div>
                <Main userInfo={myUserInfo} />
            </div>
        </div>
    )
}

const editor = withHistory(withReact(withCollabo<Peer<CollaboEvent>, Editor>(createEditor())))
connection.events.addPeer.subscribe(({ userInfo, shouldRequest }) => {
    const sendSignal = new Subject<PeerSignal>()
    editor.collabo.addPeer(new Peer(userInfo, connection.signal, sendSignal, shouldRequest))
    sendSignal.subscribe(signal => {
        connection.send({
            type: ClientEventType.signal,
            to: userInfo,
            ...signal,
        })
    })
})
connection.events.removePeer.subscribe(({ userInfo }) => {
    editor.collabo.removePeer(userInfo.id)
})
connection.events.clearPeers.subscribe(() => {
    editor.collabo.clear()
})

function Main({ userInfo }: { userInfo: UserInfo }) {
    const [currentRoom] = useSuspendable(connection.currentRoom)

    React.useEffect(() => {
        if (currentRoom?.users?.[0].id === userInfo.id) {
            editor.collabo.initializeAsMaster()
        }
    }, [currentRoom?.users?.[0].id])

    if (!currentRoom || !editor) {
        return <RoomList />
    } else {
        return <Room roomInfo={currentRoom} editor={editor} userInfo={userInfo} />
    }
}

function RoomList() {
    const [rooms] = useSuspendable(connection.rooms)

    if (!rooms) {
        return <span>加载房间信息...</span>
    }

    return (
        <>
            <button
                style={{
                    background: "#909",
                    color: "#fff",
                    borderRadius: 6,
                    border: "3px solid #999",
                    padding: "5px 10px",
                    fontSize: 20,
                }}
                onClick={() => {
                    const roomName = prompt("房间名字?")
                    roomName &&
                        connection.send({
                            type: ClientEventType.join,
                            roomName,
                        })
                }}
            >
                创建/加入房间
            </button>
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "50vh",
                }}
            >
                {rooms.map(x => {
                    return (
                        <div
                            key={x.name}
                            style={{
                                background: "#909",
                                color: "#fff",
                                borderRadius: 6,
                                border: "3px solid #999",
                                padding: "5px 10px",
                                fontSize: 20,
                                minHeight: 200,
                                minWidth: 400,
                                cursor: "pointer",
                            }}
                            onClick={() => {
                                connection.send({
                                    type: ClientEventType.join,
                                    roomName: x.name,
                                })
                            }}
                        >
                            <h2>{x.name}</h2>
                            <div>
                                {x.users.map(x => {
                                    return <UserAvatar userInfo={x} key={x.id} />
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>
        </>
    )
}

function Room({
    userInfo,
    editor,
    roomInfo,
}: {
    userInfo: UserInfo
    editor: Editor &
        ReactEditor & {
            collabo: CollaboApi<Peer<CollaboEvent>>
        }
    roomInfo: RoomInfo
}) {
    const [value, setValue] = React.useState<Node[]>(() => {
        return [
            {
                type: "paragraph",
                children: [{ text: "A line of text in a paragraph." }],
            },
        ]
    })

    React.useEffect(() => {
        if (!editor.collabo.isPrimary) {
            const sub = editor.collabo.initializeAsSecondary.subscribe(nodes => {
                setValue(nodes)
            })
            return () => sub.unsubscribe()
        }
    }, [editor])

    const [cursors, setCursors] = React.useState([] as [UserInfo, RangeRef][])

    const decorate = React.useCallback(
        ([node, path]: NodeEntry) => {
            const ranges: CursorRange[] = []

            if (Text.isText(node)) {
                for (const [remoteUserInfo, cursor] of cursors) {
                    const cursorRange = cursor.current
                    if (cursorRange && Range.includes(cursorRange, path)) {
                        const { focus, anchor } = cursorRange

                        const isFocusNode = Path.equals(focus.path, path)
                        const isAnchorNode = Path.equals(anchor.path, path)
                        const isForward = Range.isForward(cursorRange)
                        ranges.push({
                            ...cursor,
                            userInfo: remoteUserInfo,
                            isForward,
                            isCaret: true,
                            anchor: {
                                path,
                                offset: isAnchorNode ? anchor.offset : isForward ? 0 : node.text.length,
                            },
                            focus: {
                                path,
                                offset: isFocusNode ? focus.offset : isForward ? node.text.length : 0,
                            },
                        })
                    }
                }
            }

            return ranges
        },
        [cursors]
    )

    React.useEffect(() => {
        const sub = editor.collabo.docState.cursors.subscribe(v => {
            setCursors(Array.from(v.entries()).map(x => [x[0].userInfo, x[1]]))
        })
        return () => {
            sub.unsubscribe()
        }
    }, [editor])

    const renderLeaf = React.useCallback((props: any) => <Leaf {...props} />, [decorate])

    return (
        <>
            <div>
                {roomInfo.users.map(x => {
                    return (
                        <UserAvatar
                            key={x.id}
                            userInfo={x}
                            style={{
                                marginRight: 16,
                            }}
                        />
                    )
                })}
            </div>
            <Slate
                editor={editor}
                value={value}
                onChange={newValue => {
                    setValue(newValue)
                }}
                onDOMBeforeInput={(event: InputEvent) => {
                    event.preventDefault()
                    switch (event.inputType) {
                        case "formatBold":
                            return toggleFormat(editor, "bold")
                        case "formatItalic":
                            return toggleFormat(editor, "italic")
                        case "formatUnderline":
                            return toggleFormat(editor, "underline")
                    }
                }}
            >
                <Toolbar />
                <Editable decorate={decorate} renderLeaf={renderLeaf} style={{ width: 300, height: 200, border: "1px solid black" }} />
            </Slate>
        </>
    )
}

function UserAvatar({ userInfo, style }: { userInfo: UserInfo; style?: React.CSSProperties }) {
    return (
        <span
            style={{
                height: 20,
                width: 20,
                lineHeight: "18px",
                background: "#333",
                textAlign: "center",
                borderRadius: "50%",
                border: "1px solid " + userInfo.color,
                color: userInfo.color,
                display: "inline-block",
                ...style,
            }}
        >
            {userInfo.username.slice(0, 1)}
        </span>
    )
}
