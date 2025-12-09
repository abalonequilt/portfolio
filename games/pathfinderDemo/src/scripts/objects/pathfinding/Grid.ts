import Cell from './Cell'
import NodeRecord from './NodeRecord'
import Connection from './Connection'
export default class Grid{
    rows: number;
    columns: number;
    tileWidth: number;
    tileHeight: number;
    widthInPixels: number;
    heightInPixels: number;
    gridDict: Object;
    getConnectionsDict: Object;
    mapProjectionType : string
    spawnPointsDict : Object
    

    constructor(rows, columns, tileWidth, tileHeight,mapProjectionType){
        this.rows = rows;
        this.columns = columns;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.widthInPixels = this.columns * this.tileWidth;
        this.heightInPixels = this.rows * this.tileHeight;
        this.spawnPointsDict = new Object


        //this.gridDict = new Object; 
        this.gridDict = this.generateGrid();
        //this has to come after this.gridDict generation line
        this.getConnectionsDict = this.generateConnections()
        this.mapProjectionType = mapProjectionType //"orthogonal" //can be isometric
        
    }

    generateGrid(): Object{
        let gridDict = {};
        for(let r = 0; r < this.rows; r++){
            for(let c = 0; c < this.columns; c++){
                let key = this.getGridDictionaryKey(r,c);
                gridDict[key] = new Cell(r,c, this.tileWidth, this.tileHeight);
            }
        }
        return gridDict;

    }

    generateConnections() : Object{
        let getConnectionsDict = {}
        
        let directions = [[-1,0],[1,0],[0,1],[0,-1],[-1,1],[1,1],[-1,-1],[1,-1]]
        for(let r = 0; r < this.rows; r++){
            for(let c = 0; c < this.columns; c++){
                let key = this.getGridDictionaryKey(r,c);
                let thisCell = this.gridDict[key]
                let thisCellIsWalkable = thisCell.getIsWalkable()
                let connections = new Array<Connection>
                if(thisCellIsWalkable){
                    
                    for(let i = 0; i < directions.length; i++){
                        let direction = directions[i]
                        let rowNeighbor = direction[0] + r
                        let colNeighbor = direction[1] + c
                        let newKey = this.getGridDictionaryKey(rowNeighbor,colNeighbor);
                        //check if in bounds of grid dictionary
                        if(newKey in this.gridDict){
                            let neighborCell = this.gridDict[newKey]
                            let neighborIsWalkable = neighborCell.getIsWalkable()
                            if(neighborIsWalkable){
                                
                                let nodeRecordTo = new NodeRecord(rowNeighbor,colNeighbor)
                                let nodeRecordFrom = new NodeRecord(r,c)
                                nodeRecordTo.costSoFar = 0
                                nodeRecordFrom.costSoFar = 0
                                nodeRecordTo.estimatedTotalCost = 0
                                nodeRecordFrom.estimatedTotalCost = 0
                                if(i >= 0 && i <= 3){
                                    //i should be in rante 4-7 (inclusive,inclusive)
                                    let connection = new Connection(1, nodeRecordFrom, nodeRecordTo)
                                    connections.push(connection)
                                }
                                else if(i >= 4 && i <= 7){
                                    //i should be in rante 4-7 (inclusive,inclusive)
                                    //thse are diagonal paths
                                    let connection = new Connection(Math.sqrt(2), nodeRecordFrom, nodeRecordTo)
                                    connections.push(connection)
                                };
                            }
                            else{
                                //console.log("unwalkable row: " + rowNeighbor.toString() + ", col: " + colNeighbor.toString())
                            }
                        } 
                    }
        
                    getConnectionsDict[key] = connections
                }

            }
        }
        return getConnectionsDict
    }

    getConnections(row, col){
        if(this.getConnectionsDict != null){
            let key = this.getGridDictionaryKey(row, col);
            return this.getConnectionsDict[key]
        }
    }
    getCell(row: number, col: number): Cell{
        let key = this.getGridDictionaryKey(row, col);
        let cell = this.gridDict[key];
        return cell;
    }

    setIsWalkableCell(row: number, col:number, canWalk: boolean){
        let key = this.getGridDictionaryKey(row, col);
        this.gridDict[key].setIsWalkable(canWalk)

        //regenerate connections dictionary
        //TODO !!! not sure what I did and why this needs to be regenerated
        //added the last four elements of directions, and made the j<=3 if statements
        //basically only want to use the d2 'j' value to calculate the distance to neighbor
        let directions = [[-1,0],[1,0],[0,1],[0,-1],[-1,1],[1,1],[-1,-1],[1,-1]]
        for(let direction of directions){
            let rowNeighbor = row + direction[0]
            let colNeighbor = col + direction[1]
            let key = this.getGridDictionaryKey(rowNeighbor,colNeighbor);
            if(key in this.gridDict){
                let connections = new Array<Connection>
                for (let j = 0; j < directions.length; j++){
                    let d2 = directions[j]
                    let tempNeighborRow = rowNeighbor + d2[0]
                    let tempNeighborCol = colNeighbor + d2[1]
                    let tempKey = this.getGridDictionaryKey(tempNeighborRow, tempNeighborCol)
                    if(tempKey in this.gridDict){
                        if(this.gridDict[tempKey].getIsWalkable()){
                            let nodeRecordFrom = new NodeRecord(rowNeighbor,colNeighbor)
                            let nodeRecordTo = new NodeRecord(tempNeighborRow, tempNeighborCol)
                            nodeRecordTo.costSoFar = 0
                            nodeRecordFrom.costSoFar = 0
                            nodeRecordTo.estimatedTotalCost = 0
                            nodeRecordFrom.estimatedTotalCost = 0
                            
                            if(j >= 0 && j <= 3){
                                //i should be in rante 4-7 (inclusive,inclusive)
                                let connection = new Connection(1, nodeRecordFrom, nodeRecordTo)
                                connections.push(connection)
                            }
                            else if(j >= 4 && j <= 7){
                                //i should be in rante 4-7 (inclusive,inclusive)
                                //thse are diagonal paths
                                let connection = new Connection(Math.sqrt(2), nodeRecordFrom, nodeRecordTo)
                                connections.push(connection)
                            }
                            
                            
                        }
                    }
                }
                this.getConnectionsDict[key] = connections
            }
        }
    }



    setCellType(row: number, col:number, cell_type : number){
        let key = this.getGridDictionaryKey(row, col);
        this.gridDict[key].setCellType(cell_type)
    }
    
    calculateTileCenter(row: number, col: number): Phaser.Math.Vector2{
        let centerY, centerX;
        if(this.mapProjectionType == "orthogonal"){
            centerY = this.tileHeight * (row + 0.5);
            centerX = this.tileWidth * (col + 0.5);
        }
        else if(this.mapProjectionType == "isometric"){

        }
        else{
            
        }

        return new Phaser.Math.Vector2(centerX, centerY);
    }

    getRandomSpawnPoints(count : number){
        const entries = Object.entries(this.spawnPointsDict);

        // Shuffle the array
        const shuffled = entries.sort(() => Math.random() - 0.5);

        // Take first `count`
        return shuffled.slice(0, count);
    }

    getGridDictionaryKey(row: number,column: number){
        let key = [row,column].join(',');
        return key;
    }

    parseCellsDictionaryKey(key: string): Array<number>{

        let stringArray = key.split(',', 2); //split at comma and return at most two elements...need to do better checking this is in format 'r,c'
        let row = Number(stringArray[0]);
        let col = Number(stringArray[1]);
        return [row, col];
    }


    getRCCoordsWithXY(x: number , y: number): Array<number>{
        //origin is at the top left
        //positive X to the right
        //positive Y goes down
        let row, col;
        if(this.mapProjectionType == "orthogonal"){
            col = Math.floor(x / this.tileWidth);
            row = Math.floor(y / this.tileHeight);
        }
        else if(this.mapProjectionType == "isometric"){

        }
        else{

        }

        //console.log('debugging rc coords: ' + row + ',' + col)
        //console.log('debugging tile height ' + this.tileHeight + ',' + this.tileWidth)
        return [row,col]
    }

    
    getCellWithXY(position : Phaser.Math.Vector2){
        let x = position.x
        let y = position.y
        let rcCoords = this.getRCCoordsWithXY(x,y)
        //console.log('debugging grid: ' + rcCoords[0] + ',' + rcCoords[1])
        let cell = this.getCell(rcCoords[0], rcCoords[1])
        return cell
    }

    rotateMap90(){
        //90 deg : x = width - y - 1 , y = x
        //180 deg : x = width - x - 1, y = height - y - 1
        //270 x = y, y = height - x - 1
        let newGridDict = {}
        for(let r = 0; r < this.rows; r++){
            for(let c = 0; c < this.columns; c++){
                let key = this.getGridDictionaryKey(r,c)
                //let newKey = this.getGridDictionaryKey(c )
            }
        }
    }
}