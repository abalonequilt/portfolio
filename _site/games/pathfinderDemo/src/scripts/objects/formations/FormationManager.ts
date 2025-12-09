import NPCOne from '../characters/NPCOne'

export default class FormationManager{
    slotAssignments : Array<SlotAssignment>
    //holds the assignment of a single character to a slot
    driftOffset : Static
    numberOfSlots : integer
    pattern : FormationPattern

    constructor() {
        this.slotAssignments = new Array<SlotAssignment>
    }

    //updates the assignment of characters to slots
    updateSlotAssignments(){
        
    }
    //calculates drift offset when characters are in given set of slots
    getDriftOffset(slotAssignments){

    }

    //gets the location of the given slot index
    getSlotLocation(slotNumber){

    }

    //returns true if the pattern can support the given number of slots
    supportsSlots(slotCount){
        
    }
    
    

}

class FormationPattern{
    constructor(){

    }

    //gets the location of the tgiven slot index at a given time
    getSlotLocation(slotNumber, time){

    }
}

class SlotAssignment{
    character : Phaser.Physics.Arcade.Sprite;
    slotNumber : integer;

    constructor(character, slotNumber){
        this.character = character;
        this.slotNumber = slotNumber;
    }
}

class Static{
    position : Phaser.Math.Vector2;
    orientation : number;

    constructor(position, orientation){
        this.position = position;
        this.orientation = orientation;
    }
}