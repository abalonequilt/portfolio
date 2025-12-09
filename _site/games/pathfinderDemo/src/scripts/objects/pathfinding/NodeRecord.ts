import Cell from './Cell'
import Connection from './Connection'
export default class NodeRecord{
    node : Cell;
    connection : Connection;
    costSoFar : number;
    estimatedTotalCost : number;
    row : number
    column : number
    constructor(row : number, column: number){
        //this.node = node;
        //this.connection = connection;
        //this.costSoFar = costSoFar;
        //this.estimatedTotalCost = estimatedTotalCost;
        this.row = row
        this.column = column
    }

    isEqual(otherNode : NodeRecord):boolean{
        if(otherNode.row == this.row && otherNode.column == this.column){
            /*
            if(otherNode.costSoFar == this.costSoFar && otherNode.estimatedTotalCost == this.estimatedTotalCost){
                //can also check node/cell and connection
                return true
            }*/
            return true
        }
        else{
            return false
        }
    }
}