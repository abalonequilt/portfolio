import Enemy from './characters/Enemy'
import Player from './characters/Player'
import Grid from './pathfinding/Grid'
import PlayGameScene from '../scenes/PlayGameScene'
import { Globals } from "../helpers";



export default class WaveManager{
    waveStart : boolean;
    enemiesPhysicsGroup : Phaser.Physics.Arcade.Group; //Array<Enemy>; //TODO make it variables in Scene
    enemiesSpriteDictionary: Map<string,Enemy>
    currentWave : integer;
    player : Player;
    scene : Phaser.Scene;
    grid : Grid
    totalEnemies : number
    potential_colors : Map<string,number>
    BOUNDS_HEIGHT : number
    BOUNDS_WIDTH : number

    constructor(numberOfWaves : number, numEnemies : number, player : Player , grid: Grid, scene : PlayGameScene) {
      //super()
        this.waveStart = false;
        this.currentWave = 0;
        this.totalEnemies = numEnemies
        this.scene = scene;
        this.player = player;
        this.enemiesPhysicsGroup = this.scene.physics.add.group();
        this.grid = grid
        this.enemiesSpriteDictionary = new Map
        this.potential_colors = new Map
        this.potential_colors.set('brightmagenta', 0) 
        this.potential_colors.set('vividpurple', 0) 
        this.potential_colors.set('brightyellow', 0) 
        this.potential_colors.set('electricblue', 0) 
        this.potential_colors.set('hotpink', 0) 
        this.potential_colors.set('limegreen', 0) 
        this.potential_colors.set('neoncyan', 0)
        this.potential_colors.set('orangered', 0)
        this.potential_colors.set(this.player.characterColor, 1) 
        //this.spawn()
        this.BOUNDS_HEIGHT = this.scene.registry.get('BOUNDS_HEIGHT')
        this.BOUNDS_WIDTH = this.scene.registry.get('BOUNDS_WIDTH')
    }

    updateFrame(){
        let n = this.enemiesPhysicsGroup.getLength();
        //console.log(n.toString());
        for(let i = 0; i < n; i++){
            //console.log('hello');
            let enemy = this.enemiesPhysicsGroup.getChildren()[i];
            enemy.update();
        }
    }

    oneSecondCall(){
        for(let key of this.enemiesSpriteDictionary.keys()) {
            this.enemiesSpriteDictionary.get(key)!.oneSecondCall()
        }
    }
    pickFreeRandomNPCColor(): string{
        for(let key of this.potential_colors.keys()){
            if(this.potential_colors.get(key) == 0){
                return key
            }
        }
        //TODO!!! maybe return something different
        return ''
    }

    spawn(){
        //gets called in scene
        let npcsSpawn = this.spawnNPCs();
        npcsSpawn.forEach((element: Enemy) => {
            this.enemiesSpriteDictionary.set(element.name, element)
        });
        this.enemiesPhysicsGroup.addMultiple(npcsSpawn);
    }
    spawnNPCs() : Enemy[]{

        //const centerVector = new Phaser.Math.Vector2(this.BOUNDS_WIDTH/4, this.BOUNDS_HEIGHT/4);
        //const minimumRadius = 200;
        //const range = 100;
        //TODO change this
        
        let shuffledSpawns = this.grid.getRandomSpawnPoints(this.totalEnemies)
        

        let offset = 0;
        let enemies : Enemy[] = [];
        for (let i = 0; i < this.totalEnemies; i++) {
            //const angle = Phaser.Math.DegToRad((360 / this.totalEnemies) * i);
            //const x = offset + centerVector.x + (Math.random()*range + minimumRadius) * Math.cos(angle);
            //const y = offset + centerVector.y + (Math.random()*range + minimumRadius) * Math.sin(angle);
            
            let npcColor = this.pickFreeRandomNPCColor();
            this.potential_colors.set(npcColor, 1)
            let vector = shuffledSpawns[i][1]
            let enemy = new Enemy(this.scene, vector.x, vector.y, npcColor + 'dude', this.grid);
            enemy.setInteractive()
            enemy.on('pointerdown', () => {
                enemy.selectSprite(this.player.targetCharacters.has(enemy.name) || this.player.chaseCharacters.has(enemy.name));
            });
            //rotates the sprite with a 90 degree offset to face center of circle
            //enemy.setRotation(angle - Phaser.Math.DegToRad(90));
            enemy.name = 'enemy' + i.toString();
            //sprite.setCollideWorldBounds(true);
            //sprite.setBounce(0.001);
            //sprite.body.setImmovable(true);
            //  The score
            enemies.push(enemy);
        }
        return enemies;
    }


    
}