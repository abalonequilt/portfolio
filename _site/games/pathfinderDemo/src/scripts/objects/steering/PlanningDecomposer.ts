import Decomposer from './Decomposer'
import Goal from './Goal'
import Kinematic from '../Kinematic'
import Grid from '../pathfinding/Grid'
import Pathfinder from '../pathfinding/Pathfinder'

//page 143
export default class PlanningDecomposer extends Decomposer{
    //data for the graph
    graph : Grid
    heuristic : number
    pathfinder : Pathfinder
    constructor(graph){
        super()
        this.graph = graph
        this.pathfinder = new Pathfinder(this.graph)
        this.heuristic = 0
    }

    override decompose(characterKinematic : Kinematic, goal : Goal) : Goal{
        //page 143
        //first we quantize our current location and our goal
        //into nodes of the graph
        let start = this.graph.getCellWithXY(characterKinematic.position)
        let end = this.graph.getCellWithXY(goal.position) 
        //if they are equal, don't need to get plan
        if(start.tileCenter == end.tileCenter){
            return goal
        }
        //otherwise plan the route
        //TODO complete astar
        let path = this.pathfinder.astar(start, end)

        //get the first node in the path and localize it
        let firstNode = path[0]
        let position = this.graph.calculateTileCenter(firstNode.row, firstNode.column)

        //update the goal and return
        goal.position = position
        return goal
    }
}