
const spritePixels = 64;
import Player from '../objects/characters/Player'
import Enemy from '../objects/characters/Enemy'
import WaveManager from '../objects/WaveManager'
import MapGenerator from '../objects/MapGenerator'
import NPCManager from '../objects/NPCManager'
import GameManager from '../objects/GameManager';
import { Globals } from "../helpers";
import NPCOne from '../objects/characters/NPCOne';

export default class PlayGameScene extends Phaser.Scene {
    gameOver : boolean;
    player : Player;
    possible_colors : Object;
    player_color : string;
    playerName : string;
      //enemies: Phaser.Physics.Arcade.Group;
    mapGenerator: MapGenerator;
    waveManager: WaveManager;
    npcManager: NPCManager;
    gameManager : GameManager;
    BOUNDS_WIDTH : number;
    BOUNDS_HEIGHT : number;

    oneSecondTimer : Phaser.Time.TimerEvent
    fiveSecondTimer : Phaser.Time.TimerEvent
    wasd

    private map?: Phaser.Tilemaps.Tilemap
    private groundLayer?: Phaser.Tilemaps.TilemapLayer

    constructor() {
      super({ key: 'PlayGameScene' })
      let colors = ['brightmagenta', 'vividpurple','brightyellow', 'electricblue', 'hotpink', 'limegreen', 'neoncyan', 'orangered'];
      this.possible_colors = new Object; 
      for(let i = 0; i < colors.length; i++){
        this.possible_colors[colors[i]] = 0;
      }
      
      this.player_color = 'limegreen';
      this.playerName = this.player_color + 'dude';
      //set player color to 1
      this.possible_colors[this.player_color] = 1;
      //this.player = new Player(this, 0, 0, 'dude');
      this.gameOver = false;
      this.BOUNDS_HEIGHT = spritePixels;
      this.BOUNDS_WIDTH = spritePixels;
      
    }

    preload ()
    {
        
        //.load.image('sky', 'assets/img/sky.png');
        //this.load.image('ground', 'assets/img/platform.png');
        //this.load.image('ground', 'assets/img/platform.png');
        //this.load.image('star', 'assets/img/star.png');
        //this.load.image('bomb', 'assets/img/bomb.png');
        //this.load.spritesheet('dude', 'assets/img/dude.png', { frameWidth: 32, frameHeight: 48 });

        let name_string;
        for(let color_string in this.possible_colors){
           
            name_string = 'circle2eye_' + color_string + '_32px.png';
            this.load.spritesheet(color_string + 'dude', 'assets/img/sprites/' + name_string, { frameWidth: 32, frameHeight: 32 } );
        }
        
        this.load.image('wall_1', 'assets/img/wall_1.png');
        this.load.image('star', 'assets/img/star.png');

        //audio TODO!!
        //contract lost, one minute remaining, you have been stunned, whispers
        //load tile map data and images
        //this.load.tilemapTiledJSON('map', 'assets/isometric_red_tiles_atlas.json');
        //this.load.image('tiles', 'assets/isometric_red_tiles.png');

        this.load.json('map1', 'assets/maps_json/map1.json');
        //this.load.tilemapTiledJSON('map', 'assets/maps/map.json');
    }

    create ()
    {
   		// create map and tileset...
        // Create the map
        //this.map = this.make.tilemap({ key: "map" });

        /*
		// using a BlankDynamicLayer for procedural dungeon generation
		this.groundLayer = this.map.createBlankDynamicLayer('Ground', tileset)

		// generate ground tile layer procedurally...

		this.fov = new Mrpas(this.map.width, this.map.height, (x, y) => {
			const tile = this.groundLayer!.getTileAt(x, y)
			return tile && !tile.collides
		})

        */
        //Create the tile map
        //const map = this.make.tilemap({key:'map'});
        //const tileset = map.addTilesetImage('tilesetName', 'tiles');
        //const layer = map.createLayer('GroundLayer', tileset, 0, 0);

        //Set interactive tile
        //layer.setTileIndexCallback(1,this.hitTile,this);

        //  A simple background for our game
        //this.add.image( 400, 300, 'sky');


        //  Here we create the ground.

        // The player and its settings
        let map1 = this.cache.json.get('map1');
        this.mapGenerator = new MapGenerator(this, map1, spritePixels, spritePixels);
  
        //this needs to be done after mapgenerator gives rows and columns
        this.BOUNDS_HEIGHT = spritePixels* this.mapGenerator.rows;
        this.BOUNDS_WIDTH = spritePixels * this.mapGenerator.columns;
        
        this.registry.set('BOUNDS_HEIGHT', this.BOUNDS_HEIGHT) 
        this.registry.set('BOUNDS_WIDTH', this.BOUNDS_WIDTH)
        this.registry.set('spritePixels', spritePixels)
        
        this.physics.world.setBounds(0,0,Math.max(this.BOUNDS_WIDTH,this.BOUNDS_HEIGHT),Math.max(this.BOUNDS_WIDTH,this.BOUNDS_HEIGHT));
        
        

        this.scene.launch('PlayUIScene');
        //this.player = this.physics.add.sprite(100, 450, 'dude');

        //  Player physics properties. Give the little guy a slight bounce.
        //this.player.setBounce(0.2);


        //  Our player animations, turning, walking left and walking right.
        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers(this.playerName, { start: 0, end: 0}),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers(this.playerName, { start: 0, end: 0}),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [ { key: this.playerName, frame: 0 } ],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers(this.playerName, { start: 0, end: 0}),
            frameRate: 10,
            repeat: -1
        });


        
        let playerSpawnPoint = new Phaser.Math.Vector2(14 * spritePixels, 14 * spritePixels);
        this.player = new Player(this, playerSpawnPoint.x, playerSpawnPoint.y, this.playerName, this.player_color)
        this.player.setCollideWorldBounds(true);
        this.cameras.main.setBounds(0,0,Math.max(this.BOUNDS_WIDTH,this.BOUNDS_HEIGHT),Math.max(this.BOUNDS_WIDTH,this.BOUNDS_HEIGHT));
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(1.75);
        //Globals.gameplayCamera = this.cameras.main

        this.waveManager = new WaveManager(1, 7, this.player, this.mapGenerator.grid, this);
        this.npcManager = new NPCManager(this, 50, this.player, this.mapGenerator.grid, this.mapGenerator.gatheringCells);
        this.waveManager.spawn()
        //this.npcManager.spawn()


        var wallSprites = Array();
        for (let key in this.mapGenerator.wallSpritesDictionary) {
            if (this.mapGenerator.wallSpritesDictionary.hasOwnProperty(key)) {
                let sprite = this.mapGenerator.wallSpritesDictionary[key]
                wallSprites.push( sprite );
            }
        }
        console.log("wall sprites:" + wallSprites[0].texture.key);
        //add physics to wall sprites
        let wallSpritePhysicsGroup = this.physics.add.group();
        wallSpritePhysicsGroup.addMultiple(wallSprites);
        
        //this.enemies = this.waveManager.waveEnemies;
        this.player.setEnemies(this.waveManager.enemiesPhysicsGroup, this.waveManager.enemiesSpriteDictionary);
        //this.player.body?.setCircle(128, this.player.width/2 -128, this.player.height/2 - 128) //128 px radius, centered inside the sprite

        //scoreText.backgroundColor('#ffffff');
        //collide the player with the walls
        this.physics.add.collider(this.player, wallSpritePhysicsGroup);
        //  Collide the player and the stars with the enemies
        this.physics.add.collider(this.player, this.waveManager.enemiesPhysicsGroup);
   
        //collide the enemies with walls
        this.physics.add.collider(this.waveManager.enemiesPhysicsGroup, wallSpritePhysicsGroup);
        //collide the enemies with other enemies
        this.physics.add.collider(this.waveManager.enemiesPhysicsGroup, this.waveManager.enemiesPhysicsGroup);

                //  Collide the player and the stars with the enemies
        this.physics.add.collider(this.player, this.npcManager.npcPhysicsGroup);
   
        //collide the enemies with walls
        this.physics.add.collider(this.npcManager.npcPhysicsGroup, wallSpritePhysicsGroup);
        //collide the enemies with other enemies
        this.physics.add.collider(this.npcManager.npcPhysicsGroup,this.npcManager.npcPhysicsGroup);

        //between enemies and npcs

         this.physics.add.collider(this.npcManager.npcPhysicsGroup,this.waveManager.enemiesPhysicsGroup);

        //  Checks to see if the player overlaps with any of the enemies, if he does call the collectStar function
        //this.physics.add.overlap(this.player, this.waveManager.waveEnemies, this.player.attackEnemy, undefined, this);


        //have a gauge that fills when close to target kill for higher score
        //have ability to lock on target 
        //vary killis to get higher score

        //needs Respawn
        //leave game maanger down here, waveManager.sprites dictionary was empty for some reason
        this.gameManager = new GameManager(this.waveManager, this.npcManager, this.player, this.mapGenerator.grid)

        Globals.eventsCenter.on('character-needs-respawn',(characterName) => {
            this.gameManager.addRespawnQueue(characterName)
        });
        Globals.eventsCenter.on('character-needs-pursuer',(characterName) => {
            this.gameManager.addPursuerQueue(characterName)
        });
        Globals.eventsCenter.on('character-needs-target',(characterName) => {
            this.gameManager.addTargetQueue(characterName)
        });

        Globals.eventsCenter.on('add-score-for-character',(characterName, addedScore) => {
            this.gameManager.addScoreForCharacter(characterName, addedScore)
        });

        Globals.eventsCenter.on('request-pathfindingXY-for-character',(characterName, start, target) => {
            this.gameManager.pathfindingXYRequested(characterName, start, target)
        });

        Globals.eventsCenter.on('UI-ready-to-receive',() => {
            this.UIsceneReadyToReceive()
        });

        
        this.events.on(Phaser.Scenes.Events.CREATE, () => {
            this.sceneReady()// works, because closure captures it
        });

        //this is buggy, constructur of game manager isn't initialized yet for some reason
        this.oneSecondTimer = this.time.addEvent({
            callback: this.oneSecondUpdate,
            callbackScope: this,
            delay: 1000,
            loop: true
        })

        this.fiveSecondTimer = this.time.addEvent({
            callback: this.fiveSecondUpdate,
            callbackScope: this,
            delay: 4000,
            loop: true
        })
        console.log("end of scene create");

    }
    sceneReady(){
        
        for(let character of this.waveManager.enemiesSpriteDictionary.values()){
            if(character){
                character.sceneReady()
            }
            else{
                console.log("throw bug, scene ready isn't being called on an undefined character")
            }
        }
        this.player.sceneReady()
        //this.gameManager.sceneReady()
        //UI scene might not be loaded yet so finding target would override the target icon ui
        //this.gameManager.setPursuerAndTargets()
    }

    UIsceneReadyToReceive(){
        //UI scene is ready to receive calls to listeners/methods, etc
        //as UI scene might be ready after game play scene's sceneReady()
        this.gameManager.UIsceneReadyToReceive()
    }

    update ()  
    {
        if (this.gameOver)
        {
            //return;
        }
        else{
            //testing change
            this.player.update();
            this.waveManager.updateFrame()
            this.npcManager.updateFrame()
            //this.gameManager.updateFrame()

            this.checkNPCsWithinRadius()
        }

    }

    fiveSecondUpdate(){
        if(this.gameOver){

        }
        else{
            this.gameManager.fiveSecondCall()
        }
    }
    oneSecondUpdate(){

        if(this.gameOver){

        }else{
            this.player.oneSecondCall()
            this.waveManager.oneSecondCall()
            this.npcManager.oneSecondCall()
            this.gameManager.oneSecondCall()
        }

    }

    checkNPCsWithinRadius(){
        const radius = 110; // detection distance
        const playerPos = new Phaser.Math.Vector2(this.player.x, this.player.y);

        //TODO maybe store Nearby as a dictionary in constructor to save on memory allocation
        let nearby = new Array<NPCOne>
        for(let enemy of this.waveManager.enemiesSpriteDictionary.values()){
            if(Globals.uiTargetCharacters.has(enemy.name) || Globals.uiPursuerCharacters.has(enemy.name)){
                let enemyPos = new Phaser.Math.Vector2(enemy.x, enemy.y);
                if(Phaser.Math.Distance.BetweenPoints(playerPos, enemyPos) <= radius){
                    //console.log("2) this enemy within radius is : " + enemy.name)
                    nearby.push(enemy)
                }
            }       
        }
        for(let npc of this.npcManager.npcSpriteDictionary.values()){
            let enemyPos = new Phaser.Math.Vector2(npc.x, npc.y);
            if(Phaser.Math.Distance.BetweenPoints(playerPos, enemyPos) <= radius){
                nearby.push(npc)
            }
        }
        // Get pointer direction
        let pointer = this.input.activePointer;
        let pointerVec = new Phaser.Math.Vector2(pointer.worldX - this.player.x, pointer.worldY - this.player.y).normalize();

        // Find enemy closest to that direction
        let bestEnemy : NPCOne | null = null;
        let smallestAngle = Number.MAX_VALUE;

        for(let enemy of nearby){
            let enemyVec = new Phaser.Math.Vector2(enemy.x - this.player.x, enemy.y - this.player.y).normalize();
            //let angle = Phaser.Math.Angle.BetweenPoints(pointerVec, enemyVec); // radians difference
            let dot = pointerVec.dot(enemyVec); // dot product = similarity
            let diff = Math.acos(dot); // angle difference
            //somehow also check if enemy is stunned and not a target of player
            let notStunnedOrKillableTarget = (!enemy.isStunned || this.player.targetCharacters.has(enemy.name)) //stunned and killable target, or not stunned
            if (enemy.active && !enemy.needsRespawning && notStunnedOrKillableTarget && diff < smallestAngle) {
                smallestAngle = diff;
                bestEnemy = enemy;
            }
        
        }

        if(Globals.targetLocked){
            //currently locked on a target ()
            if(Globals.currentTargetedNPC){
                let notStunnedOrKillableTarget = (!Globals.currentTargetedNPC.isStunned || this.player.targetCharacters.has(Globals.currentTargetedNPC.name)) //stunned and killable target, or not stunned
                let enemyPos = new Phaser.Math.Vector2(Globals.currentTargetedNPC.x, Globals.currentTargetedNPC.y);
                if(notStunnedOrKillableTarget && Phaser.Math.Distance.BetweenPoints(playerPos, enemyPos) <= radius){
                    //console.log("2) this enemy within radius is : " + enemy.name)
                    let [screenX,screenY] = this.worldToCameraCoords(Globals.currentTargetedNPC.x, Globals.currentTargetedNPC.y)
                    Globals.eventsCenter.emit('UI-hover-npc-attack-button', screenX, screenY);
                }
                else {
                    //Globals.currentTargetedNPC = null;
                    //display locked icon over player instead
                    Globals.eventsCenter.emit('UI-remove-hover-npc-attack-button');
                }
            }
        }
        else{
            //enemy has changed, or enemy to null
            // Switch current target if changed
            if (bestEnemy && smallestAngle < Phaser.Math.DegToRad(90)) {
                let [screenX,screenY] = this.worldToCameraCoords(bestEnemy.x, bestEnemy.y)
                if(bestEnemy !== Globals.currentTargetedNPC){
                    Globals.currentTargetedNPC = bestEnemy;
                }
                //console.log("camera x and y : " + screenX + "," + screenY)
                //console.log("hover character color: " + bestEnemy.characterColor)
                Globals.eventsCenter.emit('UI-hover-npc-attack-button', screenX, screenY);
            } else {
                Globals.currentTargetedNPC = null;
                Globals.eventsCenter.emit('UI-remove-hover-npc-attack-button');
            }
        }

        

    }

    worldToCameraCoords(worldX, worldY){
        const screenX = (worldX - this.cameras.main.worldView.x) * this.cameras.main.zoom;
        const screenY = (worldY - this.cameras.main.worldView.y) * this.cameras.main.zoom;
        return [screenX, screenY]
    }

}



