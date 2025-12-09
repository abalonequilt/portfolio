
import NPCOne from './NPCOne'
import Grid from '../pathfinding/Grid'
import { Globals } from "../../helpers";


export default class Enemy extends NPCOne {

  constructor(scene : Phaser.Scene, x : number, y : number, texture : string) {
    super(scene, x, y, texture)
    this.npcActive = true
    this.activePlayer = true
    this.pathingAllowed = true

    
  } 
  override sceneReady(){
    Globals.eventsCenter.emit('character-needs-pursuer', this.name)
    Globals.eventsCenter.emit('character-needs-target', this.name)
  }

  override update(): void{

    if(this.isStunned){
      this.setVelocity(0, 0); // stop moving
      return; // skip movement logic
    }
    if(this.npcActive){
      if(this.pathingAllowed){
        //this gets reseat by onesecondcall, but runs in update to make the pathing smooth
        //necessary to have a boolean
        if(this.targetCharacters.size > 0){
          //this.seekPlayer()
          this.setPathTarget() //RETARD
          /*
          if(this.targetCharacters[0].name == "player"){
            console.log("path length is : " + this.path.length)
            //this.x = 14 * 64  //RETARD
            //this.y = 10 * 64 //RETARD
          }
          */
        }
        
     }
    }
    //TODO need deltatime between updates Phaser.Core.TimeStep
    this.kinematic.position = new Phaser.Math.Vector2(this.x, this.y)
    this.kinematic.orientation = this.rotation
    //console.log('update')
  }

  oneSecondCall(){
    //this.pathCalled = false

    if(this.npcActive){
      if(this.pathingAllowed){
        //this gets reseat by onesecondcall, but runs in update to make the pathing smooth
        //necessary to have a boolean
        if(this.randomTargetKey !== '' && this.targetCharacters.size == 0){
          this.randomTargetKey = ''
        }
        if(this.targetCharacters.size > 0){
          if(this.randomTargetKey == ''){
            //TODO this is gonna get messy
            this.randomTargetKey = this.getRandomTargetKey()
          }
          let targetPosition
          try{
            targetPosition = new Phaser.Math.Vector2(this.targetCharacters.get(this.randomTargetKey)!.x, this.targetCharacters.get(this.randomTargetKey)!.y)

          }catch(error){
            console.log("something went wrong:", error)
            console.log("random target key: " + this.randomTargetKey)
            console.log("this current enemy is : " + this.name + ", color is: " + this.characterColor)
          }
          //doing this to pause execution
          //console.log("emithing pathfinding event")
          Globals.eventsCenter.emit('request-pathfindingXY-for-character', this.name, this.kinematic.position, targetPosition)
          
        }
        else{
             
        }
      }
    }

  }
  
}