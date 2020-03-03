import { Board } from "./board";
import { Coord, Faction, KomaKind, Move, MoveKind, UpgradeOption, MAX_SIZE, MoveEat } from "./interfaces";

export abstract class Koma {
    constructor(public faction:Faction){}
    abstract getPossibleMoves(from: Coord, board: Board): Move[]
    abstract getPossibleUpgrade(currentCoord: Coord): {kind: UpgradeOption, to?: Koma }
    downgrade(): Koma {
        return this
    }
    canUchiKomu(to: Coord, board: Board): boolean {
        return true
    }
    abstract get name():string
    abstract get kind(): KomaKind
}

function getUpgradeThreshold(faction: Faction, coord:Coord): number {
    return (faction === Faction.Ou ? ( MAX_SIZE - coord.y ) : coord.y + 1)
}

function makeMovesInLine(board:Board, koma:Koma, start:Coord, offsetx:number, offsety:number){
    let moves = []
    let px = start.x
    let py = start.y
    let loop = 1000
    while(1){
        loop -- 
        if(loop === 0){
            console.error("Infinite loop")
            break;
        }
        px = px + offsetx
        py = py + offsety
        const coord = Coord.newCoord(px,py)
        if(!coord){
            break
        }else{
            const move = board.createMove(koma, start, coord);
            if( !move ){
                break //furthur moves are blocked by friendly or 
            }
            if( move instanceof MoveEat ){
                moves.push(move)
                break
            }
            moves.push(move)
        }
    }
    return moves
}

export class Oushou extends Koma {
    getPossibleMoves(a: Coord, b: Board): Move[] {
        return [
            b.createMove(this, a, a.left()),
            b.createMove(this, a, a.top()),
            b.createMove(this, a, a.bottom()),
            b.createMove(this, a, a.right()),
            b.createMove(this, a, a.topleft()),
            b.createMove(this, a, a.topright()),
            b.createMove(this, a, a.bottomleft()),
            b.createMove(this, a, a.bottomright()),
        ].filter(x=>x !== null) as Move[]
    }
    getPossibleUpgrade(){
        return { kind: UpgradeOption.CannotUpgrade }
    }
    canUchiKomu(){
        return false
    }
    get kind(){
        return this.faction === Faction.Ou ? KomaKind.王将 : KomaKind.玉将
    }
    get name(){
        return this.faction === Faction.Ou ? "王将" : "玉将"
    }
}

export class Hisha extends Koma {
    getPossibleMoves(a: Coord, b: Board){
        return [
            ...makeMovesInLine(b, this, a, 0, 1),
            ...makeMovesInLine(b, this, a, 0, -1),
            ...makeMovesInLine(b, this, a, 1, 0),
            ...makeMovesInLine(b, this, a, -1, 0),
        ].filter(x=>x !== null) as Move[]
    }
    getPossibleUpgrade(coord){
        if( getUpgradeThreshold(this.faction, coord) <= 3 ){
            return { kind: UpgradeOption.MayUpgrade, to: new Ryuou(this.faction) }
        }else{
            return { kind: UpgradeOption.CannotUpgrade }
        }
    }
    get kind(){
        return KomaKind.飞车
    }
    get name(){
        return "飞车"
    }
}

export class Ryuou extends Koma {
    getPossibleMoves(a: Coord, b: Board){
        return [
            ...makeMovesInLine(b, this, a, 0, 1),
            ...makeMovesInLine(b, this, a, 0, -1),
            ...makeMovesInLine(b, this, a, 1, 0),
            ...makeMovesInLine(b, this, a, -1, 0),
            b.createMove(this, a, a.topleft()),
            b.createMove(this, a, a.topright()),
            b.createMove(this, a, a.bottomleft()),
            b.createMove(this, a, a.bottomright()),
        ].filter(x=>x !== null) as Move[]
    }
    getPossibleUpgrade(){
        return { kind: UpgradeOption.CannotUpgrade }
    }
    downgrade(){
        return new Hisha(this.faction)
    }
    get kind(){
        return KomaKind.龙王
    }
    get name(){
        return "龙王"
    }
}

export class Kakugyou extends Koma {
    getPossibleMoves(a: Coord, b: Board){
        return [
            ...makeMovesInLine(b, this, a, 1, -1),
            ...makeMovesInLine(b, this, a, -1, 1),
            ...makeMovesInLine(b, this, a, 1, 1),
            ...makeMovesInLine(b, this, a, -1, -1),
        ].filter(x=>x !== null) as Move[]
    }
    getPossibleUpgrade(coord){
        if(getUpgradeThreshold(this.faction, coord) <= 3){
            return { kind: UpgradeOption.MayUpgrade, to: new Ryuba(this.faction) }
        }else{
            return { kind: UpgradeOption.CannotUpgrade }
        }
    }
    get kind(){
        return KomaKind.角行
    }
    get name(){
        return "角行"
    }
}

export class Ryuba extends Koma {
    getPossibleMoves(a: Coord, b: Board){
        return [
            ...makeMovesInLine(b, this, a, 1, -1),
            ...makeMovesInLine(b, this, a, -1, 1),
            ...makeMovesInLine(b, this, a, 1, 1),
            ...makeMovesInLine(b, this, a, -1, -1),
            b.createMove(this, a, a.top()),
            b.createMove(this, a, a.right()),
            b.createMove(this, a, a.left()),
            b.createMove(this, a, a.bottom()),
        ].filter(x=>x !== null) as Move[]
    }
    downgrade(){
        return new Kakugyou(this.faction)
    }
    getPossibleUpgrade(coord){
        return { kind: UpgradeOption.CannotUpgrade }
    }
    get kind(){
        return KomaKind.龙马
    }
    get name(){
        return "龙马"
    }
}

export class Kinshou extends Koma {
    getPossibleMoves(a: Coord, b: Board){
        return [
            b.createMove(this, a, a.top()),
            b.createMove(this, a, a.right()),
            b.createMove(this, a, a.left()),
            b.createMove(this, a, a.bottom()),
            ...this.faction === Faction.Ou ? [
                b.createMove(this, a, a.topleft()),
                b.createMove(this, a, a.topright()),
            ] : [
                b.createMove(this, a, a.bottomleft()),
                b.createMove(this, a, a.bottomright()),
            ]
        ].filter(x=>x !== null) as Move[]
    }
    getPossibleUpgrade(){
        return { kind: UpgradeOption.CannotUpgrade }
    }
    get kind(){
        return KomaKind.金将
    }
    get name(){
        return "金将"
    }
}

export class Ginshou extends Koma {
    getPossibleMoves(a: Coord, b: Board){
        return [
            b.createMove(this, a, a.topleft()),
            b.createMove(this, a, a.topright()),
            b.createMove(this, a, a.bottomleft()),
            b.createMove(this, a, a.bottomright()),
            ...this.faction === Faction.Ou ? [
                b.createMove(this, a, a.top()),
            ] : [
                b.createMove(this, a, a.bottom()),
            ]
        ].filter(x=>x !== null) as Move[]
    }
    getPossibleUpgrade(coord){
        if(getUpgradeThreshold(this.faction, coord) <= 3){
            return { kind: UpgradeOption.MayUpgrade, to: new Narigin(this.faction) }
        }else{
            return { kind: UpgradeOption.CannotUpgrade }
        }
    }
    get kind(){
        return KomaKind.银将
    }
    get name(){
        return "银将"
    }
}

export class Narigin extends Kinshou {
    get kind(){
        return KomaKind.成银
    }
    downgrade(){
        return new Ginshou(this.faction)
    }
    get name(){
        return "成银"
    }
}

export class Keiba extends Koma {
    getPossibleMoves(a: Coord, b: Board){
        let direction = this.faction === Faction.Ou ? 1 : -1
        return [
            b.createMove(this, a, Coord.newCoord(a.x-1, a.y + 2 * direction)),
            b.createMove(this, a, Coord.newCoord(a.x+1, a.y + 2 * direction)),
        ].filter(x=>x !== null) as Move[]
    }
    getPossibleUpgrade(coord){
        const upgradeThreshold = getUpgradeThreshold(this.faction, coord);
        if( upgradeThreshold <= 2 ){
            return { kind: UpgradeOption.MustUpgrade, to: new Narikei(this.faction) }
        }else if(upgradeThreshold <= 3){
            return { kind: UpgradeOption.MayUpgrade, to: new Narikei(this.faction) }
        }else{
            return { kind: UpgradeOption.CannotUpgrade }
        }
    }
    canUchiKomu(to:Coord){
        return this.faction === Faction.Ou ? to.y <= MAX_SIZE - 3 : to.y >= 2
    }
    get kind(){
        return KomaKind.桂马
    }
    get name(){
        return "桂马"
    }
}

export class Narikei extends Kinshou {
    get kind(){
        return KomaKind.成桂
    }
    downgrade(){
        return new Keiba(this.faction)
    }
    get name(){
        return "成桂"
    }
}

export class Kyousha extends Koma {
    getPossibleMoves(a: Coord, b: Board){
        let direction = this.faction === Faction.Ou ? 1 : -1
        return [
            ...makeMovesInLine(b, this, a, 0, direction),
        ].filter(x=>x !== null) as Move[]
    }
    getPossibleUpgrade(coord){
        const threshold = getUpgradeThreshold(this.faction, coord)
        if(threshold <= 1){
            return { kind: UpgradeOption.MustUpgrade, to: new Narikyou(this.faction) }
        }else if(threshold <= 3){
            return { kind: UpgradeOption.MayUpgrade, to: new Narikyou(this.faction) }
        }{
            return { kind: UpgradeOption.CannotUpgrade }
        }
    }
    canUchiKomu(to:Coord){
        return this.faction === Faction.Ou ? to.y <= MAX_SIZE - 2 : to.y >= 1
    }
    get kind(){
        return KomaKind.香车
    }
    get name(){
        return "香车"
    }
}

export class Narikyou extends Kinshou {
    get kind(){
        return KomaKind.成香
    }
    downgrade(){
        return new Kyousha(this.faction)
    }
    get name(){
        return "成香"
    }
}

export class Fuhyou extends Koma {
    getPossibleMoves(a: Coord, b: Board){
        return [
            b.createMove(this, a, this.faction === Faction.Ou ? a.top() : a.bottom() )
        ].filter(x=>x !== null) as Move[]
    }
    getPossibleUpgrade(coord){
        if(getUpgradeThreshold(this.faction, coord) <= 1){
            return { kind: UpgradeOption.MustUpgrade, to: new Narito(this.faction) }
        }else if(getUpgradeThreshold(this.faction, coord) <= 3){
            return { kind: UpgradeOption.MayUpgrade, to: new Narito(this.faction) }
        }else{
            return { kind: UpgradeOption.CannotUpgrade }
        }
    }
    canUchiKomu(to:Coord, board: Board){
        const isNotOnLastLine = this.faction === Faction.Ou ? to.y <= MAX_SIZE - 2 : to.y >= 1

        //同径二步
        const doesNotHaveSameColumnFuhyou = new Array(MAX_SIZE).fill(0).every((_,i)=>{
            if(i === to.y){
                return true
            }
            const koma = board.getKoma(Coord.newCoord(to.x, i))
            return !koma || koma.faction !== this.faction || koma.kind !== KomaKind.步兵
        })
        const attacked = board.getKoma( this.faction === Faction.Ou ? to.top() : to.bottom() )

        //打步诘
        const cannotCheckmate = !attacked || attacked.faction === this.faction || attacked.kind !== KomaKind.王将 && attacked.kind !== KomaKind.玉将
        return doesNotHaveSameColumnFuhyou && isNotOnLastLine && cannotCheckmate
    }
    get kind(){
        return KomaKind.步兵
    }
    get name(){
        return "步兵"
    }
}

export class Narito extends Kinshou {
    get kind(){
        return KomaKind.成步
    }
    get name(){
        return "成步"
    }
}