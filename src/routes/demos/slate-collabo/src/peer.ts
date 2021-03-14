import { fromEventPattern, Observable, Subject, Subscription } from "rxjs"
import WebRTCDataChannel from "webrtc-datachannel"
import { UserInfo } from "./protocol"
import { map } from "rxjs/operators"

export type PeerSignal = {
    signal: string
    signalType: "offer" | "answer"
}

class TimeoutError {
    message = "timeout"
}

export class Peer<Event> {
    subs = new Subscription()
    get id() {
        return this.userInfo.id
    }
    constructor(public userInfo: UserInfo, private receiveSignal: Observable<PeerSignal>, private sendSignal: Subject<PeerSignal>, shouldRequest: boolean) {
        // console.log("create peer: ", userInfo.id)
        // if (shouldRequest) {
        //     console.log("send request to peer: ", userInfo.id)
        //     this.rtcChannel.initiateConnect().then(offer => {
        //         this.sendSignal.next({
        //             signalType: "offer",
        //             signal: offer,
        //         })
        //     })
        // }
        // this.subs.add(
        //     this.receiveSignal.subscribe(({ signal, signalType }) => {
        //         if (signalType === "offer") {
        //             console.log("receive offer from peer: ", this.userInfo.id)
        //             this.rtcChannel.initByRequest(signal).then(answer => {
        //                 console.log("send answer to peer: ", this.userInfo.id)
        //                 this.sendSignal.next({
        //                     signalType: "answer",
        //                     signal: answer,
        //                 })
        //             })
        //         } else if (signalType === "answer") {
        //             console.log("receive answer from peer: ", this.userInfo.id)
        //             this.rtcChannel.setAnswer(signal)
        //         }
        //     })
        // )
    }
    // private rtcChannel = new WebRTCDataChannel({
    //     connection: {
    //         iceServers: [
    //             { urls: "stun:stun01.sipphone.com" },
    //             { urls: "stun:stun.ekiga.net" },
    //             { urls: "stun:stun.fwdnet.net" },
    //             { urls: "stun:stun.ideasip.com" },
    //             { urls: "stun:stun.iptel.org" },
    //             { urls: "stun:stun.rixtelecom.se" },
    //             { urls: "stun:stun.schlund.de" },
    //             { urls: "stun:stun.l.google.com:19302" },
    //             { urls: "stun:stun1.l.google.com:19302" },
    //             { urls: "stun:stun2.l.google.com:19302" },
    //             { urls: "stun:stun3.l.google.com:19302" },
    //             { urls: "stun:stun4.l.google.com:19302" },
    //             { urls: "stun:stunserver.org" },
    //             { urls: "stun:stun.softjoys.com" },
    //             { urls: "stun:stun.voiparound.com" },
    //             { urls: "stun:stun.voipbuster.com" },
    //             { urls: "stun:stun.voipstunt.com" },
    //             { urls: "stun:stun.voxgratia.org" },
    //             { urls: "stun:stun.xten.com" },
    //             {
    //                 urls: "turn:numb.viagenie.ca",
    //                 credential: "muazkh",
    //                 username: "webrtc@live.com",
    //             },
    //             {
    //                 urls: "turn:192.158.29.39:3478?transport=udp",
    //                 credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
    //                 username: "28224511:1379330808",
    //             },
    //             {
    //                 urls: "turn:192.158.29.39:3478?transport=tcp",
    //                 credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
    //                 username: "28224511:1379330808",
    //             },
    //         ],
    //     },
    // })
    // ready = this.rtcChannel.channelOpened().then(() => {
    //     console.log("peer opened:", this.id)
    // })
    receiveFrom = this.receiveSignal.pipe(
        map(signal => {
            const res = JSON.parse(signal.signal)
            return res as Event
        })
    )
    sendTo(msg: Event) {
        // this.ready.then(() => {
        //     setTimeout(() => {
        //         this.rtcChannel.send(msg)
        //     }, 0)
        // })
        this.sendSignal.next({
            signalType: "offer",
            signal: JSON.stringify(msg),
        })
    }
    dispose() {
        //@ts-ignore
        // this.rtcChannel.dataChannel?.close()
        // //@ts-ignore
        // this.rtcChannel.rpc.close()
        // this.subs.unsubscribe()
    }
}
