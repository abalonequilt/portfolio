import Cell from './Cell'
import NodeRecord from './NodeRecord';
export default class Connection{
    cost : number;
    fromNode : NodeRecord; // could use Cell
    toNode : NodeRecord; // could use Cell

    constructor(cost : number, fromNode : NodeRecord, toNode : NodeRecord){
        this.cost = cost;
        this.fromNode = fromNode;
        this.toNode = toNode;
    }

    getCost(){
        return this.cost;
    }

    getFromNode() : NodeRecord{
        return this.fromNode;
    }

    getToNode() : NodeRecord{
        return this.toNode;
    }
}