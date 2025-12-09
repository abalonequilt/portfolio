

import Grid from '../pathfinding/Grid'
import Kinematic from '../Kinematic'
import Character from './Character'
import { Globals, constrainAngle45Degrees} from "../../helpers";

export default class NPCOne extends Character {

  health: number;
  overlappingPlayer: boolean;
  npcActive : boolean
  randomSmallNumberForPath : number

  constructor(scene : Phaser.Scene, x : number, y : number, texture : string) {
    super(scene, x, y, texture)
    this.x = x;
    this.y = y;
    this.scene = scene;
    this.health = 100.0;
    
    scene.physics.add.existing(this);
    this.scene.add.existing(this);
    this.setTexture(texture);
    this.setPushable(false);

    this.overlappingPlayer = false;

    this.npcActive = false
    this.randomSmallNumberForPath = 5
  } 
  
  override update(): void{

    if(this.health <= 0){
      //TODO do something about death animation before destroying object
      //destroy object upon death
      console.log(this.name + " is destroyed");
      //this.destroy();
    }
    if(this.npcActive){
        
    }
 
    //this.seekPlayer()
    //this.setPathTarget()
    
    this.kinematic.position = new Phaser.Math.Vector2(this.x, this.y)
    this.kinematic.orientation = this.rotation

  }

  oneSecondCall(){
    //this.pathCalled = false
    if(this.npcActive){
        this.pathingAllowed = true
    }
    
    /*
    for(let i = 0; i < this.path.length; i++){
      let x = this.path[i].x
      let y = this.path[i].y
      console.log("x: " + x.toString() + " y: " + y.toString())
    }
    */
    
  }

  setPathTarget(){
    if(this.path.length > this.pathIterator){
      //don't remember the logic here, should it be <= 2 or <= 1
      if(this.path.length <= 1){
         // RETARD
        return
      }
      if(this.pathIterator == 0){
        this.pathIterator += 1
        this.pathTarget = this.path[this.pathIterator]
        this.setNPCAngle(this.pathTarget)
      }
      if(this.pathTarget){
        //follow
        let direction = this.calculateDirToPoint(this.pathTarget);
        //console.log("direction : " + direction.x + "y :" + direction.y)
        //console.log(direction.toString());
        let distance = this.getDistanceToPoint(this.pathTarget);
        //TODO this small number could be the reason things bump into walls if that's an issue
        this.randomSmallNumberForPath = Math.random() * 17 + 15 //should probably be less than spritePixels/2
        if(distance > this.randomSmallNumberForPath){
    
          //TODO!!! constrain direction in 45 degree increments
          this.setVelocityWithDir(direction, this.characterSpeed)       //RETARD
          
        }
        else{ 
          this.pathIterator +=1  //Remove RETARD if above while loop gets uncommented
        
          if(this.path.length > this.pathIterator){
            this.pathTarget = this.path[this.pathIterator] //Remove RETARD if above while loop gets uncommented

            //console.log("changing target : " + "x: " + this.pathTarget.x + ", y: " + this.pathTarget.y)
            this.setNPCAngle(this.pathTarget) //RETARD
            
          }
          else{
            this.setVelocityWithDir(Phaser.Math.Vector2.ZERO, 0)
          }
          
          if(this.pathIterator === this.path.length -1){
            //do nothing
            this.setVelocityWithDir(Phaser.Math.Vector2.ZERO, 0)
          }
        }
      }

    }


  }


   setNPCAngle(target : Phaser.Math.Vector2){
    //TODO fix this
    let angleToTarget = Phaser.Math.Angle.Between(this.x,this.y, target.x, target.y)
    
    let npcAngle = this.rotation

    //angleToTarget = Phaser.Math.Angle.Normalize(angleToTarget)
    npcAngle = constrainAngle45Degrees(angleToTarget)
    /*
    if(this.targetCharacters[0].name === "player"){
      console.log("this player is : " + this.characterColor)
        console.log("angle to target : " + angleToTarget/Math.PI  + " *Math.PI")
        console.log("untouched rotation is : " + this.rotation/Math.PI + " * Math.PI")
        console.log("npc angle: " + npcAngle/Math.PI  + " *Math.PI")
        //angleToTarget = Phaser.Math.Angle.Wrap(angleToTarget)

        console.log("wrapped npc angle + pi/2: " + Phaser.Math.Angle.Wrap(npcAngle + Math.PI/2) /Math.PI  + " *Math.PI")
    }
    */
    let newAngle = Phaser.Math.Angle.Wrap(npcAngle + Math.PI/2)
    if(this.rotation !== newAngle ){
        this.rotation = newAngle
    }
    
  }

  seekPlayer(){
    //follow
    let direction = this.calculateDirToTarget();
    //console.log(direction.toString());
    let distance = this.getDistanceToPlayer();
    if(distance > 100){
      this.setVelocityWithDir(direction, this.characterSpeed)
    }
    else{
      this.setVelocity(0,0);
      //set new target
      this.finalTarget = this.getRandomTarget();

    }
  }
  

  getHit(damage){
    this.health -= damage;
  }

  attackPlayer(){
    //TODO play attack animation
    //if overlapping with player
    if(this.targetCharacters.size > 0){
      if(this.overlappingPlayer){
        //this.targetCharacters.health -= this.damagePerAttack;
      }
    }

  }

  calculateDirToPoint(point : Phaser.Math.Vector2): Phaser.Math.Vector2{
        //get direction vector from enemy to player
    const direction = new Phaser.Math.Vector2(
      point.x - this.x,
      point.y - this.y,
    ).normalize();

    return direction;
  }

  getDistanceToPoint(point : Phaser.Math.Vector2): number{
    let distance = Phaser.Math.Distance.Between(this.x, this.y, point.x, point.y);
    return distance;
  }

  //move enemy toward player
  setVelocityWithDir(direction : Phaser.Math.Vector2, speed:number){
    let velocity = new Phaser.Math.Vector2(direction.x*speed, direction.y * speed)
    this.kinematic.velocity = velocity
    this.setVelocity(velocity.x, velocity.y)
  }

  calculateDirToTarget() : Phaser.Math.Vector2{
    if(this.targetCharacters.size > 0){
      let playerVector = new Phaser.Math.Vector2(this.targetCharacters.get(this.randomTargetKey)!.x, this.targetCharacters.get(this.randomTargetKey)!.y)
      return this.calculateDirToPoint(playerVector);
    }
    else{
      let playerVector = new Phaser.Math.Vector2(this.x, this.y)
      return this.calculateDirToPoint(playerVector);
    }

  }
  getDistanceToPlayer(): number{
    if(this.targetCharacters.size > 0){
      let playerVector = new Phaser.Math.Vector2(this.targetCharacters.get(this.randomTargetKey)!.x, this.targetCharacters.get(this.randomTargetKey)!.y)
      return this.getDistanceToPoint(playerVector)
    } 
    else{
      let playerVector = new Phaser.Math.Vector2(this.x, this.y)
      return this.getDistanceToPoint(playerVector);
    }
  }

  selectSprite(inPlayerTargetPursuerMaps : boolean){
      // Example selection effect: add green tint
      //sprite.setTint(0x00ff00);

      // Save reference if you want to track selected sprite
      //this.selected = sprite;
      //maybe only have the ability to select sprites that are NPCs, active players in this.player's target or pursuer map
      if(!this.activePlayer || inPlayerTargetPursuerMaps){
        Globals.currentTargetedNPC = this
        Globals.targetLocked = true
        console.log('Selected:', this.texture.key);
      }

  }
// 
}