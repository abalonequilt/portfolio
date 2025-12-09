import Goal from '../Goal'

//page 139
export default interface Constraint{
    //returns true if the given path will violate the constraint at some point
    willViolate(path) : boolean
    //should return a new goal that enables the character to avoid violating the constraint
    suggest(path,kinematic,goal : Goal) : Goal
}
