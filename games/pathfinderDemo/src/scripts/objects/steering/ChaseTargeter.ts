import Goal from './Goal'
import Targeter from './Targeter'
import Kinematic from '../Kinematic'
//page 142
export default class ChaseTargeter extends Targeter{
    //holds a kinematic data structur for the chase
    chasedCharacter : Kinematic;


    //controls how much to anticipate the mvement
    lookahead : number;
    
    constructor(){
        super()
    }

    override getGoal(kinematic) : Goal{
        let goal = new Goal()
        goal.position.x = this.chasedCharacter.position.x + this.chasedCharacter.velocity.x * this.lookahead
        goal.position.y = this.chasedCharacter.position.y + this.chasedCharacter.velocity.y * this.lookahead
        goal.hasPosition = true
        return goal
    }
}