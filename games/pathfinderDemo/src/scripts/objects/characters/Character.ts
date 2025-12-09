import Kinematic from '../Kinematic'
import { Globals } from "../../helpers";
export default class Character extends Phaser.Physics.Arcade.Sprite {
    health: number;
    characterAttackDamage: number;

    rotation: number;
    kinematic : Kinematic
    characterSpeed : number;
    characterColor : string

    BOUNDS_WIDTH : number
    BOUNDS_HEIGHT : number

    needsRespawning : boolean
    activePlayer : boolean

    targetCharacters : Map<string, Character>
    pursuerCharacters : Map<string, Character>
    randomTargetKey : string

    name : string

    finalTarget : Phaser.Math.Vector2 | null
    pathTarget : Phaser.Math.Vector2 | null
    pathingAllowed : boolean
    path : Array<Phaser.Math.Vector2>
    //pathCalled : boolean
    pathIterator : number

    isStunned : boolean
    isPoisoned : boolean

    constructor(scene : Phaser.Scene, x : number, y : number, texture : string) {
        super(scene, x, y, texture)
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.rotation = 0;

        scene.physics.add.existing(this);
        this.scene.add.existing(this);

        this.setTexture(texture);

        this.health = 100
        this.characterAttackDamage = 20

        let characterPosition = new Phaser.Math.Vector2(this.x, this.y)
        this.kinematic = new Kinematic(characterPosition, 0)
        this.BOUNDS_HEIGHT = this.scene.registry.get('BOUNDS_HEIGHT')
        this.BOUNDS_WIDTH = this.scene.registry.get('BOUNDS_WIDTH')

        this.needsRespawning = false
        this.randomTargetKey = ''
        //this character is an active player in the game mode
        this.activePlayer = false
  
        this.targetCharacters = new Map
        this.pursuerCharacters = new Map

        this.characterSpeed = 100
        this.characterColor = texture.split("dude")[0]

        
        this.finalTarget = this.getRandomTarget()
        this.pathTarget = null
        this.path = new Array<Phaser.Math.Vector2>
        //this.pathCalled = false
        this.pathIterator = 0
        this.pathingAllowed = false

        this.isStunned = false
        this.isPoisoned = false
    }

    sceneReady(){
        
    }
    setPath(path : Array<Phaser.Math.Vector2>){
        //this.path = this.pathfinder.getPathXY(this.kinematic.position, target) //TODO uncomment when events is not used
        this.path = path
        //TODO need to make path with 45 angle entrances
        this.pathIterator = 0
        console.log("set path")
    }

     getRandomTarget(){
        return new Phaser.Math.Vector2(Math.random() * this.BOUNDS_WIDTH, Math.random() * this.BOUNDS_HEIGHT)
    }

    despawnCharacter(){

        this.needsRespawning = true
        if(Globals.currentTargetedNPC === this){
            if(Globals.targetLocked){
                console.log("despawned and target is no longer locked")
                Globals.targetLocked = false
            }
        }
        //set queues to zero
        //only if not team mode
        if(this.activePlayer){
            for(let targetChar of this.targetCharacters.values()){
                //each of this characters targets no longer have it chasing it
                targetChar.pursuerCharacters.delete(this.name)
                if(targetChar.pursuerCharacters.size <= 0){
                    Globals.eventsCenter.emit('character-needs-pursuer', targetChar.name)
                }
                
            }
            for(let pursuerChar of this.pursuerCharacters.values()){
                pursuerChar.targetCharacters.delete(this.name)
                //hopefully this takes care of getting your target poached and having to get another randomtargetkey
                pursuerChar.randomTargetKey = ''
                if(pursuerChar.pursuerCharacters.size <= 0){
                    Globals.eventsCenter.emit('character-needs-target', pursuerChar.name)
                }
                
            }
            this.targetCharacters.clear()
            this.pursuerCharacters.clear()
            //TODO need to set to-1 when killing targets or losing them to someone else as well
            this.randomTargetKey = ''
            if(this.name == "player"){
                Globals.eventsCenter.emit('UI-set-targetIcon', 'unknown_target')
            }
            
            //wondering if i should only do this for active players
            this.scene.time.delayedCall(6000, () => {
                //send respawn call after 6000 seconds, respawner should be called within a second after
                Globals.eventsCenter.emit('character-needs-respawn', this.name)
                //this.play('idle_anim'); // back to idle/walk
            });
            
        }
        //else this is an npc
        this.disableBody(false, true)
    }
    
    respawnCharacter(position : Phaser.Math.Vector2){
        let x = position.x
        let y = position.y
        this.enableBody(true,x,y,true,true)
        this.needsRespawning = false
        if(this.activePlayer){
            Globals.eventsCenter.emit('character-needs-pursuer', this.name)
            Globals.eventsCenter.emit('character-needs-target', this.name)
        }

    }

    setTargetCharacter(target : Character){

        this.targetCharacters.set(target.name, target)
        if(this.name == "player"){
            //player specific target stuff, including UI change
            //let randomKey = this.getRandomTargetKey()
            //this.scene.registry.set('playerTarget', this.targetCharacters[randomKey].characterColor)
            Globals.uiTargetCharacters = this.targetCharacters
            Globals.eventsCenter.emit('UI-set-targetIcon', this.targetCharacters.get(target.name)!.texture.key)
        }
        else{
            
        }
        
    }

    getRandomTargetKey(){
        const keys = Array.from(this.targetCharacters.keys());
        const randomIndex = Math.floor(Math.random() * this.targetCharacters.size);
        return keys[randomIndex]
    }
    setPursuerCharacter(pursuer : Character){

        this.pursuerCharacters.set(pursuer.name, pursuer)
        if(this.name == "player"){
            Globals.uiPursuerCharacters = this.pursuerCharacters
        }
    }

    getStunned(duration : number, stunnedByName : string){
        this.isStunned = true
        // Play stun animation
        //this.play('stunned_anim');
        if(Globals.currentTargetedNPC === this){
            if(Globals.targetLocked){
                console.log("got stunnedsa and target is no longer locked")
                Globals.targetLocked = false
            }
        }
        //clearing target characters from stunned player, they need to re target again
        if(this.name == "player"){
            Globals.eventsCenter.emit('UI-set-targetIcon', 'unknown_target')
        
        }
        this.targetCharacters.delete(stunnedByName)
        this.randomTargetKey = ''
        if(this.targetCharacters.size <= 0){
            Globals.eventsCenter.emit('character-needs-target', this.name)
        }
        
        // After duration, recover
        this.scene.time.delayedCall(duration, () => {
            this.isStunned = false;
            //this.play('idle_anim'); // back to idle/walk
        });
    }

    getPoisoned(duration : number, poisonedByName : string){
        if(this.isStunned){
            //can't also be poisoned while stunned on the ground
        }
        else{
            this.isPoisoned = true
            // After duration, recover
            this.scene.time.delayedCall(duration, () => {
                //delayed action
                this.isPoisoned = false;
                if(!this.needsRespawning){
                    //successful poisoning kill, give poisoner points
                    this.despawnCharacter()
                    //normal kill points
                    Globals.eventsCenter.emit('add-score-for-character', this.name, 100)
                    //poison bonus
                    Globals.eventsCenter.emit('add-score-for-character', poisonedByName, 150)
                }
                else{
                    //someone else poached kill (therefore needed respawning)
                    //give this person poacher points?
                }

                //this.play('idle_anim'); // back to idle/walk
            });
        }
    }

    killThisCharacter(actionableCharacter : Character){
        console.log("killed target character: " + actionableCharacter.name)
        if(actionableCharacter.isStunned){
            //kill during stun is half points
            Globals.eventsCenter.emit('add-score-for-character', this.name, 50)
        }
        else{
            //normal kill
            Globals.eventsCenter.emit('add-score-for-character', this.name, 100)
        }
        //has to go after is stunned check
        actionableCharacter.despawnCharacter()
    }

    executedAction(actionableCharacter : Character){
        //check if null
        if(actionableCharacter){
            if(this.targetCharacters.has(actionableCharacter.name)){
                //this attacked a targeter
                //add at least 150 to score, different modifiers affect score
                //killed a target character
                this.killThisCharacter(actionableCharacter)
                //delete character from target characters and check if needs target
                //this.targetCharacters.delete(actionableCharacter.name) //already taken care of in the despawn for loop checking pursuers
                if(this.targetCharacters.size <= 0){
                    if(this.name == "player"){
                        Globals.eventsCenter.emit('UI-set-targetIcon', 'unknown_target')
                    }
                    Globals.eventsCenter.emit('character-needs-target', this.name)
                }
                
            }
            else if(this.pursuerCharacters.has(actionableCharacter.name)){
                //not already stunned, can't just keep stunning for points when already stunned
                if(!actionableCharacter.isStunned){
                    //this is a valid block to a pursuer
                    //add 200 to score for block
                    console.log("blocked character: " + actionableCharacter.name)
                    //remove this pursuer character from the pursuer character Map
                    this.pursuerCharacters.delete(actionableCharacter.name)
                   
                    //if this player has zero pursuers, add to needs pursuer queue
                    if(this.pursuerCharacters.size <= 0){
                        Globals.eventsCenter.emit('character-needs-pursuer', this.name)
                    }
                    actionableCharacter.getStunned(8000, this.name) //TODO!!! some sort of timer check to see how close if other character also tried to kill within a timeframe
                    Globals.eventsCenter.emit('add-score-for-character', this.name, 200)
                }

            }
            else{
                //this hit an npc that isn't in targeters or pursuers, despawn this npc with no points
                //check if enemy or npc, 
                if(actionableCharacter.activePlayer){
                    //if enemy do nothing (Ui probably shouldn't even be visible for them)
                }
                else{
                    //if NPC despawn the NPC, emit lose target, send it back to the target queue
                    actionableCharacter.despawnCharacter()
                    //lose your target if you kill an npc and only have one target
                    if(this.targetCharacters.size <= 1){
                        for(let targetChar of this.targetCharacters.values()){
                            //remove the one element from pursuer characters of the target
                            targetChar.pursuerCharacters.delete(this.name)
                            Globals.eventsCenter.emit('character-needs-pursuer', targetChar.name)
                        }
                        this.targetCharacters.clear()
                    }
                    if(this.targetCharacters.size <= 0){
                        if(this.name == "player"){
                            Globals.eventsCenter.emit('UI-set-targetIcon', 'unknown_target')
                        }
                        Globals.eventsCenter.emit('character-needs-target', this.name)
                    }
                }
                
            }
        }

    }



    rotateMap90(){
        //rotate sprite 90 degrees
        //rotate sprite around the map center to create a new x and y coordinates
        //reset path, npcs need to find the same target cell even with rotation of map, change path to new coords
        //maybe find the path and translate each waypoint across a 90 degree rotation of map

        //90 deg : x = width - y - 1 , y =x
        //180 deg : x = width - x - 1, y = height - y - 1
        //270 x = y, y = height - x - 1
        this.rotation = this.rotation + Math.PI/2
    }
}