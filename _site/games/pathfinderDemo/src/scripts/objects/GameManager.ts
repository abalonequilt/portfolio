import Character from './characters/Character'
import Player from './characters/Player'
import Grid from './pathfinding/Grid'
import WaveManager from './WaveManager'
import { Globals, setsAreEqual } from "../helpers";

export default class GameManager{
    waveManager : WaveManager
    player : Player
    grid : Grid
    gameType : string
    game_type_options : Object
    needsChaserQueue : Set<string>
    needsTargetQueue : Set<string>
    currentTargetDict : Object
    characterDict : Map<string,Character>
    needsRespawningQueue : Set<string>
    scoreDict: Map<string,number>
    

    constructor(waveManager : WaveManager, player : Player , grid: Grid) {
        this.game_type_options = {"WANTED": 0, "DEATHMATCH" : 0, "KINGOFTHEHILL": 1}
        this.gameType = "DEATHMATCH"
        //this.potential_colors[this.player.playerColor] = 1 
        this.waveManager = waveManager
        this.player = player
        this.grid = grid
        this.needsRespawningQueue = new Set()
        this.needsTargetQueue = new Set()
        this.needsChaserQueue = new Set()
        //this.currentTargetDict = {'player' : null, 'enemy1': null, 'enemy2' : null, 'enemy3' : null, 'enemy4' : null, 'enemy5' : null, 'enemy6' : null}
        //create a dictionary of enemies plus the player
        //make this dictionary dynamic
        this.characterDict = this.createCharacterDict(waveManager)
        this.scoreDict = this.createScoreDict()
        //console.log("past constructor game manager")
    }

    createCharacterDict(waveManager : WaveManager){
        let dict = new Map
        dict.set('player',this.player)
        //add all the enemies in the wavemanager, this is dynamic 
        //console.log(waveManager)
        for(let key of waveManager.enemiesSpriteDictionary.keys()){
            dict.set(key, waveManager.enemiesSpriteDictionary.get(key))
        }
        return dict
    }
    sceneReady(){

    }

    UIsceneReadyToReceive(){
        this.scoreDict.forEach((value,key) => {
            //console.log("emitting update leaderboard event")
            Globals.eventsCenter.emit('update-leaderboard',key, value )
        });
    }
    createScoreDict(){
        let dict = new Map
        dict.set('player', 0)
        //add all the enemies in the wavemanager, this is dynamic 
        this.characterDict.forEach((value,key) => {
            dict.set(key,0)
            //console.log("emitting update leaderboard event")
            //Globals.eventsCenter.emit('update-leaderboard',key, 0 )
        });
        return dict
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

    
    setChaser(name : string, chaser : Character){
        if(name == 'player'){
            this.player.setChaseCharacter(chaser)
        }
        else{
            this.waveManager.enemiesSpriteDictionary.get(name)!.setChaseCharacter(chaser)
        }
    }

    oneSecondCall(){
        this.respawner()
    }

    fiveSecondCall(){
        //needs chaser whenever spawning again, or successfully BLOCKING a previous chaser
        //needs new target whenever target blocks this chaser, or whenever spawning again, or after succesfully killing target
        //console.log("target queue length is : " + this.needsTargetQueue.size)
        //console.log("chaser queue length is : " + this.needsChaserQueue.size)
        //console.log("five second call called")
       
        this.setChaserAndTargets()
    }

    addChaserQueue(characterName : string){
        //console.log(characterName)
        //console.log(this)
        if(this.characterDict.has(characterName)){
            //console.log("adding needs chaser to chaser queue: " + characterName)
            this.needsChaserQueue.add(characterName)
        }
        else{
            //console.log("throw bug in add chaser queue")
        }
    }

    addTargetQueue(characterName : string){
        //console.log(characterName)
        if(this.characterDict.has(characterName)){
            //console.log("adding needs target to target queue : " + characterName)
            this.needsTargetQueue.add(characterName)
        }
        else{
            //console.log("throw bug in add target queue")
        }

    }
    
    addRespawnQueue(characterName : string){
        //console.log("adding needs respawn to respawn queue : " + characterName)
        this.needsRespawningQueue.add(characterName)

    }

    setChaserAndTargets(){
        //both queues need at least one element

        while(this.needsChaserQueue.size > 0 && this.needsTargetQueue.size > 0 ){
            let needsChaserString = this.needsChaserQueue.values().next().value
            let needsTargetString = this.needsTargetQueue.values().next().value
            if(needsChaserString && needsTargetString){
                if(setsAreEqual(this.needsChaserQueue, this.needsTargetQueue) && this.needsChaserQueue.size == 1 && this.needsTargetQueue.size == 1){
                    //if both sets are size 1
                    //can't kill yourself
                    //cant chase and target itself
                    break

                    //otherwise if not equal sets you can have unique elements in both sets, continue
                }
                else if(this.needsChaserQueue.size == 2 && this.needsTargetQueue.size == 2 && setsAreEqual(this.needsChaserQueue, this.needsTargetQueue)){
                    //if size is 2 for botht sets
                    //and the sets have the same elements
                    //break out of this as you don't want to circular target each other
                    break
                }

                this.needsChaserQueue.delete(needsChaserString)
                this.needsTargetQueue.delete(needsTargetString)
                let needsChaser = this.characterDict.get(needsChaserString)
                let needsTarget = this.characterDict.get(needsTargetString)

                if(needsChaser && needsTarget && needsTargetString != needsChaserString){
                    this.setChaser(needsChaserString, needsTarget)
                    this.setTarget(needsTargetString, needsChaser)
                }
                else{
                    if(this.needsChaserQueue.size > 0){
                        //works because set maintains in order 
                        this.needsChaserQueue.add(needsChaserString)
                        needsChaserString = this.needsChaserQueue.values().next().value
                        if(needsChaserString != undefined){
                            this.needsChaserQueue.delete(needsChaserString)
                            needsChaser = this.characterDict.get(needsChaserString)
                            if(needsChaser && needsTarget){
                                this.setChaser(needsChaserString, needsTarget)
                                this.setTarget(needsTargetString, needsChaser)
                            }
                            else{
                                console.log("throw bug, received undefined")
                            }
                            
                        }

                    }
                    else{
                        this.needsChaserQueue.add(needsChaserString)
                        this.needsTargetQueue.add(needsTargetString)
                    }
                }
            }

            
            //needsChaser.chaseCharacter = needsTarget
            //needsTarget.targetCharacter = needsChaser
        }
    }

    respawner(){
        //use grid spawn points, cell type 2
        //choose a random one
        //console.log("respawner called")
        if(this.needsRespawningQueue.size > 0){
            let spawnPoints = this.grid.getRandomSpawnPoints(this.needsRespawningQueue.size)
            let i = 0
            for(let characterName of this.needsRespawningQueue){
                //console.log("inside respawner for loop")
                //respawn vector
                let vector = spawnPoints[i][1]
                //console.log("respawn key is : " + characterName)
                if(this.characterDict.has(characterName)){
                    //console.log("respawn this character:" + characterName)
                    this.characterDict.get(characterName)!.respawnCharacter(vector)
                    this.needsRespawningQueue.delete(characterName)
                }
                else{
                    //TODO!!!
                    //it is an NPC that needs to use NPC manager
                }
                i++
            }
        }
        
    }
}