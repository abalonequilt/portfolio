import Phaser from "phaser"
export default class Kinematic{
    position : Phaser.Math.Vector2;
    orientation : number;
    velocity : Phaser.Math.Vector2;
    angular_vel : number;

    constructor(position : Phaser.Math.Vector2, orientation : number){
        //this.position = new Phaser.Math.Vector2(0,0);
        //this.orientation = 0;
        this.position = position
        this.orientation = orientation
        this.velocity = new Phaser.Math.Vector2(0,0);
        this.angular_vel = 0;
    }

    update(steering,time){
        //update the position and orientation

        this.position.x = this.position.x + this.velocity.x * time
        this.position.y = this.position.y + this.velocity.y * time
        //this.orientation = this.orientation + this.angular_velocity * time 

        this.velocity.x = this.velocity.x + steering.linear.x * time
        this.velocity.y = this.velocity.y + steering.linear.y * time
        this.angular_vel = steering.angular * time
    }

    getNewOrientation(currentOrientation, velocity){
        //make sure we have a velocity
        if (velocity.length()){
            //Calculate orientation using an arc tangent of the velocity components
            return Math.atan2(-velocity.x, velocity.y) //static   
        }
        else{
            return currentOrientation;
        }

    }


}