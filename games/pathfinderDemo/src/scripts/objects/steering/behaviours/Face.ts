import Kinematic from '../../Kinematic'
import Align from './Align'
import SteeringOutput from '../interfaces/SteeringOutput'
export default class Face extends Align{
    // Overrides the Align.target member
    target : Kinematic
    // ... Other data is derived from the superclass ...
    // Implemented as it was in Pursue
    constructor(){
        super()
    }
    override getSteering(characterKinematic : Kinematic) : SteeringOutput{
        // 1. Calculate the target to delegate to align
        // Work out the direction to target
        let direction = this.target.position.clone().subtract(characterKinematic.position)
        // Check for a zero direction, and make no change if so

        if(direction.length() == 0){
            return new SteeringOutput(this.target.position, this.target.orientation)
        }
        // Put the target together
        //this.target = explicitTarget
        this.target.orientation = Math.atan2(-direction.x, direction.y)
        // 2. Delegate to align
        return super.getSteering( characterKinematic)
    }
}