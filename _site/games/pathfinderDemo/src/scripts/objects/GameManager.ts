import Character from './characters/Character'
import Player from './characters/Player'
import Grid from './pathfinding/Grid'
import WaveManager from './WaveManager'
import CharacterMatchStatistics from './CharacterMatchStatistics'
import { Globals, setsAreEqual } from "../helpers";
import Pathfinder from './pathfinding/Pathfinder'
import NPCManager from './NPCManager'
import NPCOne from './characters/NPCOne'
import Enemy from './characters/Enemy'

export default class GameManager{
    waveManager : WaveManager
    player : Player
    grid : Grid
    gameType : string
    game_type_options : Object
    needsPursuerQueue : Set<string>
    needsTargetQueue : Set<string>
    needsRespawningQueue : Set<string>
    currentTargetDict : Object
    activePlayerDict : Map<string,Character>
    npcsDict : Map<string,NPCOne>
    enemyNeedsPathfindingQueue : Set<string>
    npcNeedsPathfindingQueue : Set<string>
    scoreDict: Map<string,number>
    characterMatchStatsDict : Map<string, CharacterMatchStatistics>
    enemyPathfinder : Pathfinder
    npcPathfinder : Pathfinder
    

    constructor(waveManager : WaveManager, npcManager : NPCManager, player : Player , grid: Grid) {
        this.game_type_options = {"WANTED": 0, "DEATHMATCH" : 0, "KINGOFTHEHILL": 1}
        this.gameType = "DEATHMATCH"
        //this.potential_colors[this.player.playerColor] = 1 
        this.waveManager = waveManager
        this.player = player
        this.grid = grid
        this.needsRespawningQueue = new Set()
        this.needsTargetQueue = new Set()
        this.needsPursuerQueue = new Set()
        //this.currentTargetDict = {'player' : null, 'enemy1': null, 'enemy2' : null, 'enemy3' : null, 'enemy4' : null, 'enemy5' : null, 'enemy6' : null}
        //create a dictionary of enemies plus the player
        //make this dictionary dynamic
        this.activePlayerDict = this.createActivePlayerDict(waveManager.enemiesSpriteDictionary)
        this.scoreDict = this.createScoreDict()
        this.npcsDict = this.createNPCDict(npcManager.npcSpriteDictionary)

        this.enemyNeedsPathfindingQueue = new Set()
        this.npcNeedsPathfindingQueue = new Set()
        this.enemyPathfinder = new Pathfinder(this.grid)
        this.npcPathfinder = new Pathfinder(this.grid)
        //console.log("past constructor game manager")
    }

    sceneReady(){

    }

    UIsceneReadyToReceive(){
        this.scoreDict.forEach((value,key) => {
            //console.log("emitting update leaderboard event")
            Globals.eventsCenter.emit('update-leaderboard',key, value )
        });
    }

    createActivePlayerDict(waveManagerEnemies : Map<string,Enemy>){
        let dict = new Map
        dict.set('player',this.player)
        //add all the enemies in the wavemanager, this is dynamic 
        //console.log(waveManager)
        for(let key of waveManagerEnemies.keys()){
            dict.set(key, waveManagerEnemies.get(key))
        }
        return dict
    }

    createNPCDict(npcManagerNPCs : Map<string,NPCOne>){
        let dict = new Map
        //add all the enemies in the wavemanager, this is dynamic 
        //console.log(waveManager)
        for(let key of npcManagerNPCs.keys()){
            dict.set(key, npcManagerNPCs.get(key))
        }
        return dict
    }
    createScoreDict(){
        let dict = new Map
        //add all the enemies in the wavemanager, this is dynamic 
        this.activePlayerDict.forEach((value,key) => {
            dict.set(key,0)
        });
        return dict
    }
    pathfindingXYRequested(characterName : string, start : Phaser.Math.Vector2, target : Phaser.Math.Vector2){
        //console.log("int pathfinding request")
        if(this.activePlayerDict.has(characterName)){
            //this.enemyNeedsPathfindingQueue.add(characterName)
            let path = this.enemyPathfinder.getPathXY(start,target)
            this.activePlayerDict.get(characterName)!.setPath(path)
            //console.log("2) in pathfinding request")
        }
        else if(this.npcsDict.has(characterName)){
            //this.npcNeedsPathfindingQueue.add(characterName) //needs start and target added to be able to use queue, might need a Map
            let path = this.npcPathfinder.getPathXY(start,target)
            this.npcsDict.get(characterName)!.setPath(path)
        }
    }
     
    addScoreForCharacter(thisCharacterName, addedScore){
        if(this.scoreDict.has(thisCharacterName)){
            let score = this.scoreDict.get(thisCharacterName)
            let newScore = score + addedScore
            this.scoreDict.set(thisCharacterName, newScore)
            Globals.eventsCenter.emit('update-leaderboard',thisCharacterName, newScore )
        }
        else{
            console.log("throw bug, charactername not in score dict")
        }
        
    }

    updateFrame(){

        //upon character death, spawn after an advertisement plays
        //use dictonary to keep track of which characters have died
        //set targets for each of the characters using available pool and leaderboard positions

        //make this depend on the type of gametype

    }

    setTarget(name : string, target : Character){
        if(name == 'player'){
            this.player.setTargetCharacter(target)
            //already emitting in Character class .setTargetCharacter()
            //Globals.eventsCenter.emit('UI-set-targetIcon', target.texture.key)
            console.log("setting player target")
        }
        else{
            this.waveManager.enemiesSpriteDictionary.get(name)!.setTargetCharacter(target)
        }
    }

    
    setPursuer(name : string, pursuer : Character){
        if(name == 'player'){
            this.player.setPursuerCharacter(pursuer)
        }
        else{
            this.waveManager.enemiesSpriteDictionary.get(name)!.setPursuerCharacter(pursuer)
        }
    }

    oneSecondCall(){

    }

    fiveSecondCall(){
        //needs pursuer whenever spawning again, or successfully BLOCKING a previous pursuer
        //needs new target whenever target blocks this pursuer, or whenever spawning again, or after succesfully killing target
       //console.log("target queue length is : " + this.needsTargetQueue.size)
       //console.log("pursuer queue length is : " + this.needsPursuerQueue.size)
    
        this.respawner()
        this.setPursuerAndTargets()
        
    }
    addPursuerQueue(characterName : string){
        //console.log(characterName)
        //console.log(this)
        if(this.activePlayerDict.has(characterName)){
            console.log("adding pursuer: " + characterName)
            this.needsPursuerQueue.add(characterName)
        }
        else{
            console.log("throw bug in add pursuer queue")
        }
    }

    addTargetQueue(characterName : string){
        //console.log(characterName)
        if(this.activePlayerDict.has(characterName)){
            console.log("adding target : " + characterName)
            this.needsTargetQueue.add(characterName)
        }
        else{
            console.log("throw bug in add target queue")
        }

    }
    
    addRespawnQueue(characterName : string){
        this.needsRespawningQueue.add(characterName)

    }

    setPursuerAndTargets(){
        //both queues need at least one element

        while(this.needsPursuerQueue.size > 0 && this.needsTargetQueue.size > 0 ){
            let needsPursuerString = this.needsPursuerQueue.values().next().value
            let needsTargetString = this.needsTargetQueue.values().next().value
            if(needsPursuerString && needsTargetString){
                if(setsAreEqual(this.needsPursuerQueue, this.needsTargetQueue) && this.needsPursuerQueue.size == 1 && this.needsTargetQueue.size == 1){
                    //if both sets are size 1
                    //can't kill yourself
                    //cant pursuer and target itself
                    break

                    //otherwise if not equal sets you can have unique elements in both sets, continue
                }
                else if(this.needsPursuerQueue.size == 2 && this.needsTargetQueue.size == 2 && setsAreEqual(this.needsPursuerQueue, this.needsTargetQueue)){
                    //if size is 2 for botht sets
                    //and the sets have the same elements
                    //break out of this as you don't want to circular target each other
                    break
                }

                this.needsPursuerQueue.delete(needsPursuerString)
                this.needsTargetQueue.delete(needsTargetString)
                let needsPursuer = this.activePlayerDict.get(needsPursuerString)
                let needsTarget = this.activePlayerDict.get(needsTargetString)

                if(needsPursuer && needsTarget && needsTargetString != needsPursuerString){
                    this.setPursuer(needsPursuerString, needsTarget)
                    this.setTarget(needsTargetString, needsPursuer)
                }
                else{
                    if(this.needsPursuerQueue.size > 0){
                        //works because set maintains in order 
                        this.needsPursuerQueue.add(needsPursuerString)
                        needsPursuerString = this.needsPursuerQueue.values().next().value
                        if(needsPursuerString != undefined){
                            this.needsPursuerQueue.delete(needsPursuerString)
                            needsPursuer = this.activePlayerDict.get(needsPursuerString)
                            if(needsPursuer && needsTarget){
                                this.setPursuer(needsPursuerString, needsTarget)
                                this.setTarget(needsTargetString, needsPursuer)
                            }
                            else{
                                console.log("throw bug, received undefined")
                            }
                            
                        }

                    }
                    else{
                        this.needsPursuerQueue.add(needsPursuerString)
                        this.needsTargetQueue.add(needsTargetString)
                    }
                }
            }

            
            //needsPursuer.pursuerCharacter = needsTarget
            //needsTarget.targetCharacter = needsPursuer
        }
    }

    respawner(){
        //use grid spawn points, cell type 2
        //choose a random one
    
        if(this.needsRespawningQueue.size > 0){
            let spawnPoints = this.grid.getRandomSpawnPoints(this.needsRespawningQueue.size)
            for(let i = 0; i < this.needsRespawningQueue.size; i++){
                //respawn vector
                let vector = spawnPoints[i][1]
                let key = this.needsRespawningQueue[i]
                if(this.activePlayerDict.has(key)){
                    //console.log("this character is respawning: " + key)
                    this.activePlayerDict.get(key)!.respawnCharacter(vector)
                    this.needsRespawningQueue.delete(this.needsRespawningQueue[i])
                }
                else{
                    //TODO!!!
                    //it is an NPC that needs to use NPC manager
                }

            }
        }
        
    }
}