
import Cell from './pathfinding/Cell'
import Grid from './pathfinding/Grid'
import Wall from './pathfinding/Wall'
import { Globals } from "../helpers";

export default class MapGenerator{

    wallSpritesDictionary: Object
    nonWallCellDictionary: Object
    gatheringCenterPoints: Object
    gatheringCells: Object
    grid: Grid
    scene: Phaser.Scene

    rows: integer
    columns: integer
    tileWidth: integer
    tileHeight: integer

    wallTextureString: string
    mapProjectionType: string

    constructor(scene: Phaser.Scene, map_json: any , tileWidth : number, tileHeight : number){
        this.scene = scene
        //this.rows = rows;
        //this.columns = columns;
        this.wallSpritesDictionary = new Object
        this.gatheringCenterPoints = new Object
        this.gatheringCells = new Object
        this.nonWallCellDictionary = new Object
        //this.spawnPointsDict = new Object
        //let spritePixels = this.scene.registry.get('spritePixels')

        this.tileWidth = tileWidth
        this.tileHeight = tileHeight
        //wall texture string has to be defined before grid is generated
        this.wallTextureString = "wall_1" // 'wall_1';
        this.mapProjectionType = "orthogonal" //could be "isometric"
        //this.grid = new Grid(this.rows, this.columns, this.tileWidth, this.tileHeight);
        
        this.grid = this.readMapJSON(map_json, 15);
        this.rows = this.grid.rows
        this.columns = this.grid.columns;

        this.grid = this.generateMap(this.grid)



    }  

    readMapJSON(json, snapSize){

        //let wallColor = json["wall"]["color"];
        let wallObjs = json["wall"]["objects"];
        let gatheringObjs = json["gathering_center"]["objects"];
        let spawnObjs = json["spawn_point"]["objects"]
        let largestCol = 0;
        let largestRow = 0;
        //x,y,w,h
        let c, r, w, h;
        let grid;

        for(let i = 0; i < wallObjs.length; i++){
            c = wallObjs[i]["x"] / snapSize;
            r = wallObjs[i]["y"] / snapSize;
            w = wallObjs[i]["w"] / snapSize;
            h = wallObjs[i]["h"] / snapSize;
            for(let col = c; col < w + c; col++){
                if(largestCol < col){
                    largestCol = col;
                }
                for(let row = r; row < h + r; row++){
                    if(largestRow < row){
                        largestRow = row;
                    } 
                }
            }
        }

        grid = new Grid(largestRow + 1, largestCol + 1, this.tileWidth, this.tileHeight, this.mapProjectionType);

        for(let i = 0; i < wallObjs.length; i++){
            c = wallObjs[i]["x"] / snapSize;
            r = wallObjs[i]["y"] / snapSize;
            w = wallObjs[i]["w"] / snapSize;
            h = wallObjs[i]["h"] / snapSize;
            for(let col = c; col < w + c; col++){
                for(let row = r ; row < h + r; row++){
                    grid.setCellType(row,col, -1)
                    grid.setIsWalkableCell(row,col, false)
                }
            }
        }

        for(let i = 0; i < gatheringObjs.length; i++){
            c = gatheringObjs[i]["x"] / snapSize;
            r = gatheringObjs[i]["y"] / snapSize;
            w = gatheringObjs[i]["w"] / snapSize;
            h = gatheringObjs[i]["h"] / snapSize;
            for(let col = c; col < w + c; col++){
                for(let row = r ; row < h + r; row++){

                    grid.setCellType(row,col, 1)
                }
            }
        }

        for(let i = 0; i < spawnObjs.length; i++){
            c = spawnObjs[i]["x"] / snapSize;
            r = spawnObjs[i]["y"] / snapSize;
            w = spawnObjs[i]["w"] / snapSize;
            h = spawnObjs[i]["h"] / snapSize;
            for(let col = c; col < w + c; col++){
                for(let row = r ; row < h + r; row++){

                    grid.setCellType(row,col, 2)
                    let key = grid.getGridDictionaryKey(row,col)
                    let center_point = grid.calculateTileCenter(row,col)
                    grid.spawnPointsDict[key] = center_point
                     //could set cell here but memory intensive
                }
            }
        }
        //need to regenerate connections
        //TODO regenerate connections when setting is walkable
        //grid.getConnectionsDict = grid.generateConnections()
        //also get gathering center points from the map json
        return grid;
    }

    addToWallSpritesDictionary(row: integer, col: integer): void{

        let key = this.getCellsDictionaryKey(row,col);
        let cell = this.grid.getCell(row, col);
         //redundant
        this.grid.setIsWalkableCell(row,col, false)
        let sprite = new Wall(this.scene, cell.tileCenter.x, cell.tileCenter.y, this.wallTextureString);

        this.wallSpritesDictionary[key] = sprite;

    }

    addToNonWallCellDictionary(row: integer, col: integer): void{

        let key = this.getCellsDictionaryKey(row,col);
        let cell = this.grid.getCell(row, col);
        //regular walkable cell is 0
        //gathering center point is 1
        // gathering spot (around center points) is 2
        this.nonWallCellDictionary[key] = cell.tileCenter;

    }
    
    getCellsDictionaryKey(row: integer,column: integer){
        let key = [row,column].join(',');
        return key;
    }

    parseCellsDictionaryKey(key: string): Array<integer>{

        let stringArray = key.split(',', 2); //split at comma and return at most two elements...need to do better checking this is in format 'r,c'
        let row = Number(stringArray[0]);
        let col = Number(stringArray[1]);
        return [row, col];
    }

    generateWalls(grid: Grid){
        var width = this.columns;
        var height = this.rows;

        let cell = grid.getCell(0,0);

        //generate walls and non walls
        for(let row = 0; row < height; row++){
            for(let col = 0; col < width; col++){
                cell = grid.getCell(row,col);
                if(cell.getCellType() == -1){ //is a wall
                    this.addToWallSpritesDictionary(row,col);
                }
            }

        }
        this.generateNonWallsDict(this.wallSpritesDictionary);

    }
    
    generateNonWallsDict(walls_dict: Object){
        //generate non wlals dict
        //basically any cell that is not a wall, and in range of map
        for(let i = 0; i < this.rows; i++){
            for(let j =0; j < this.columns; j++){
                let key = this.getCellsDictionaryKey(i,j);
                if(key in walls_dict){
                    //wall sprite
                    //do nothing
                }
                else{
                    //not a wall 
                    this.addToNonWallCellDictionary(i,j);
                }
            }
        }
    }
    generateRandomGatheringCenterPoints(nonwallcell_dict: Object){
        let probabilityThreshold = 0.05;
        let probabilityGatheringCenter = 0;
        //let key = this.getCellsDictionaryKey(0,0);
        for(let key in nonwallcell_dict){
            probabilityGatheringCenter = Math.random();
            if(probabilityGatheringCenter <= probabilityThreshold){
                //make gathering center point
                this.gatheringCenterPoints[key] = nonwallcell_dict[key];
            }
        }
    }

    generateGatheringCenterPoints(grid: Grid){

        var width = this.columns;
        var height = this.rows;grid

        let cell = grid.getCell(0,0);

        //generate walls and non walls
        for(let row = 0; row < height; row++){
            for(let col = 0; col < width; col++){
                cell = grid.getCell(row,col);
                if(cell.getCellType() == 1){ //is a wall
                    let key = this.getCellsDictionaryKey(row,col);
                    this.gatheringCenterPoints[key] = cell.tileCenter;
                }
            }

        }
    }

    generateGatheringCells(gathering_centers_dict, nonwallcell_dict){
        let neighbors = [-1, 0, 1];
        let row = -1;
        let col = -1;
        let row_neighbor = -1;
        let col_neighbor = -1;
        //check neighbors of gathering centers
        for(let key in gathering_centers_dict){

            let rowColArray = this.parseCellsDictionaryKey(key);
            row = rowColArray[0];
            col = rowColArray[1];
            for(let r_o of neighbors){
                for(let c_o of neighbors){
                    row_neighbor = r_o + row;
                    col_neighbor = c_o + col;
                    let newKey = this.getCellsDictionaryKey(row_neighbor, col_neighbor);
                    //check if neighbors are non wall cells
                    if(newKey in nonwallcell_dict){
                        //it's not a wall and can be made a gathering cell

                        //check to make sure its not already another center point
                        if(newKey in gathering_centers_dict){
                            //do nothing
                        }
                        else{
                            //set center point vector as value (direction to face or face away from)
                            this.gatheringCells[newKey] = gathering_centers_dict[key]; //center point vector
                        }

                    }
                    
                }
            }
            //if not, make them gathering cells
            //make the value of the dictionary the gathering center point
        }


    }

    generateMap(grid: Grid): Grid{
      
        //let wallTuples = new Phaser.Math.Vector2[];
        //grid is initialized in this.grid
        this.generateWalls(grid);

        //maybe do more to grid in these next two functions
        //TODO could get cells using keys, setting values of these dicts to center points (varies)
        this.generateGatheringCenterPoints(grid);
        this.generateGatheringCells(this.gatheringCenterPoints, this.nonWallCellDictionary);
        return grid;
    }

}
