
import * as React from "react"
import {Board} from "./board"
import { MAX_SIZE, Coord, Move, Faction, MoveResult, MoveUchikomu } from "./interfaces"
import { Koma } from "./koma"

type Props = {

}

export default function Shougi (props:Props){

    const [selected, setSelected] = React.useState(null as null | Coord)

    const [moves, setMoves] = React.useState([] as Move[])

    const board = React.useMemo(()=>{
        const b = new Board()
        b.init()
        return b
    },[])

    const [turn, setTurn] = React.useState(Faction.Ou);

    const [_a, _b] = React.useState(0)

    const [uchikomu, setUchiKomu] = React.useState(null as null | Koma)

    const refresh = ()=>{
        _b(_a+1)
    }

    return <>
        <p>
            当前回合: 「{turn === Faction.Ou ? "王将" : "玉将"}」
        </p>
        <div style={{width: 50 * MAX_SIZE }}>
            {
                new Array(MAX_SIZE).fill(0).map((_,revI)=>{
                    const i = MAX_SIZE - 1 - revI
                    return <div key={i} style={{display:"flex"}}>
                        {
                            new Array(MAX_SIZE).fill(0).map((_,j)=>{
                                const coord = Coord.newCoord(j,i)
                                const koma = board.getKoma(coord)
                                const legalMove = uchikomu && !koma && uchikomu.canUchiKomu(coord, board) ? new MoveUchikomu(uchikomu, coord, coord) : moves.find(x=>x.to.eq(coord));

                                return <div onClick={()=>{
                                    if(legalMove){
                                        const moveResult = board.performMove(legalMove)
                                        switch (moveResult){
                                            case MoveResult.KO:{
                                                alert((turn === Faction.Ou ? "王将" : "玉将")+"方获胜!");
                                                board.init();
                                                setSelected(null)
                                                setMoves([])
                                                setTurn(turn === Faction.Ou ? Faction.Gyou : Faction.Ou);
                                                refresh()
                                                return;
                                            }
                                            case MoveResult.MayUpgrade:{
                                                if(confirm("是否升级棋子?")){
                                                    board.upgradeKoma(coord)
                                                }
                                            }
                                        }

                                        setSelected(null)
                                        setMoves([])
                                        setUchiKomu(null)
                                        setTurn(turn === Faction.Ou ? Faction.Gyou : Faction.Ou)
                                        refresh()
                                    }else if(koma && koma.faction === turn){
                                        setSelected(coord)
                                        const moves = koma.getPossibleMoves(coord,board)
                                        setMoves(moves)
                                        setUchiKomu(null)
                                    }
                                }} key={j} style={{
                                    display:"inline-flex", 
                                    border:".5px solid #999", 
                                    cursor:"pointer", 
                                    width: 50, 
                                    height:50, 
                                    transform: koma && koma.faction === Faction.Gyou ? "rotate(180deg)" : undefined,
                                    justifyContent:"center", 
                                    alignItems:"center",
                                    color: selected && selected.eq(coord) ? "#00f9" : undefined,
                                    background: !!legalMove ? "#0f03": undefined
                                }}>
                                    {
                                        koma && <KomaDisplay koma={koma} />
                                    }
                                </div>
                            })
                        }
                    </div>
                })
            }
        </div>
        <div>
            驹台:
            <div style={{width: 50 * MAX_SIZE / 2, display:"inline-block"}}>
                王:
                {
                    board.komadai[Faction.Ou].map((x,i)=>{
                        return <button onClick={()=>{
                            if(turn === Faction.Ou){
                                setUchiKomu(x)
                            }
                        }} key={i}>{x.name}</button>
                    })
                }
            </div>
            <div style={{width: 50 * MAX_SIZE / 2, display:"inline-block"}}>
                玉:
                {
                    board.komadai[Faction.Gyou].map((x,i)=>{
                        return <button onClick={()=>{
                            if(turn === Faction.Gyou){
                                setUchiKomu(x)
                            }
                        }} key={i}>{x.name}</button>
                    })
                }
            </div>
        </div>
    </>
}

function KomaDisplay({koma}:{koma:Koma}){
    const name = koma.name
    return <svg width={50} height={50} viewBox="0 0 50 50">
        <path stroke="#000" fill="transparent" d="M 5, 45 L 45, 45 L 40, 15 L 25 5 L 10, 15 L 5, 45" />
        <text textAnchor="middle" fontSize={16} x={25} y={24}>
            {name[0]}
        </text>
        <text textAnchor="middle" fontSize={16} x={25} y={42}>
            {name[1]}
        </text>
    </svg>
}