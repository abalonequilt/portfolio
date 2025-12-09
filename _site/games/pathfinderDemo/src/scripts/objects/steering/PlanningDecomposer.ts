import Decomposer from './interfaces/Decomposer'
import Goal from './Goal'
import Kinematic from '../Kinematic'
import Grid from '../pathfinding/Grid'
import Pathfinder from '../pathfinding/Pathfinder'

//page 143
export default class PlanningDecomposer implements Decomposer{
    //data for the graph
    graph : Grid
    heuristic : number
    pathfinder : Pathfinder
    constructor(graph){
        this.graph = graph
        this.pathfinder = new Pathfinder(this.graph)
        this.heuristic = 0
    }

    decompose(characterKinematic : Kinematic, goal : Goal) : Goal{
        //page 143
        //first we quantize our current location and our goal
        //into nodes of the graph
        let start = this.graph.getCellWithXY(characterKinematic.position)
        let end = this.graph.getCellWithXY(goal.position) 
        //if they are equal, don't need to get plan. in the same cell
        if(start.tileCenter == end.tileCenter){
            return goal
        }
        //otherwise plan the route
        //TODO complete astar
        let path = this.pathfinder.getPathXY(characterKinematic.position, goal.position)

        //get the first node in the path and localize it
        //let firstNode = path[0]
        //let firstPosition = this.graph.calculateTileCenter(firstNode.row, firstNode.column)

        let firstPosition : Phaser.Math.Vector2 | null = null
        if(path.length > 1){
            //path[1] is the actual first target in the path that isn't the current position
            firstPosition = path[1]
        }
        else if(path.length == 0){
            //position will be itself, some kind of check to make sure 
            //path[0] is start, should be equivalent to current characterKinematic.position
            console.log("weird bug, pathfinder is only length 1 ")
            firstPosition = path[0]
        }
        else{
            //somehow pathfinder failed to re turn at least the start value
            console.log("weird bug, pathfinder is empty")
            firstPosition = characterKinematic.position
        }
        //update the goal and return
        goal.position = firstPosition
        return goal
    }
}