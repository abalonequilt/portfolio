var playerAngle;
var playerAdjustedAngle;
var playerForwardX;
var playerForwardY;
var playerForwardVector;
var playerSpeed; 
var spaceKey;
var spaceHeldTime = 0;
var spacePressedAt = -1;
var gameOver = false;

import Enemy from './Enemy'
import Character from './Character'
import PlayGameScene from '../../scenes/PlayGameScene'
import { Globals } from "../../helpers";

export default class Player extends Character {
    isOverlappingEnemy : boolean;
    attack : boolean;
    physicsEnemiesGroup : Phaser.Physics.Arcade.Group; //Array<Enemy>;
    enemiesSpriteDictionary: Map<string,Enemy>;
    currentOverlappingEnemies : Set<Enemy>;
    newOverlappingEnemies : Set<Enemy>;
    rotation: number;
    cursors
    wasd

    constructor(scene : PlayGameScene, x : number, y : number, texture : string, playerColor: string ) {
        super(scene, x, y, texture)
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.rotation = 0;

        scene.physics.add.existing(this);
        this.scene.add.existing(this);

        this.setTexture(texture);
        
        this.health = 100.0;
        this.isOverlappingEnemy = false;
        this.attack = false;
        this.characterAttackDamage = 110;
        this.characterSpeed = 110;
        this.name = 'player'

        spaceKey = scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.cursors = scene.input.keyboard?.createCursorKeys();
        this.wasd = scene.input.keyboard?.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });
        this.setCollideWorldBounds(true);
        
        this.currentOverlappingEnemies = new Set<Enemy>();
        this.newOverlappingEnemies = new Set<Enemy>();
        this.physicsEnemiesGroup = this.scene.physics.add.group();
        this.enemiesSpriteDictionary = new Map; 
        this.characterColor = playerColor
        Globals.playerColor = this.characterColor
        this.activePlayer = true

    } 

    override sceneReady(){
        Globals.eventsCenter.emit('character-needs-pursuer', this.name)
        Globals.eventsCenter.emit('character-needs-target', this.name)
    }

    setEnemies(physicsEnemiesGroup, enemySpritesDictionary): void{
        this.physicsEnemiesGroup = physicsEnemiesGroup;
        this.enemiesSpriteDictionary = enemySpritesDictionary;
    }

    oneSecondCall(){
        /*
        if(this.pursuerCharacter != null){
            console.log("player being pursuerd by " + this.pursuerCharacter.name + ', ' + this.pursuerCharacter.characterColor)
        }
        if(this.targetCharacter != null){
            console.log("player chasing " + this.targetCharacter.name + ", " + this.targetCharacter.characterColor)
        }
        */

    }

    override update(): void{
        //let rotateRadian = 0.035;
        this.kinematic.position = new Phaser.Math.Vector2(this.x, this.y)
        this.kinematic.orientation = this.rotation


        if(this.isStunned){
            this.setVelocity(0, 0); // stop moving
            return; // skip movement logic
        }

        this.getTargetDirectionsAndAngles()

        playerAngle = this.rotation;
        playerAdjustedAngle = playerAngle - Phaser.Math.DegToRad(90);
        playerForwardX = Math.cos(playerAdjustedAngle);
        playerForwardY = Math.sin(playerAdjustedAngle);
        playerForwardVector = new Phaser.Math.Vector2(playerForwardX, playerForwardY);

        //const velocityVector =  player.velocity;
        const time = this.scene.time.now;
        if(this.health <= 0){
            this.needsRespawning = true
        }
        if(this.physicsEnemiesGroup != null){
            //probably need to typecheck for phaser.gameobjects
            //can use this.currentOverlappingEnemies after this call
            this.checkOverlap();
        }
        //console.log("made it past check overlap");
        if (this.cursors.space.isDown && spacePressedAt != -1)
        {
            //space key is being held
            this.anims.play('space', true);
            //console.log("pressed space");
            spaceHeldTime = time - spacePressedAt;

            if(spaceHeldTime < 200){
                //send enemy flying, less than 200 ms hold 
                //probably do something with the animation in the 200 ms
            }
            else{
                //probably do something trickywith the animation in the 200 ms TODO
                //hold hostage
            }
        }
        if(Phaser.Input.Keyboard.JustDown(spaceKey)){
            //first press of space key
            spacePressedAt = time;
            this.pressedActionButton()
        }
        if(Phaser.Input.Keyboard.JustUp(spaceKey)){
            //Space Key Released 

           console.log('Final held time:', spaceHeldTime.toFixed(2), 'ms');
           if(spaceHeldTime < 200){
                if(this.isOverlappingEnemy){
                    //send enemy flying, less than 200 ms hold 
                    this.attack = true;
                    //can use this.currentOverlappingEnemies at this point
                    this.attackOverlappingEnemies();
                }

            }
            else{
                //hold hostage
            }

 
           spaceHeldTime = 0;
           spacePressedAt = -1;

           //initiate attack method, especially if there is an enemy overlapping with collider
           //TODO
        }
        else if(this.cursors.left.isDown || this.cursors.right.isDown || this.cursors.up.isDown || this.cursors.down.isDown ||
                this.wasd.left.isDown || this.wasd.right.isDown || this.wasd.up.isDown || this.wasd.down.isDown){

            this.anims.play('up', true);
            /*
            if (cursors.left.isDown)
            {
                //player.setVelocityX(forwardVector.x *  speed/2);
                this.rotation -= rotateRadian;
                //player.anims.play('left', true);
            }
            if (cursors.right.isDown)
            {
                //player.setVelocityX(forwardVector.x * speed/2);
                this.rotation += rotateRadian;
                //player.anims.play('right', true);
            }
            if (cursors.up.isDown)
            {
                
                this.setVelocity(playerForwardVector.x * this.playerSpeed, playerForwardVector.y * this.playerSpeed);
                this.anims.play('up', true);
            }
            
            if (cursors.down.isDown)
            {
                this.setVelocity(playerForwardVector.x * -1 * this.playerSpeed, playerForwardVector.y * -1* this.playerSpeed);
                //player.anims.play('down', true);
            }*/
            if(this.cursors.right.isDown && this.cursors.up.isDown || this.wasd.right.isDown && this.wasd.up.isDown){
                this.rotation = Math.PI/4;
            }
            else if(this.cursors.right.isDown && this.cursors.down.isDown || this.wasd.right.isDown && this.wasd.down.isDown){
                this.rotation = 3* Math.PI/4;
            }
            else if(this.cursors.left.isDown && this.cursors.down.isDown || this.wasd.left.isDown && this.wasd.down.isDown){
                this.rotation = 5* Math.PI/4;
            }
            else if(this.cursors.left.isDown && this.cursors.up.isDown || this.wasd.left.isDown && this.wasd.up.isDown){
                this.rotation = 7* Math.PI/4;
            }
            else if (this.cursors.left.isDown || this.wasd.left.isDown)
            {
                //player.setVelocityX(forwardVector.x *  speed/2);
                this.rotation = 3*Math.PI/2;
                //player.anims.play('left', true);
            }
            else if (this.cursors.right.isDown || this.wasd.right.isDown)
            {
                //player.setVelocityX(forwardVector.x * speed/2);
                this.rotation = Math.PI/2;
                //player.anims.play('right', true);
            }
            else if (this.cursors.up.isDown || this.wasd.up.isDown)
            {
                
                this.rotation = 0;
                this.anims.play('up', true);
            }
            
            else if (this.cursors.down.isDown || this.wasd.down.isDown)
            {
                this.rotation = Math.PI;
         
                //player.anims.play('down', true);
            }
            this.setVelocity(playerForwardVector.x * this.characterSpeed, playerForwardVector.y * this.characterSpeed);
        }
        else
        {
            this.setVelocityX(0);
            this.setVelocityY(0);

            this.anims.play('turn');
        }
    }

    getTargetDirectionsAndAngles(){
        
        //used in progress circle, get direction and angle to targets
        if(this.targetCharacters.size > 0){
            let distanceToTargets = new Array<number>
            let angleToTargets = new Array<number>
            //making sure the size of the arrays match up
            if(Globals.distanceToTargets.length < this.targetCharacters.size){
                while(Globals.distanceToTargets.length < this.targetCharacters.size){
                    Globals.distanceToTargets.push(0)
                }
            }
            if(Globals.angleToTargets.length < this.targetCharacters.size){
                while(Globals.angleToTargets.length < this.targetCharacters.size){
                    Globals.angleToTargets.push(0)
                }
            }
            //sets the angles and distance arrays up
            let i = 0
            for(let [key,value] of this.targetCharacters){
                let dist = Phaser.Math.Distance.Between(
                    this.x, this.y,
                    value.x, value.y
                )
                let angle = Phaser.Math.Angle.Between(
                    this.x, this.y,
                    value.x, value.y
                )

                //angle = Phaser.Math.Angle.Wrap(angle + Math.PI/2)
                Globals.distanceToTargets[i] = dist
                Globals.angleToTargets[i] = angle 
                //add 1 to i counter
                i++
            }

        }
    }


    pressedActionButton(){
        //pressed action button/space bar
        this.executedAction(Globals.currentTargetedNPC)
    }

    checkOverlap(): void{
        let isOverlapping = false;
        // Check for current overlaps with each enemy
        this.physicsEnemiesGroup.getChildren().forEach((enemy: Phaser.GameObjects.GameObject) => {
            isOverlapping = this.scene.physics.overlap(this, enemy);
            var enemySprite = this.enemiesSpriteDictionary.get(enemy.name);
            if(enemySprite){
                if (isOverlapping) {
                    this.newOverlappingEnemies.add(enemySprite);
                    if (!this.currentOverlappingEnemies.has(enemySprite)) {
                        console.log('Started overlapping with enemy:', enemy.name || enemy);
                        enemySprite.overlappingPlayer = true;
                    }
                } else {
                    if (this.currentOverlappingEnemies.has(enemySprite)) {
                        console.log('Stopped overlapping with enemy:', enemy.name || enemy);
                        enemySprite.overlappingPlayer = false;
                    }
                }
            }

            isOverlapping = false;
        });
        

        // Replace old overlap set
        this.currentOverlappingEnemies.clear();
        this.newOverlappingEnemies.forEach(element => {
            this.currentOverlappingEnemies.add(element);
        });
        this.newOverlappingEnemies.clear();
        
        if(this.currentOverlappingEnemies.size == 0){
            //need to account for multiple overlaps TODO
            this.isOverlappingEnemy = false;
        }

        //this.currentOverlappingEnemies = this.newOverlappingEnemies;
    }

    handleSingleOverlap(){

    }
    clearOverlappingEnemiesSet(): void{
        if(this.currentOverlappingEnemies.size != 0){
            this.currentOverlappingEnemies.clear();
        }
        
    }
    attackOverlappingEnemies (): void
    {
        if (this.attack) {
            console.log("OVERLAP ATTACK");
            this.currentOverlappingEnemies.forEach(enemy => {
                if(enemy.active){
                    enemy.getHit(this.characterAttackDamage); //  subtract health
                    console.log('Enemy defeated!');
                }
            });
            // Or subtract health, play animation, etc.

           
            //  Add and update the score
            //score += 10;
            //scoreText.setText('Score: ' + score);
        }

        /*
        if (enemies.countActive(true) === 0)
        {
            //  A new batch of stars to collect
            enemies.children.iterate(function (child) {

                child.enableBody(true, child.x, child.y, true, true);

            });

            var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        }
        */
    }
  }