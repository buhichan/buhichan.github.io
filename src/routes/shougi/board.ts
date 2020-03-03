import { Faction, Coord, MAX_SIZE, Move, MoveKind, MoveResult, KomaKind, MoveMove, MoveEat, MoveUchikomu, UpgradeOption } from "./interfaces";
import { Koma, Kyousha, Keiba, Ginshou, Kinshou, Oushou, Kakugyou, Fuhyou, Hisha } from "./koma";



export class Board {
    komadai = {
        [Faction.Gyou]: [] as Koma[],
        [Faction.Ou]:[] as Koma[],
    }
    board = [] as Koma[]
    init(){
        this.komadai[Faction.Gyou] = []
        this.komadai[Faction.Ou] = []
        
        this.board = new Array(MAX_SIZE * MAX_SIZE).fill(null);
        this.board.splice(0, MAX_SIZE, 
            new Kyousha(Faction.Ou),
            new Keiba(Faction.Ou),
            new Ginshou(Faction.Ou),
            new Kinshou(Faction.Ou),
            new Oushou(Faction.Ou),
            new Kinshou(Faction.Ou),
            new Ginshou(Faction.Ou),
            new Keiba(Faction.Ou),
            new Kyousha(Faction.Ou),
        );
        this.board[MAX_SIZE + 1] = new Kakugyou(Faction.Ou);
        this.board[MAX_SIZE * 2 - 2] = new Hisha(Faction.Ou);
        this.board.splice(MAX_SIZE * 2, MAX_SIZE, 
            new Fuhyou(Faction.Ou),
            new Fuhyou(Faction.Ou),
            new Fuhyou(Faction.Ou),
            new Fuhyou(Faction.Ou),
            new Fuhyou(Faction.Ou),
            new Fuhyou(Faction.Ou),
            new Fuhyou(Faction.Ou),
            new Fuhyou(Faction.Ou),
            new Fuhyou(Faction.Ou),
        );
        this.board.splice(MAX_SIZE * (MAX_SIZE - 1), MAX_SIZE, 
            new Kyousha(Faction.Gyou),
            new Keiba(Faction.Gyou),
            new Ginshou(Faction.Gyou),
            new Kinshou(Faction.Gyou),
            new Oushou(Faction.Gyou),
            new Kinshou(Faction.Gyou),
            new Ginshou(Faction.Gyou),
            new Keiba(Faction.Gyou),
            new Kyousha(Faction.Gyou),
        );
        this.board[MAX_SIZE * (MAX_SIZE - 2) + 1] = new Hisha(Faction.Gyou);
        this.board[MAX_SIZE * (MAX_SIZE - 1) - 2] = new Kakugyou(Faction.Gyou);
        this.board.splice(MAX_SIZE * (MAX_SIZE - 3), MAX_SIZE, 
            new Fuhyou(Faction.Gyou),
            new Fuhyou(Faction.Gyou),
            new Fuhyou(Faction.Gyou),
            new Fuhyou(Faction.Gyou),
            new Fuhyou(Faction.Gyou),
            new Fuhyou(Faction.Gyou),
            new Fuhyou(Faction.Gyou),
            new Fuhyou(Faction.Gyou),
            new Fuhyou(Faction.Gyou),
        );
    }
    getKoma(coord: Coord): Koma | null {
        return this.board[coord.y * MAX_SIZE + coord.x]
    }
    private killKoma(coord: Coord): Koma{
        let koma = this.board[coord.y * MAX_SIZE + coord.x];
        if(!koma){
            throw new Error("Illegal Move!")
        }
        delete this.board[coord.y * MAX_SIZE + coord.x];
        koma = koma.downgrade()
        koma.faction = koma.faction === Faction.Gyou ? Faction.Ou : Faction.Gyou;
        this.komadai[koma.faction].push(koma)
        return koma
    }
    private moveKoma(from: Coord, to:Coord){
        this.board[to.y * MAX_SIZE + to.x] = this.board[from.y * MAX_SIZE + from.x]
        this.board[from.y * MAX_SIZE + from.x] = null
    }
    upgradeKoma(coord: Coord){
        const {to} = this.getKoma(coord).getPossibleUpgrade(coord);
        this.board[coord.y * MAX_SIZE + coord.x] = to;
    }
    performMove(move: Move): MoveResult {
        const koma = this.getKoma(move.from)

        let mayUpgrade = true;

        switch(true){
            case move instanceof MoveMove:{
                this.moveKoma(move.from,move.to);
                break;
            }
            case move instanceof MoveEat:{
                const killed = this.killKoma(move.to)
                this.moveKoma(move.from,move.to);
                if(killed.kind === KomaKind.玉将 || killed.kind === KomaKind.王将){
                    return MoveResult.KO
                }
                break;
            }
            case move instanceof MoveUchikomu:{
                mayUpgrade = false;
                const coord = move.to;
                const uchikomud = move.koma;
                if(!!this.board[coord.y * MAX_SIZE + coord.x]){
                    throw new Error("Invalid Action")
                }
                const komaIndex = this.komadai[uchikomud.faction].findIndex(x=>x.kind === uchikomud.kind)
                if(komaIndex === -1){
                    throw new Error("Invalid Action")
                }
                const [koma] = this.komadai[uchikomud.faction].splice(komaIndex, 1)
                this.board[coord.y * MAX_SIZE + coord.x] = koma
                break;
            }
        }

        if(mayUpgrade){
            const upgrade = koma.getPossibleUpgrade(move.to)
            if(upgrade.kind === UpgradeOption.MustUpgrade){
                this.upgradeKoma(move.to)
            }else if(upgrade.kind === UpgradeOption.MayUpgrade){
                return MoveResult.MayUpgrade
            }
        }
        return MoveResult.Nothing
    }
    createMove(koma: Koma, from:Coord, to: Coord | null) : null | Move {
        if(!to){
            return null
        }
        const target = this.getKoma(to)
        if(target){
            if(target.faction !== koma.faction){
                return new MoveEat(koma, from, to)
            }else{
                return null 
            }
        }else{
            return new MoveMove(koma, from, to)
        }
    }
}