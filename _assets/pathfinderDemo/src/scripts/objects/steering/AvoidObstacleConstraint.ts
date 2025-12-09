import Constraint from './interfaces/Constraint'
/*
export default class AvoidObstacleConstraint implements Constraint{
    //hods the obstacle bounding sphere
    center : Phaser.Math.Vector2
    radius : number

    //holds a margin of error by which we'd ideally like to clear the obstacle
    //given as a proportion of the radius (should be 1.0)
    margin : number
    //if a violation occurs, stores the part of the path
    //that causede the problem
    problemIndex : Phaser.Math.Vector2

    constructor(center : Phaser.Math.Vector2, radius : number, margin : number){
        super()
    }
    //page 144
    willViolate(path){
        //check each segment of the path in turn
        for(let i = 0; i < path.length; i++){
            let segment = path[i]

            //if we have a clash, store the current segment
            if(this.distancePointToSegment(this.center,segment) < this.radius){
                let problemIndex = i
                return true
            }
        }
        //no segments caused a problem
        return false
    }

    suggest(path,kinematic, goal){
        let segment = new Phaser.Math.Vector2(0,0)
        //find the closest point on the segment to the sphere center
        let closest = this.closestPointOnSegment(this.center, segment)
        let newPt
        //check if we pass through the center point

        if(closest.length() == 0){
            //get any vector at right angles to the segment
            let dirn = segment.end - segment.start
            let newDirn = this.anyVectorAtRightAngles(dirn)

            // use the new dirn to generate a target
            newPt = new Phaser.Math.Vector2(this.center.x + newDirn.x * this.radius * this.margin, this.center.y + newDirn.y * this.radius * this.margin)


        }else{
            newPt = new Phaser.Math.Vector2(this.center.x + (closest.x - this.center.x) * this.radius * this.margin / closest.length() , 
                this.center.y + (closest.y - this.center.y)* this.radius * this.margin / closest.length())
        }

        //set up the goal and return
        goal.position = newPt
        return goal
    }

    distancePointToSegment(center : Phaser.Math.Vector2, segment ) : number{
        return 0
    }

    closestPointOnSegment(center, segment){
        return new Phaser.Math.Vector2(0,0)
    }

    anyVectorAtRightAngles(){

    }
}
    */