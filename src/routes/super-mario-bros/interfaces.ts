
export interface Vec2 {
    x:number,
    y:number,
} 

export interface RenderObject {
    texture: string,
    sizex: number,
    sizey: number
}

export interface UpdateObject {
    update():void
}

// export interface AnimationObject {
//     animation(time:number):void
// }