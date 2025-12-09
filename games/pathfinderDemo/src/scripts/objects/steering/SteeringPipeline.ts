import Targeter from './Targeter'
import Decomposer from './Decomposer'
import Constraint from './Constraint'
import Goal from './Goal'
import Kinematic from '../Kinematic'
import Actuator from './Actuator'
export default class SteeringPipeline{
    //Lists of components at each stage of the pipe
    targeters : Targeter[];
    decomposers : Decomposer[];
    constraints : Constraint[];
    actuator : Actuator;

    //holds the number of attempts the algorithm will make to fund an unconstrained route
    constraintSteps : number;
    //holds the deadliock steering behavior
    deadlock : number
    //holds the current kinematic data for the character
    kinematic : Kinematic;

    goal : Goal;

    constructor(){

    }

    //performs the pipeline algorithm and returns the required forces used to move the character
    getSteering(){
        //firstly we get the top level goal

        for(let targeter of this.targeters){
            this.goal.updateChannels(targeter.getGoal(this.kinematic));
        }

        //now we decompose it
        for(let decomposer of this.decomposers){
            this.goal = decomposer.decompose(this.kinematic, this.goal);
        }

        //now we loop through the actuation and constraint process
        let validPath = false;
        for(let i = 0; i < this.constraintSteps; i++){
            //get the path from the act uator
            let path = this.actuator.getPath(this.kinematic,this.goal);
            //check for constraint violation
            for(let constraint of this.constraints){
                //if we find a violation, get a suggestion
                if(constraint.willViolate(path)){
                    this.goal = constraint.suggest(path, this.kinematic, this.goal);
                    //go back to the top level loop to get the path for the new goal
                    break;
                }
            }
            //if we're here it is because we found a valid path
            return this.actuator.output(path,this.kinematic, this.goal);

            //we arrive here if we ran out of constraint steps
            //we delegate to the deadlock behavior
            //TODO undo comment
            //return this.deadlock.getSteering();
        }
    }
}






