import Goal from '../Goal'

export default interface Decomposer{
    //takes a goal, decomposes it if possible, and returns a sub-goal
    //if it can't decompose, return the goal it was given
    decompose(kinematic, goal : Goal) : Goal
}