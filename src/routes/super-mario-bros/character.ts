import {Vec2, UpdateObject, RenderObject} from "./interfaces"

export abstract class Character implements UpdateObject,RenderObject {
    acc:Vec2
    speed:Vec2
    position:Vec2
    update(){
        this.speed.x += this.acc.x
        this.speed.y += this.acc.y
        this.position.x += this.speed.x
        this.position.y += this.speed.y
    }
    abstract get texture():string
    get sizex(){
        return 1
    }
    get sizey(){
        return 1
    }
}

enum MarioState {
    Small,
    Mushroom,
    Fire,
    Big,
}

export class Mario extends Character {
    state = MarioState.Small
    get texture(){
        return "M"
    }
    get sizex(){
        switch (this.state){
            case MarioState.Big:{
                return 2
            }
            default: {
                return 1
            }
        }
    }
    get sizey(){
        switch (this.state){
            case MarioState.Small:{
                return 1
            }
            default: {
                return 2
            }
        }
    }
}

export class Kuribo extends Character {
    get texture(){
        return "🐸"
    }
}
export class Koopa extends Character {
    get texture(){
        return "🐢"
    }
}