export default class CharacterMatchStatistics{
    characterName : string
    kills : number
    deaths : number
    successful_poisons : number
    successful_blocks : number
    discreet_kill : number
    silent_kill : number
    focus_kill : number
    incognito_kill : number
    variety_bonus : number
    poacher_bonus : number
    lure_bonus : number
    savior_bonus : number
    escape_bonus : number
    total_score : number

    scoreEffectsDict : Object

    constructor(characterName){
        this.characterName = characterName
        this.total_score = 0
        this.kills = 0
        this.deaths = 0
        this.successful_poisons = 0
        this.successful_blocks = 0
        this.discreet_kill = 0
        this.silent_kill = 0
        this.focus_kill = 0
        this.incognito_kill = 0
        this.variety_bonus = 0
        this.poacher_bonus = 0
        this.lure_bonus = 0
        this.savior_bonus = 0
        this.escape_bonus = 0
        this.scoreEffectsDict = {'kill' : 100, 'successful_poison': [150, 200, 250, 300], 'successful_block': 200, 
            'discreet_kill': 50, 'silent_kill' : 100, 'focus_kill' : 150,  'incognito_kill': 200, 
            'variety_bonus': 50, 'poacher_bonus': 50, 'lure_bonus' : 50, 'savior_bonus' : 50, 'escape_bonus' : 100 }
    }
}