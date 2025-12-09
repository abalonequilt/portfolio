import Face from "./Face"
import { Globals, constrainAngle45Degrees} from "../../../helpers";
import SteeringOutput from "../interfaces/SteeringOutput";
export default class Wander extends Face{
    //holds the radius and forward offset of the wander circle
    wanderOffset
    wanderRadius
    //holds the maximum rate at which the wander orientation can change
    wanderRate
    //holds the current orientation of the wander target
    wanderOrientation

    //holds the maximum acceleration of the character
    maxAcceleration
    //again we don't need a new target
    //other data is derived from the superclass

    constructor(wanderOffset: number, wanderRadius: number, wanderRate: number, wanderOrientation: number, maxAcceleration: number){
        super()
        this.wanderOffset = wanderOffset
        this.wanderRadius = wanderRadius
        this.wanderRate = wanderRate //@PI / 72 is 5 degrees
        this.wanderOrientation = wanderOrientation
        this.maxAcceleration = maxAcceleration


    }
    //page 99
    getSteering(characterKinematic){
        //1) calculate the target to delegate to fa ce
        //update the wander orientation
        this.wanderOrientation += (Math.random() - Math.random()) * this.wanderRate // random number between -1 and 1

        //calculate the combined target orientation
        let targetOrientation = this.wanderOrientation + characterKinematic.orientation

        this.target = characterKinematic.position + this.wanderOffset * characterKinematic.orientation
        let newVec = new Phaser.Math.Vector2( this.maxAcceleration * Math.cos(characterKinematic.orientation), this.maxAcceleration * Math.sin(characterKinematic.orientation))
        let steering = new SteeringOutput(newVec, constrainAngle45Degrees(targetOrientation))
        console.log("entering wander behavior")
        /* TODO commented this out
        //2)delegate to face
        let steering = super.getSteering(characterKinematic)
        
        //3) now set the linear acceleration to be at full acceleration
        //in the direction of the orientation
        
        steering.linear = newVec 
        */
        //return it
        return steering
        
    }
}