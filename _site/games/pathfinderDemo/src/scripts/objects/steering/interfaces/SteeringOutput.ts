
export default class SteeringOutput{
    linear : Phaser.Math.Vector2
    angular : number // a single floating point value

    constructor(linearVec : Phaser.Math.Vector2, angularNum : number){
        this.linear = linearVec
        this.angular = angularNum
    }
}