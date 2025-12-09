

import Pathfinder from '../pathfinding/Pathfinder';
import Grid from '../pathfinding/Grid'
import NodeRecord from '../pathfinding/NodeRecord'
import Kinematic from '../Kinematic'
import Character from './Character'
import { Globals } from "../../helpers";

export default class NPCOne extends Character {

  health: number;
  overlappingPlayer: boolean;

  finalTarget : Phaser.Math.Vector2 | null
  pathTarget : Phaser.Math.Vector2 | null
  pathfinder : Pathfinder
  grid : Grid

  npcActive : boolean
  pathingAllowed : boolean
  path : Array<Phaser.Math.Vector2>
  //pathCalled : boolean
  pathIterator : number
  randomSmallNumberForPath : number

  constructor(scene : Phaser.Scene, x : number, y : number, texture : string, grid : Grid) {
    super(scene, x, y, texture)
    this.x = x;
    this.y = y;
    this.scene = scene;
    this.health = 100.0;
    
    scene.physics.add.existing(this);
    this.scene.add.existing(this);
    this.setTexture(texture);
    this.setPushable(false);

    this.overlappingPlayer = false;

    this.finalTarget = this.getRandomTarget()


    this.grid = grid
    this.pathfinder = new Pathfinder(grid)


    this.pathTarget = null
    this.path = new Array<Phaser.Math.Vector2>
    //this.pathCalled = false
    this.pathIterator = 0
    this.pathingAllowed = false
    this.npcActive = false
    this.randomSmallNumberForPath = 5


  } 
  
  override update(): void{
    this.kinematic.position = new Phaser.Math.Vector2(this.x, this.y)
    this.kinematic.orientation = this.rotation
    if(this.health <= 0){
      //TODO do something about death animation before destroying object
      //destroy object upon death
      console.log(this.name + " is destroyed");
      //this.destroy();
    }
    if(this.npcActive){
        
    }
 
    //this.seekPlayer()
    //this.setPathTarget()


  }

  oneSecondCall(){
    //this.pathCalled = false
    if(this.npcActive){
        this.pathingAllowed = true
    }
    
    /*
    for(let i = 0; i < this.path.length; i++){
      let x = this.path[i].x
      let y = this.path[i].y
      console.log("x: " + x.toString() + " y: " + y.toString())
    }
    */
    
  }

  setPath(target:Phaser.Math.Vector2){
    this.path = this.getPathXY(this.kinematic.position, target)
    //TODO need to make path with 45 angle entrances
    if(this.path.length > 1){
      //this.pathIterator = this.path.length-1 //RETARD should be 1
      this.pathIterator = 1
      this.pathTarget = this.path[this.pathIterator]
      if(this.pathTarget != null){
        //let direction = this.calculateDirToPoint(this.pathTarget);
        this.setNPCAngle(this.pathTarget) // RETARD
      }

    }
    else{
      this.pathIterator = 0
    }

  }

  setPathTarget(){
    if(this.pathTarget != null && this.path.length > this.pathIterator){
      if(this.path.length <= 2){
        return
      }
        //follow
      let direction = this.calculateDirToPoint(this.pathTarget);
      //console.log("direction : " + direction.x + "y :" + direction.y)
      //console.log(direction.toString());
      let distance = this.getDistanceToPoint(this.pathTarget);
      //TODO this small number could be the reason things bump into walls if that's an issue
      this.randomSmallNumberForPath = Math.random() * 17 + 15 //should probably be less than spritePixels/2
      if(distance > this.randomSmallNumberForPath){
  
        //TODO!!! constrain direction in 45 degree increments
        this.setVelocityWithDir(direction, this.characterSpeed)       //RETARD
        
      }
      else{ 
        /*
        while(distance < this.randomSmallNumberForPath){
          //adds at least once as distance condition was originally used to get in else statement
          this.pathIterator +=1
          if(this.path.length <= this.pathIterator){
            //this.pathTarget = null
            break
          }
          this.pathTarget = this.path[this.pathIterator]
          //doing this to get rid of small chebyshev paths
          distance = this.getDistanceToPoint(this.pathTarget);

        }
        */

       this.pathIterator +=1  //Remove RETARD if above while loop gets uncommented
       
        if(this.path.length > this.pathIterator){
          this.pathTarget = this.path[this.pathIterator] //Remove RETARD if above while loop gets uncommented

          //console.log("changing target : " + "x: " + this.pathTarget.x + ", y: " + this.pathTarget.y)
          this.setNPCAngle(this.pathTarget) //RETARD
          
        }
        else{
          this.setVelocityWithDir(Phaser.Math.Vector2.ZERO, 0)
        }
        
        if(this.pathIterator === this.path.length -1){
          //do nothing
          this.setVelocityWithDir(Phaser.Math.Vector2.ZERO, 0)
        }
      }
    }


  }

  constrainAngle45Degrees(angle : number){
    let snapped = Math.round(angle / (Math.PI /4)) * Math.PI/4
    return snapped
  }

   setNPCAngle(target : Phaser.Math.Vector2){
    //TODO fix this
    let angleToTarget = Phaser.Math.Angle.Between(this.x,this.y, target.x, target.y)
    
    let npcAngle = this.rotation

    //angleToTarget = Phaser.Math.Angle.Normalize(angleToTarget)
    npcAngle = this.constrainAngle45Degrees(angleToTarget)
    /*
    if(this.targetCharacters[0].name === "player"){
      console.log("this player is : " + this.characterColor)
        console.log("angle to target : " + angleToTarget/Math.PI  + " *Math.PI")
        console.log("untouched rotation is : " + this.rotation/Math.PI + " * Math.PI")
        console.log("npc angle: " + npcAngle/Math.PI  + " *Math.PI")
        //angleToTarget = Phaser.Math.Angle.Wrap(angleToTarget)

        console.log("wrapped npc angle + pi/2: " + Phaser.Math.Angle.Wrap(npcAngle + Math.PI/2) /Math.PI  + " *Math.PI")
    }
    */
    let newAngle = Phaser.Math.Angle.Wrap(npcAngle + Math.PI/2)
    if(this.rotation !== newAngle ){
        this.rotation = newAngle
    }
    
  }

  seekPlayer(){
    //follow
    let direction = this.calculateDirToTarget();
    //console.log(direction.toString());
    let distance = this.getDistanceToPlayer();
    if(distance > 100){
      this.setVelocityWithDir(direction, this.characterSpeed)
    }
    else{
      this.setVelocity(0,0);
      //set new target
      this.finalTarget = this.getRandomTarget();

    }
  }
  
  getPathNodeRecords(start : Phaser.Math.Vector2, target : Phaser.Math.Vector2) : Array<NodeRecord>{
    let toCell, fromCell
    //console.log("player " + this.kinematic.position)
    //console.log("target " + target)

    fromCell = this.grid.getCellWithXY(start)
    toCell = this.grid.getCellWithXY(target)
    //console.log("from cell : " + fromCell.row + ", " + fromCell.col)
    let path = this.pathfinder.astar(fromCell, toCell)
    return path
  }


  getPathXY(start : Phaser.Math.Vector2, target : Phaser.Math.Vector2): Array<Phaser.Math.Vector2>{
    let path = new Array<Phaser.Math.Vector2>
    //console.log("start : " + start.x + ',' + start.y)
    let nodeRecordPath = this.getPathNodeRecords(start, target)
    if(nodeRecordPath != null){
      for(let node of nodeRecordPath){
        let row = node.row
        let col = node.column
        let tileCenter = this.grid.calculateTileCenter(row,col)
        path.push(tileCenter)
      }
    }

    //replace last element with this.target instead of using the tile center
    
    if(path.length > 0){
            //TODO
      path[0] = start
      //this gets erased if the length is 1
      path[path.length-1] = target

    }
    //ignore the first element anyways
    //return this path but in 45 degree turns
   
    //let newPath = path
    let chebyshevPath = this.shortest45Path(path)
    /*
    if(this.targetCharacters[0].name == "player"){
      
      console.log("Path Length: " +  chebyshevPath.length)
      for(let i =0; i < chebyshevPath.length; i++){
        console.log("path point: " + chebyshevPath[i].x + ", " + chebyshevPath[i].y)
      }
    }
    */
    /*
    let newChebyshevPath = new Array<Phaser.Math.Vector2>
    let lastTempPathIter = 0
    let tempPathIter = 0
    let distance = 0
    newChebyshevPath.push(chebyshevPath[0])
    while(true){
      tempPathIter += 1
      //adds at least once as distance condition was originally used to get in else statement
      if(chebyshevPath.length <= tempPathIter){
        //this.pathTarget = null
        break
      }
      //doing this to get rid of small chebyshev paths
      distance = Phaser.Math.Distance.Between(chebyshevPath[lastTempPathIter].x, chebyshevPath[lastTempPathIter].y, chebyshevPath[tempPathIter].x, chebyshevPath[tempPathIter].y)
      if(tempPathIter >= 1 && distance > 0){ //modify this to a small number like 5 so not all points get added
        lastTempPathIter = tempPathIter
        newChebyshevPath.push(chebyshevPath[tempPathIter])
      }
    }
    */
    //console.log(newPath)
    //console.log("chebyshev path length is : " + chebyshevPath.length)
    //console.log("compressed chebyshev path length is : " + newChebyshevPath.length)
    //return newChebyshevPath //RETARD
    
    return chebyshevPath
    //return path //RETARD chebyshevPath
  }



  getRandomTarget(){
    return new Phaser.Math.Vector2(Math.random() * this.BOUNDS_WIDTH, Math.random() * this.BOUNDS_HEIGHT)
  }
  getHit(damage){
    this.health -= damage;
  }

  attackPlayer(){
    //TODO play attack animation
    //if overlapping with player
    if(this.targetCharacters.size > 0){
      if(this.overlappingPlayer){
        //this.targetCharacters.health -= this.damagePerAttack;
      }
    }

  }

  calculateDirToPoint(point : Phaser.Math.Vector2): Phaser.Math.Vector2{
        //get direction vector from enemy to player
    const direction = new Phaser.Math.Vector2(
      point.x - this.x,
      point.y - this.y,
    ).normalize();

    return direction;
  }

  getDistanceToPoint(point : Phaser.Math.Vector2): number{
    let distance = Phaser.Math.Distance.Between(this.x, this.y, point.x, point.y);
    return distance;
  }

  //move enemy toward player
  setVelocityWithDir(direction : Phaser.Math.Vector2, speed:number){
    let velocity = new Phaser.Math.Vector2(direction.x*speed, direction.y * speed)
    this.kinematic.velocity = velocity
    this.setVelocity(velocity.x, velocity.y)
  }

  calculateDirToTarget() : Phaser.Math.Vector2{
    if(this.targetCharacters.size > 0){
      let playerVector = new Phaser.Math.Vector2(this.targetCharacters.get(this.randomTargetKey)!.x, this.targetCharacters.get(this.randomTargetKey)!.y)
      return this.calculateDirToPoint(playerVector);
    }
    else{
      let playerVector = new Phaser.Math.Vector2(this.x, this.y)
      return this.calculateDirToPoint(playerVector);
    }

  }
  getDistanceToPlayer(): number{
    if(this.targetCharacters.size > 0){
      let playerVector = new Phaser.Math.Vector2(this.targetCharacters.get(this.randomTargetKey)!.x, this.targetCharacters.get(this.randomTargetKey)!.y)
      return this.getDistanceToPoint(playerVector)
    } 
    else{
      let playerVector = new Phaser.Math.Vector2(this.x, this.y)
      return this.getDistanceToPoint(playerVector);
    }
  }

  selectSprite(inPlayerTargetChaserMaps : boolean){
      // Example selection effect: add green tint
      //sprite.setTint(0x00ff00);

      // Save reference if you want to track selected sprite
      //this.selected = sprite;
      //maybe only have the ability to select sprites that are NPCs, active players in this.player's target or chaser map
      if(!this.activePlayer || inPlayerTargetChaserMaps){
        Globals.currentTargetedNPC = this
        Globals.targetLocked = true
        console.log('Selected:', this.texture.key);
      }

  }
  
  sign(n) { 
    return n === 0 ? 0 : (n > 0 ? 1 : -1); 
  }

  // Return minimal 45° path points between two endpoints (includes end, per-step)
  shortest45SegmentPoints(a : Phaser.Math.Vector2, b : Phaser.Math.Vector2) {
    let [x, y, tx, ty] = [a.x, a.y, b.x, b.y];
    let dx = tx - x, dy = ty - y;
    const steps = Math.max(Math.abs(dx), Math.abs(dy));
    const path = [new Phaser.Math.Vector2(x,y)];
    for (let i = 0; i < steps; i++) {
        dx = tx - x; dy = ty - y;
        const sx = this.sign(dx);
        const sy =this.sign(dy);
        // if both non-zero, this is a diagonal; otherwise a straight 45° axis step
        if (dx != 0 && dy != 0) {
          x += sx; y += sy;        // diagonal
        } 
        else if (dx != 0) {
          x += sx;                 // straight horizontal
        } 
        else if (dy != 0) {
          y += sy;                 // straight vertical
        }
        path.push(new Phaser.Math.Vector2(x,y));
    }


    return path;
  }
  shortest45SegmentMinimal(a : Phaser.Math.Vector2, b : Phaser.Math.Vector2) {
    const [x1, y1, x2, y2] = [a.x, a.y, b.x, b.y];
   
    const dx = x2 - x1;
    const dy = y2 - y1;

    const sx = this.sign(dx);
    const sy = this.sign(dy);

    const stepsDiag = Math.min(Math.abs(dx), Math.abs(dy));
    const stepsStraight = Math.abs(Math.abs(dx) - Math.abs(dy));

    const path = [a];

    if (stepsDiag > 0 && stepsStraight > 0) {
      // there will be a diagonal phase, then a straight phase
      const turnX = x1 + sx * stepsDiag;
      const turnY = y1 + sy * stepsDiag;
      path.push(new Phaser.Math.Vector2(turnX, turnY));
    }

    path.push(new Phaser.Math.Vector2(x2, y2));
    return path;
  }

    // Merge consecutive collinear 8-direction steps -> only turn points remain
  compressTurns(points : Array<Phaser.Math.Vector2>) {
    if (points.length <= 2) return points;
    const out = [points[0]];
    let prevDir : Phaser.Math.Vector2 | null = null;
    for (let i = 1; i < points.length; i++) {
        let vector0 = out[out.length - 1];
        let vector1 = points[i];
        const dx = Math.sign(vector1.x - vector0.x), dy = Math.sign(vector1.y - vector0.y);
        const dir = new Phaser.Math.Vector2(dx,dy);
        if (prevDir && dir.x == prevDir.x && dir.y == prevDir.y){
            // same direction: extend last segment by replacing last point
            out[out.length - 1] = vector1;
           
        }
        else {
          out.push(vector1);
          prevDir = dir;
        }
      }
      return out;
    }

    // Convert an entire path to the shortest 45° path between each pair, then compress
    shortest45Path(originalPoints : Array<Phaser.Math.Vector2>) {
      if (originalPoints.length <= 1) return originalPoints;
      let stepped = [originalPoints[0]];
      for (let i = 0; i < originalPoints.length - 1; i++) {
          const seg = this.shortest45SegmentMinimal(originalPoints[i], originalPoints[i + 1]);
          //let segmentSlice = seg.slice(1)
          for(let j = 1; j< seg.length; j++){
            stepped.push(seg[j])
          } 
          //stepped.push(seg.slice(1)); // avoid duplicating the junction point, the first point is the junction
        
      }
      //let compressedPath = this.compressTurns(stepped);
      //console.log("this compressed path is : " + compressedPath.length)
      return stepped
    }

// 
}