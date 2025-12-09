export default class Goal{
    //flags to indicate if each channel is to be used
    hasPosition : boolean;
    hasOrientation : boolean;
    hasVelocity : boolean;
    hasRotation : boolean;
    //data for each channel
    position : Phaser.Math.Vector2;
    orientation : number;
    velocity : Phaser.Math.Vector2;
    angular_velocity : number;

    constructor(){
        
    }

    //updates this goal
    updateChannels(o : Goal){
        if(o.hasPosition){
            this.position = o.position
        }
        if(o.hasOrientation){
            this.orientation = o.orientation
        }
        if(o.hasVelocity){
            this.velocity = o.velocity
        }
        if(o.hasRotation){
            this.angular_velocity = o.angular_velocity
        }
    }

}