import Enemy from './characters/Enemy'
import Player from './characters/Player'
import PlayGameScene from '../scenes/PlayGameScene'
import NPCOne from './characters/NPCOne';
import Grid from './pathfinding/Grid';
import { Globals } from "../helpers";


export default class NPCManager{
    roundStart : boolean;
    npcPhysicsGroup : Phaser.Physics.Arcade.Group; //Array<Enemy>; //TODO make it variables in Scene
    npcSpriteDictionary: Map<string,NPCOne>;
    gatheringCellsDictionary : Object;
    player : Player;
    scene : Phaser.Scene;
    grid : Grid;
    totalNPCs : number
    potential_colors : Map<string,number>

    constructor(scene : PlayGameScene, totalNPCs : number, player : Player, grid: Grid, gathering_cells_dict : Object) {
      //super()
        this.roundStart = false;
        this.scene = scene;
        this.npcPhysicsGroup = this.scene.physics.add.group();
        this.grid = grid;
        this.totalNPCs = totalNPCs
        this.player = player
        this.gatheringCellsDictionary = gathering_cells_dict;
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

        this.npcSpriteDictionary = new Map
    }

    updateFrame(){
        let n = this.npcPhysicsGroup.getLength();
        //console.log(n.toString());
        for(let i = 0; i < n; i++){
            //console.log('hello');
            let enemy = this.npcPhysicsGroup.getChildren()[i];
            enemy.update();
        }
    }

    oneSecondCall(){
        for(let key of this.npcSpriteDictionary.keys()){
            this.npcSpriteDictionary.get(key)!.oneSecondCall()
        }
    }
    spawn(){
        let npcsSpawn = this.spawnNPCs();
        npcsSpawn.forEach((element: NPCOne) => {
            this.npcSpriteDictionary.set(element.name, element)
        });
        this.npcPhysicsGroup.addMultiple(npcsSpawn);
    }
    pickRandomNPCColor(): string{
        const targetIndex = Math.floor(Math.random() * this.potential_colors.size);
        let i = 0;
        let color = ''
        for (const npcColor of this.potential_colors.keys()) {
            if (i === targetIndex) {
                return npcColor;
            }
            color = npcColor
            i++
        }
        return color
    }
    spawnNPCs() : NPCOne[]{

        let npcs : NPCOne[] = [];
        let rand = 0;
        let probabilityThreshold = 0.6;
        let i = 0;
        for(let key in this.gatheringCellsDictionary){
            rand = Math.random();
            if(rand <= probabilityThreshold){
                let rowColArray = this.grid.parseCellsDictionaryKey(key);
                let row = rowColArray[0];
                let col = rowColArray[1];

                let randomOffsetX = Math.random() * 16;
                let randomOffsetY = Math.random() * 16;
                let keyVector = this.grid.calculateTileCenter(row,col);
                keyVector = new Phaser.Math.Vector2(keyVector.x + randomOffsetX, keyVector.y + randomOffsetY);
                let gatheringCenter = this.gatheringCellsDictionary[key];
                const angle = Phaser.Math.Angle.Between(keyVector.x, keyVector.y, gatheringCenter.x, gatheringCenter.y);
                //get angle and use it to point at center point
                let npcColor = this.pickRandomNPCColor();
                let npc = new NPCOne(this.scene, keyVector.x, keyVector.y, npcColor + 'dude');
                npc.setInteractive()
                npc.on('pointerdown', () => {
                    npc.selectSprite(false);
                });
                //rotates the sprite with a 90 degree offset to face center of circle
                npc.setRotation(angle + Math.PI/2);
                npc.name = 'npc' + i.toString();
                i += 1;
                //sprite.setCollideWorldBounds(true);
                //sprite.setBounce(0.001);
                //sprite.body.setImmovable(true);
                //  The score
                npcs.push(npc);
            }
            //enough npcs
            if(this.totalNPCs <= npcs.length){
                //break out of for loop, enough npcs
                break
            }

        }
        return npcs;
    }
}