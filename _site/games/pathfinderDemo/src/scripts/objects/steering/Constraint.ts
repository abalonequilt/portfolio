import Goal from './Goal'

//page 139
export default class Constraint{
    constructor(){
        
    }
    willViolate(path) : boolean{
        //returns true if the given path will violate the constraint at some point
        let willViolate = false;
        return willViolate
    }
    suggest(path,kinematic,goal : Goal) : Goal{
        //should return a new goal that enables the character to avoid violating the constraint
        return goal
    }
}
