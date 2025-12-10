import Goal from './Goal'

export default class Targeter{
    constructor(){

    }

    getGoal(kinematic) : Goal{
        let goal = new Goal()
        return goal
    }
}