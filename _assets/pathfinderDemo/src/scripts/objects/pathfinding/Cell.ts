

export default class Cell{
    private isWalkable: boolean;
    row: integer;
    column: integer;
    tileWidth: integer;
    tileHeight: integer;
    tileCenter: Phaser.Math.Vector2;
    cellType: integer;
    g : integer;
    h : integer;
    f : integer;
    parent : Cell;

    constructor(row, column, tileWidth, tileHeight){
        this.isWalkable = true;
        this.g = 0;
        this.h = 0;
        this.f = 0;
        //this.parent = new Cell(0,0, tileWidth, tileHeight);

        
        this.row = row;
        this.column = column;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.tileCenter = this.calculateTileCenter(this.row, this.column);
        this.cellType = 0; //-1 is wall, -0 and above is walkable, // 2 is spawn point
        //walls have sprites/physics/colliders
    }

    calculateTileCenter(row: integer, col: integer): Phaser.Math.Vector2{
        var centerY = this.tileHeight * (row + 1 / 2);
        var centerX = this.tileWidth * (col + 1 / 2);
        return new Phaser.Math.Vector2(centerX, centerY);
    }

    getTileCenter(): Phaser.Math.Vector2{
        return this.tileCenter;
    }

    setCellType(cell_type : integer): void{
        this.cellType = cell_type;
    }

    getCellType(): integer{
        return this.cellType;
    }

    setIsWalkable(canIWalk: boolean): void{
        this.isWalkable = canIWalk;
    }

    getIsWalkable(): boolean{
        return this.isWalkable;
    }

}