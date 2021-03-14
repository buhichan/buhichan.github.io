import { BehaviorSubject, ReplaySubject, Subject } from "rxjs"
import { ClientEvent, ClientEventType, RoomInfo, ServerEvent, ServerEventType, UserInfo } from "./protocol"

export function createClientConnection(signalServerUrl: string) {
    const savedUserStr = localStorage.getItem("userinfo")

    const thisIsMe = new BehaviorSubject(savedUserStr ? (JSON.parse(savedUserStr) as UserInfo) : null)

    const ws = new WebSocket(signalServerUrl)

    const send = (ev: ClientEvent) => {
        ws.send(JSON.stringify(ev))
    }

    ws.onopen = e => {
        send({
            type: ClientEventType.hello,
            from: thisIsMe.value,
        })
    }

    const rooms = new BehaviorSubject<RoomInfo[]>([])
    const currentRoom = new BehaviorSubject<RoomInfo | null>(null)
    //@ts-ignore
    currentRoom.name = "currentRoom"

    const signal = new Subject<{
        from: UserInfo
        signal: string
        signalType: "offer" | "answer"
    }>()

    const addPeer = new Subject<{
        userInfo: UserInfo
        shouldRequest: boolean
    }>()
    const removePeer = new Subject<{
        userInfo: UserInfo
    }>()

    const clearPeers = new Subject()

    ws.addEventListener("message", e => {
        const data = JSON.parse(e.data) as ServerEvent
        console.log("connection event ", data.type)
        const thisIsMeValue = thisIsMe.value
        if (data.type === ServerEventType.hello) {
            rooms.next(data.rooms)
            thisIsMe.next(data.user)
            console.log(`%c Server says: hello, [${data.user.id}] ${data.user.username}!`, `color: ${data.user.color}`)
            localStorage.setItem("userinfo", JSON.stringify(data.user))
            return
        } else if (thisIsMeValue) {
            switch (data.type) {
                case ServerEventType.listRooms: {
                    rooms.next(data.rooms)
                    break
                }
                case ServerEventType.join: {
                    const joinedRoom = data.room
                    const roomIndex = rooms.value.findIndex(x => x.name === joinedRoom.name)
                    if (roomIndex === -1) {
                        rooms.next([...rooms.value, joinedRoom])
                    } else {
                        rooms.value[roomIndex] = joinedRoom
                        rooms.next(rooms.value.slice())
                    }
                    if (data.userInfo.id === thisIsMeValue.id) {
                        currentRoom.next(data.room)
                        setTimeout(() => {
                            data.room.users.forEach(user => {
                                if (user.id !== thisIsMeValue.id) {
                                    addPeer.next({
                                        userInfo: user,
                                        shouldRequest: true,
                                    })
                                }
                            })
                        }, 100)
                    } else {
                        if (currentRoom.value?.name === data.room.name) {
                            currentRoom.next(data.room)
                        }
                        if (joinedRoom.name === currentRoom.value?.name) {
                            addPeer.next({
                                userInfo: data.userInfo,
                                shouldRequest: false,
                            })
                        }
                    }
                    break
                }
                case ServerEventType.quit: {
                    if (data.userInfo.id === thisIsMeValue.id) {
                        clearPeers.next(data)
                        currentRoom.next(null)
                        send({
                            type: ClientEventType.listRooms,
                        })
                    } else {
                        removePeer.next(data)
                        currentRoom.next(
                            currentRoom.value === null
                                ? null
                                : {
                                      ...currentRoom.value,
                                      users: currentRoom.value.users.filter(x => x.id !== data.userInfo.id),
                                  }
                        )
                    }
                    break
                }
                case ServerEventType.signal: {
                    signal.next({
                        from: data.from,
                        signal: data.signal,
                        signalType: data.signalType,
                    })
                    break
                }
                case ServerEventType.error: {
                    console.error("App Error: ", data.errorCode)
                    break
                }
            }
        }
    })

    return {
        rooms,
        currentRoom,
        events: {
            addPeer,
            removePeer,
            clearPeers,
        },
        thisIsMe,
        signal,
        send,
    }
}
