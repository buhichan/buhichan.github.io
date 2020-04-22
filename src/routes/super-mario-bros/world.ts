import { MapObject } from "./map-object";
import { RenderObject, UpdateObject } from "./interfaces";
import { Character } from "./character";


type Collision = {
    obj1: MapObject,
    obj2: MapObject,
    char: Character
}

function collisionDetection(characters:MapObject[], objects:MapObject[]):Collision[]{
    let collisions = []
    this.characters.forEach(char=>{
        
        if(char.speed.y < 0){
            //falling 
            const collideWith = this.objects.find(obj=>{
                return (
                    char.position.x >= obj.position.x && 
                    char.position.x <= obj.position.x + obj.sizex &&
                    char.position.y >= obj.position.y + obj.sizey &&
                    char.position.y - obj.position.y + obj.sizey <= 0
                )
            })

            if(currentStandOnObject){
                char.speed.y = 0
                char.position.y = currentStandOnObject.position.y + currentStandOnObject.sizey
            }
        }else if(char.speed.y > 0){

        }else{

        }

        char.update()
    })
    return collisions
}

export class Scene implements RenderObject, UpdateObject {
    objects: MapObject[]
    characters: Character[]
    get texture(){
        return ""
    }
    get sizex(){
        return 100
    }
    get sizey(){
        return 10
    }
    update(){
        this.characters.forEach(char=>{
            
            if(char.speed.y < 0){
                //falling 
                const currentStandOnObject = this.objects.find(obj=>{
                    return (
                        char.position.x >= obj.position.x && 
                        char.position.x <= obj.position.x + obj.sizex &&
                        char.position.y >= obj.position.y + obj.sizey &&
                        char.position.y - obj.position.y + obj.sizey <= 0
                    )
                })
    
                if(currentStandOnObject){
                    char.speed.y = 0
                    char.position.y = currentStandOnObject.position.y + currentStandOnObject.sizey
                }
            }else if(char.speed.y > 0){

            }else{

            }

            char.update()
        })
    }
}

export class Stage {
    private scene1: Scene
    private scene2: Scene
    currentScene = this.scene1
    switchScene(){
        this.currentScene = this.currentScene === this.scene1 ? this.scene2 : this.scene1
    }
}