import Grid from './Grid'
import Cell from './Cell'
import NodeRecord from './NodeRecord'
import Connection from './Connection'
import { NONE } from 'phaser';

export default class Pathfinder{
    ///page 222

    graph: Grid;

    constructor(grid){
        this.graph = grid;
    }
    //page 245
    
    astar(start : Cell, goal: Cell): Array<NodeRecord> {
        //initialize the record for the start node
        //let defaultNode = new Cell(0,0,64,64);
        let startRecord = new NodeRecord(start.row, start.column);
        let startRecordCopy = new NodeRecord(start.row, start.column);
        startRecord.estimatedTotalCost = this.heuristic(start.row,goal.row, start.column, goal.column)
        startRecord.costSoFar = 0
        startRecord.connection = new Connection(0, startRecordCopy, startRecordCopy)
        
        //initialize open and closed lists
        let openList = new MinHeap();
        openList.addElement(startRecord);
        let closedList = new MinHeap();
        let current = startRecord
        //console.log("right before while loop")
        let iterationWhileCount = 0
        //iterate through processing each node
        while(openList.heap.length > 0){
            //find the smallest element in the open list using the estimated total cost
            current = openList.smallestElement();
            //if it is the goal node, then terminate
            if(current.row == goal.row && current.column == goal.column){
                //console.log("broke out of while loop matching goal")
                break
            }

            //otherwise get its outgoing connections
            let connections = this.graph.getConnections(current.row, current.column);

            //console.log("right before connections iteration")
            ////console.log('connections length: ' + connections.length)
            //loop through each connection in turn
            for(let connection of connections){
                //get the cost estimate for the end node
                let endNode = connection.getToNode()
                let newCost = current.costSoFar + connection.getCost()
                let endNodeHeuristic = 0
                let endNodeRecord 
                //if the node is closed we may have to skip, or remove it from the closed list
                if(closedList.contains(endNode)){
                    //here we find the record in the closed list
                    //corresponding to the end node
                    //console.log("first if statement")
                    endNodeRecord = closedList.findElementReturn(endNode);
                    //console.log("closed list end node index: " + closedList.findElementIndex(endNode).toString())
                    //console.log("closed list size: " + closedList.heap.length.toString())
                    //console.log("end Node row: " + endNode.row.toString() + "col: " + endNode.column.toString())
                    //console.log("end Node record row: " + endNodeRecord.row.toString() + "col: " + endNodeRecord.column.toString())
                    if(endNodeRecord != null){
                        //if we didn't find a shorter route, skip
                        if(endNodeRecord.costSoFar <= newCost){
                            //do nothing
                            continue
                        }
                        else{
                            //otherweise remove it from the closed list
                            closedList.removeElement(endNodeRecord)
                            //we can use the old node's cost values to calculate its heuristic without calling
                            //the possibly expensive heuristic function
                            endNodeHeuristic = newCost - endNodeRecord.costSoFar + this.heuristic(goal.row, endNode.row, goal.column, endNode.column);
                        }
                    }
                    else{
                        let index = closedList.findElementIndex(endNode)
                        //console.log("1) null record row: " + endNode.row + " col: " + endNode.column)
                        //console.log(" index is : " + index );
                        //console.log("this heap length : " + closedList.heap.length)

                        //console.log( "found heap row: " + closedList.heap[index].row + " col : " + closedList.heap[index].column)
                    }


                }
                else if(openList.contains(endNode)){
                    //console.log("second if statement")
                    //|| endNodeRecord.costSoFar > endNodeCost
                    //here we find the record in the open list
                    //corresponding to the endNode
                    endNodeRecord = openList.findElementReturn(endNode);

                    if(endNodeRecord != null){
                        //if our route is no better, then skip
                        if(endNodeRecord.costSoFar <= newCost){
                            //do nothing
                            continue
                        }
                        else{
                            openList.removeElement(endNode)
                            //we can use the node's old cost values
                            //to calculate its heuristic without calling the possibly expensive heuristic function
                            endNodeHeuristic = newCost - endNodeRecord.costSoFar + this.heuristic(goal.row, endNode.row, goal.column, endNode.column);
                            
                            //otherwise we know we've got an unvisited node, so make a record for it
                        }
                    }
                    else{
                        let index = openList.findElementIndex(endNode)
                        //console.log("2) null record row: " + endNode.row + " col: " + endNode.column)
                        //console.log(" index is : " + index);
                        //console.log("this heap length : " + openList.heap.length)
                        //testRow = endNode.row 
                        //testCol = endNode.column
                        //console.log( "found heap row: " + openList.heap[index].row + " col : " + openList.heap[index].column)
                    }
                }
                else{
                    //console.log("third if statement")
                    endNodeRecord = new NodeRecord(endNode.row, endNode.column)
                    //endNodeRecord.node = endNode

                    //We'll need to calculate the heuristic value
                    //using the function, since we don't have an existing record to use
                    endNodeHeuristic = this.heuristic(goal.row, endNode.row, goal.column, endNode.column)
                }

                //we're here if we need to update the node
                //update the cost, estimate and connection
                //overwriting heuristics

                endNodeRecord.costSoFar = newCost
                endNodeRecord.connection = connection 
                endNodeRecord.estimatedTotalCost = newCost + endNodeHeuristic
                endNodeRecord.row = endNode.row
                endNodeRecord.column = endNode.column
                //and add it to the open list
                if(!openList.contains(endNodeRecord)){
                    //console.log("adding endNode to open list")
                    openList.addElement(endNodeRecord)
                }
     
                ////console.log(openList.heap.length)
            }  
            //we've finished looking at the connections for the current node, so we add it to the closed list
            //and remove it from the open list
            openList.removeElement(current)
            closedList.addElement(current)
            
            //console.log("open list length: " + openList.heap.length.toString())
            //console.log("closed list length: " + closedList.heap.length.toString())
            //console.log("end of one iteration of while loop: " + iterationWhileCount.toString())
            iterationWhileCount += 1

        }
        //console.log("finished while loop")
        //we're here if we've either found the goal, or if we've no more nodes to search, find which
        if(current.row != goal.row || current.column != goal.column){
            //we've run out of nodes without finding the goal, so there's no solution
            //console.log("no path found")
            return []
        }
        else{
            //compile the list of connections in the path
            let path = new Array<NodeRecord>

            //work back alogn the path, accumulating connections
            //let pathIterator = 0
            //console.log("current row : " + current.row + " current col : " + current.column)
            while(true){
                path.push(current)
                if(current.row == start.row && current.column == start.column){
                    break
                }
                //console.log("in loop current row : " + current.row + " current col : " + current.column)
                if(current.connection != null){
                    
                    current = current.connection.getFromNode()
                    if(closedList.contains(current)){
                        
                        let currentNode = closedList.findElementReturn(current)
                        if(currentNode != null){
                            //console.log("closed contains current")
                            current = currentNode
                        }
                        
                    }
                }
                else{
                    //console.log("current. connection is undefined")
                    break
                }

                
                //console.l("looping")
            }
            //console.l("start row is : " + startRecord.row + " start col is : " + startRecord.column)
            //console.l("path size is : " + path.length.toString())
            //console.l("finished pathfinding")
            //reverse the path, and return it
            return this.reverse(path);
        }
        
    }

    
    /*
    astar(start : Cell, goal: Cell) {
        let openList = new PathfindingPriorityHeap()
        let closedList = new PathfindingPriorityHeap()
        let startRecord = new NodeRecord(start.row, start.column);
        let startRecordCopy = new NodeRecord(start.row, start.column);
        startRecord.estimatedTotalCost = 0
        startRecord.costSoFar = 0
        startRecord.connection = new Connection(0, startRecordCopy, startRecordCopy)

        openList.addElement(startRecord)

        let current = startRecord
        console.log("right before while loop")
        while(openList.heap.length > 0){
            current = openList.smallestElement()

            if(current.row == goal.row && current.column == goal.column){
                break
            }
            let connections = this.graph.getConnections(current.row, current.column)
            console.log("right before connections for loop")
            for(let connection of connections){
                let newCost = current.costSoFar + connection.getCost()
                let endNode = connection.getToNode()
                let endNodeHeuristic = this.heuristic(goal.row, endNode.row, goal.column, endNode.column)
            
                if(openList.contains(endNode)){
                    let endNodeRecord = openList.findElementReturn(endNode)
                    if(endNodeRecord != null){
                        if(endNodeRecord.costSoFar <= newCost){
                            continue
                        }
                        else{
                            //endNodeHeuristic = endNodeHeuristic + newCost - endNodeRecord.costSoFar
                            openList.removeElement(endNodeRecord)
                            //we're gonna add below
                        }
                    }
                }
                if(closedList.contains(endNode)){
                    let endNodeRecord = closedList.findElementReturn(endNode)
                    if(endNodeRecord != null){
                        if(endNodeRecord.costSoFar <= newCost){
                            //openList.removeElement(endNodeRecord)
                            continue
                            //we're gonna add below
                        }
                        else{
                            //endNodeHeuristic = endNodeHeuristic + newCost - endNodeRecord.costSoFar
                            closedList.removeElement(endNodeRecord)

                        }
                    }
                }
                
                endNode.costSoFar = newCost
                endNode.estimatedTotalCost = newCost + endNodeHeuristic
                endNode.connection = connection
                if(!openList.contains(endNode)){
                    openList.addElement(endNode)
                }
                
                
                console.log("one iteration of for loop")

            }
            openList.removeElement(current)
            closedList.addElement(current)
            
        }
        //broken out of while loop
        let path = new Array<NodeRecord>
        //we're here if we've either found the goal, or if we've no more nodes to search, find which
        if(current.row != goal.row || current.column != goal.column){
            //we've run out of nodes without finding the goal, so there's no solution
            console.log("no path found")
            return path
        }
        else{
            //compile the list of connections in the path

            //work back alogn the path, accumulating connections
            //let pathIterator = 0
            //console.log("current row : " + current.row + " current col : " + current.column)
            while(true){
                path.push(current)
                if(current.row == start.row && current.column == start.column){
                    break
                }
                console.log("in loop current row : " + current.row + " current col : " + current.column)
                if(current.connection != null){
                    
                    current = current.connection.getFromNode()
                    if(openList.contains(current)){
                        
                        let currentNode = openList.findElementReturn(current)
                        if(currentNode != null){
                            console.log("closed contains current")
                            current = currentNode
                        }
                        
                    }
                }
                else{
                    console.log("current. connection is undefined")
                    break
                }
            }
            return this.reverse(path)
            //console.l("looping")
        }
        
    }
    */

    reverse(path){
        let reversePath = new Array(path.length)
        for(let i = 0; i < path.length; i++){
            reversePath[path.length - i - 1] = path[i]
        }
        return reversePath
    }

    heuristic(r1,r2,c1,c2) {
        return Math.abs(r1 - r2) + Math.abs(c1 - c2);
    }

}


class MinHeap{
    heap : Array<NodeRecord>
    indexDict : Object
    constructor(){
        this.heap = new Array<NodeRecord>
        this.indexDict = {}
    }


    addElement(nodeRecord : NodeRecord){
        //O(logn)
        this.heap.push(nodeRecord)

        let index = this.heap.length - 1

        let aKey, bKey
        aKey = this.getNodeIndexDictionaryKey(nodeRecord.row, nodeRecord.column)
        this.indexDict[aKey] = index

        let indexValue = nodeRecord.estimatedTotalCost
        let parentIndex = this.parent(index)
        //console.log("index " + index.toString())
        //console.log("parent index " + parentIndex.toString())
        //console.log("heap size : " + this.heap.length)
        let parentIndexValue = this.heap[parentIndex].estimatedTotalCost
        while(index > 0 && indexValue < parentIndexValue){
            let node_a, node_b
            node_a = this.heap[index]
            node_b = this.heap[parentIndex]
            this.heap[index] = node_b
            this.heap[parentIndex] = node_a
            bKey = this.getNodeIndexDictionaryKey(node_b.row, node_b.column)
            aKey = this.getNodeIndexDictionaryKey(node_a.row, node_a.column)
            this.indexDict[bKey] = index
            this.indexDict[aKey] = parentIndex
 
            index = parentIndex
            //parentindex = index
            parentIndex = this.parent(parentIndex)
            indexValue = this.heap[index].estimatedTotalCost
            parentIndexValue = this.heap[parentIndex].estimatedTotalCost
        }

    }

    removeElement(node: NodeRecord){
        //O(logn)
        let index = this.findElementIndex(node)
        let aKey, bKey
        if(index < 0){
            //node not in heap
            return 0
        }
        else{
            //remove element
            //first remove from index dict
            aKey = this.getNodeIndexDictionaryKey(node.row, node.column)
            //delete this.indexDict[aKey]
            this.indexDict[aKey] = -1
            //then remove from heap
            
            //replace the root or element to be deleted by the last element
            //heapify
            //let a = this.heap[index]
            //console.log("removing node row: " + node.row + " col: " + node.column)
            //console.log("removing element at index : " + index + " while heap length is : " + this.heap.length)

            if(index >= (this.heap.length - 1)){
                //aKey and B key are virtually the same, so don't set the index to the length-1 of the array otherwise
                //it will show up as being part of the closed list
               
                this.heap.pop()
            }
            else{
                let b = this.heap[this.heap.length-1]
                this.heap[index] = b
                //console.log("remove b is row : " + b.row + " col: " + b.column + ", index : " + index)
                bKey = this.getNodeIndexDictionaryKey(b.row, b.column)
                this.indexDict[bKey] = index
                            //this.heap[this.heap.length - 1] = a
                this.heap.pop()
                this.heapify(index)
            
            }
        }
        
    }

    heapify(i : number){
        let smallest = i
        let l = this.leftChild(i)
        let r = this.rightChild(i)
        let n = this.heap.length
        //if lefft child is smaller than root
        if(l < n && this.heap[l].estimatedTotalCost < this.heap[smallest].estimatedTotalCost){
            smallest = l
        }
        //if right child is smaller than smallest so far
        if(r < n && this.heap[r].estimatedTotalCost < this.heap[smallest].estimatedTotalCost){
            smallest = r
        }
        
        //if smallest is not root
        if(smallest != i){
            let aIndex, bIndex
            let a = this.heap[i]
            let b = this.heap[smallest]
            this.heap[i] = b
            this.heap[smallest] = a
            aIndex = this.getNodeIndexDictionaryKey(a.row, a.column)
            bIndex = this.getNodeIndexDictionaryKey(b.row, b.column)
            this.indexDict[aIndex] = smallest
            this.indexDict[bIndex] = i

            //recursively heapify the affected sub tree
            this.heapify(smallest)

        }
    }
    smallestElement(): NodeRecord{
        return this.heap[0]
    }

    getNodeIndexDictionaryKey(row : number, col : number){

        let key = [row,col].join(',');
        return key;
    }

    findElementIndex(node: NodeRecord){
        let key = this.getNodeIndexDictionaryKey(node.row, node.column)
        if(key in this.indexDict){
            let index = this.indexDict[key]
            return index
       }
       return -1
    }
    
   /*
    findElementIndex(nodeRecord: NodeRecord){
    
        for(let i = 0; i < this.heap.length; i++){
            let heapNode = this.heap[i]
            if(nodeRecord.isEqual(heapNode)){
                return i
            }
        }
       return -1
    }
    */
    findElementReturn(node : NodeRecord){
        /*
        for(let i of Array[this.heap.length].keys()){
            let nodeRecord = this.heap[i]
            if(nodeRecord.row == row && nodeRecord.column == col){
                return nodeRecord
            }
        }
        */
        let index = this.findElementIndex(node)
        if(index < 0){
            //node not in heap
            return null
        }
        else{
            let foundRecord = this.heap[index]
            return foundRecord
        }
    }

    contains(node : NodeRecord): boolean{
        if(this.findElementIndex(node) >= 0){
            return true
        }
        return false
    }

    parent(i){
        if(i > 0){
            return Math.floor((i-1)/2)
        }
        return 0
    }

    leftChild(i){
        return 2*i + 1
    }
    rightChild(i){
        return 2*i +2
    }
}





type SteeringOuput = {
    linear_accel : Phaser.Math.Vector2;
    angular_accel : number;
}

