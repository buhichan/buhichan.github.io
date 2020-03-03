import { Koma } from "./koma";

export enum Faction {
    Ou,
    Gyou,
}

export const MAX_SIZE = 9;

export class Coord {
    private constructor(public x:number, public y:number){
        
    }
    static newCoord(x: number, y: number){
        if(x < 0 || x >= MAX_SIZE || y < 0 || x >= MAX_SIZE){
            return null
        }else{
            return new Coord(x, y)
        }
    }
    eq(c: Coord){
        return c.x === this.x && c.y === this.y
    }
    topleft(){
        return new Coord(this.x - 1, this.y + 1)
    }
    topright(){
        return new Coord(this.x + 1, this.y + 1)
    }
    bottomleft(){
        return new Coord(this.x - 1, this.y - 1)
    }
    bottomright(){
        return new Coord(this.x + 1, this.y - 1)
    }
    top(){
        return new Coord(this.x, this.y + 1)
    }
    left(){
        return new Coord(this.x - 1, this.y)
    }
    right(){
        return new Coord(this.x + 1, this.y)
    }
    bottom(){
        return new Coord(this.x, this.y - 1)
    }
}

export enum KomaKind {
    飞车,
    龙王,

    王将,
    玉将,
    
    角行,
    龙马,

    香车,
    成香,

    银将,
    成银,
    
    金将,
    
    桂马,
    成桂,
    
    步兵,
    成步,
}

export enum MoveKind {
    Eat,
    Move,
    Uchikomu,
}

export abstract class Move {
    constructor(public koma: Koma, public from:Coord, public to: Coord){}
}

export class MoveMove {
    constructor(public koma: Koma, public from:Coord, public to: Coord){}
}

export class MoveEat {
    constructor(public koma: Koma, public from:Coord, public to: Coord){}
}

export class MoveUchikomu {
    constructor(public koma: Koma, public from:Coord, public to: Coord){}
}

export enum MoveResult {
    MayUpgrade,
    KO,
    Nothing,
}

export enum UpgradeOption {
    CannotUpgrade,
    MustUpgrade,
    MayUpgrade
}