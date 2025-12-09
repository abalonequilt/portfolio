import Kinematic from "../../Kinematic"
import SteeringOutput from "../interfaces/SteeringOutput"

export default class Align{

    //Holds the kinematic data for the character and target
    character
    target
    
    //Holds the max angular acceleration and rotation
    //# of the character
    maxAngularAcceleration
    maxRotation
    
    // Holds the radius for arriving at the target
    targetRadius
    
    //Holds the radius for beginning to slow down
    slowRadius
    
    // Holds the time over which to achieve target speed
    timeToTarget = 0.1
    
    getSteering(characterKinematic : Kinematic) : SteeringOutput{    
        // Create the structure to hold our output
        let steering = new SteeringOutput(characterKinematic.position, 0)
        
        // Get the naive direction to the target
        let rotation = this.target.orientation - characterKinematic.orientation
        
        // Map the result to the (-pi, pi) interval
        rotation = Phaser.Math.Angle.Wrap(rotation)
        let rotationSize = Math.abs(rotation) //rotationDirection?
        
        // Check if we are there, return no steering
        if(rotationSize < this.targetRadius){
            //return null //TODO
            return new SteeringOutput(new Phaser.Math.Vector2(0,0), 0)
        }
        
        // If we are outside the slowRadius, then use
        // maximum rotation
        let targetRotation
        if(rotationSize > this.slowRadius){
            targetRotation = this.maxRotation
        }
        
        // Otherwise calculate a scaled rotation
        else{
            targetRotation  = this.maxRotation * rotationSize / this.slowRadius
        }


        // The final target rotation combines
        // speed (already in the variable) and direction
        targetRotation *= rotation / rotationSize
        
        // Acceleration tries to get to the target rotation
        steering.angular =targetRotation- characterKinematic.orientation
        steering.angular /= this.timeToTarget
        
        // Check if the acceleration is too great
        let angularAcceleration = Math.abs(steering.angular)
        if(angularAcceleration > this.maxAngularAcceleration){
            steering.angular /= angularAcceleration
            steering.angular *= this.maxAngularAcceleration
        }
        
        // Output the steering
        steering.linear =  new Phaser.Math.Vector2(0,0)
        return steering
    }
}