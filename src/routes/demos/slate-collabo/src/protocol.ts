export enum ErrorCode {
    NotInARoom = "NotInARoom",
}

export enum ClientEventType {
    hello = "hello",
    join = "join",
    quit = "quit",
    listRooms = "listRooms",
    signal = "signal",
}

export type ClientEvent =
    | {
          type: ClientEventType.hello
          from: UserInfo | null
      }
    | {
          type: ClientEventType.join
          roomName: string
      }
    | { type: ClientEventType.listRooms }
    | { type: ClientEventType.quit }
    | { type: ClientEventType.signal; to: UserInfo; signalType: "offer" | "answer"; signal: string }

export enum ServerEventType {
    hello = "hello",
    join = "join",
    quit = "quit",
    error = "error",
    signal = "signal",
    listRooms = "listRooms",
}

export type UserInfo = {
    id: string
    username: string
    color: string
}

export type RoomInfo = {
    name: string
    users: UserInfo[]
}

export type ServerEvent =
    | { type: ServerEventType.listRooms; rooms: RoomInfo[] }
    | { type: ServerEventType.error; errorCode: ErrorCode }
    | { type: ServerEventType.hello; user: UserInfo; rooms: RoomInfo[] }
    | { type: ServerEventType.join; room: RoomInfo; userInfo: UserInfo }
    | { type: ServerEventType.quit; roomName: string; userInfo: UserInfo }
    | { type: ServerEventType.signal; from: UserInfo; signalType: "offer" | "answer"; signal: string }
