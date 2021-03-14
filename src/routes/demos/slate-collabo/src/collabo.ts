import { Observable, Subject } from "rxjs"
import { Editor, Node, Operation } from "slate"
import { DocumentState } from "./state"

export interface IPeer {
    id: string
    sendTo(msg: CollaboEvent): void
    receiveFrom: Observable<CollaboEvent>
    dispose(): void
}

export interface CollaboApi<P extends IPeer> {
    docState: DocumentState<P>
    isPrimary: boolean
    initializeAsSecondary: Subject<Node[]>
    initializeAsMaster(): void
    addPeer(peer: P): void
    removePeer(peerId: string): void
    clear(): void
}

export interface CollaboOptions {}

enum MessageType {
    Hello,
    ReqMerge,
    AckMerge,
}

export type CollaboEvent =
    | {
          type: MessageType.Hello
          version: number
          nodes: Node[]
      }
    | {
          type: MessageType.ReqMerge
          ops: Operation[]
          version: number
      }
    | {
          type: MessageType.AckMerge
          unmergedOps: Operation[]
          newVersion: number
      }

enum PeerState {
    unknown,
    primary,
    secondary,
}

export default function withCollabo<P extends IPeer, E extends Editor>(editor: E): E & { collabo: CollaboApi<P> } {
    const decoratedEditor = editor as E & { collabo: CollaboApi<P> }

    const { apply } = editor

    let peers = {} as Record<IPeer["id"], P>

    let currentState = PeerState.unknown

    let docState = new DocumentState<P>(editor, apply)
    let uncommitedOps: Operation[] = []

    editor.apply = op => {
        apply(op)
        uncommitedOps.push(op)
        pendingSent && clearTimeout(pendingSent)
        pendingSent = (setTimeout(() => {
            if (currentState === PeerState.secondary) {
                for (const peerId in peers) {
                    const peer = peers[peerId]
                    peer.sendTo({
                        type: MessageType.ReqMerge,
                        version: docState.version,
                        ops: uncommitedOps,
                    })
                }
            } else if (currentState === PeerState.primary) {
                docState.version += uncommitedOps.length
                for (const peerId in peers) {
                    const peer = peers[peerId]
                    peer.sendTo({
                        type: MessageType.AckMerge,
                        newVersion: docState.version,
                        unmergedOps: uncommitedOps,
                    })
                }
            }
            uncommitedOps = []
            pendingSent = 0
        }, 50) as unknown) as number
    }

    let pendingSent = 0

    let initializeAsSecondary = new Subject<Node[]>()

    decoratedEditor.collabo = {
        docState,
        get isPrimary() {
            return currentState === PeerState.primary
        },
        initializeAsSecondary,
        initializeAsMaster() {
            console.log("is master")
            currentState = PeerState.primary
        },
        addPeer(peer) {
            peers[peer.id] = peer
            peer.receiveFrom.subscribe(function handleMessage(msg: CollaboEvent) {
                if (currentState === PeerState.unknown) {
                    switch (msg.type) {
                        case MessageType.Hello: {
                            currentState = PeerState.secondary
                            docState.version = msg.version
                            initializeAsSecondary.next(msg.nodes)
                            break
                        }
                    }
                } else if (currentState === PeerState.primary) {
                    switch (msg.type) {
                        case MessageType.Hello: {
                            peer.sendTo({
                                type: MessageType.Hello,
                                version: docState.version,
                                nodes: editor.children,
                            })
                            break
                        }
                        case MessageType.ReqMerge: {
                            const mergeResult = docState.mergePatch(msg, peer)
                            if (!mergeResult) {
                                throw new Error("primary falls behind secondary")
                            }
                            for (const peerId in peers) {
                                const peer = peers[peerId]
                                peer.sendTo({
                                    type: MessageType.AckMerge,
                                    newVersion: docState.version,
                                    unmergedOps: uncommitedOps,
                                })
                            }
                        }
                    }
                } else if (currentState === PeerState.secondary) {
                    switch (msg.type) {
                        case MessageType.AckMerge: {
                            docState.ackMerge(msg.newVersion, msg.unmergedOps, peer)
                        }
                    }
                }
            })
            if (currentState === PeerState.unknown) {
                peer.sendTo({
                    type: MessageType.Hello,
                    version: docState.version,
                    nodes: editor.children,
                })
            }
        },
        removePeer(id) {
            const toBeDeleted = peers[id]
            if (toBeDeleted) {
                docState.removeCursor(toBeDeleted)
                editor.onChange()
            }
            peers[id]?.dispose()
            delete peers[id]
        },
        clear() {
            for (const peer of Object.values(peers)) {
                peer.dispose()
            }
            peers = {}
            docState = new DocumentState(editor, apply)
            currentState = PeerState.unknown
            initializeAsSecondary = new Subject()
        },
    }

    return decoratedEditor
}
