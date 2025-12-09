import Goal from './Goal'
import Targeter from './interfaces/Targeter'
import Kinematic from '../Kinematic'
//page 142
export default class ChaseTargeter implements Targeter{
    //holds a kinematic data structur for the pursuer
    chasedCharacterKinematic : Kinematic;
    //controls how much to anticipate the mvement
    lookahead : number; //in seconds
    
    constructor(chasedCharacterKinematic){
        this.lookahead = 2 //seconds
        this.chasedCharacterKinematic = chasedCharacterKinematic
    }

    getGoal(kinematic) : Goal{
        let goal = new Goal()
        goal.position.x = this.chasedCharacterKinematic.position.x + this.chasedCharacterKinematic.velocity.x * this.lookahead
        goal.position.y = this.chasedCharacterKinematic.position.y + this.chasedCharacterKinematic.velocity.y * this.lookahead
        goal.hasPosition = true
        return goal
    }
}