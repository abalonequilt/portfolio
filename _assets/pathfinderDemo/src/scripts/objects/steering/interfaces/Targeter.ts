import Goal from '../Goal'

export default interface Targeter{

    getGoal(kinematic) : Goal
}