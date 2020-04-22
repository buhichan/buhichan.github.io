import { Vec2 } from "./interfaces"


export abstract class MapObject {
    abstract get texture():string
    constructor(public position: Vec2){

    }
    get friction():number{
        return 1
    }
    get sizex(){
        return 1
    }
    get sizey(){
        return 1
    }
}

export class RockBlock extends MapObject {
    get texture(){
        return "█"
    }
}

export class BrickBlock extends MapObject {
    get texture(){
        return "░"
    }
}


enum CurioContent {
    Mushroom,
    Coin,
    Empty,
}

export class CurioBlock extends MapObject {
    constructor(public position: Vec2, public content: CurioContent){
        super(position)
    }
    get texture(){
        return this.content === CurioContent.Empty ? "⃞" : "⍰"
    }
}

export class Tunnel extends MapObject {
    get texture(){
        return "┏┓\n┃┃"
    }
    get sizex(){
        return 2
    }
    get sizey(){
        return 2
    }
}