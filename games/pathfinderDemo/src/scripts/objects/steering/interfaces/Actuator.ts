
export default interface Actuator{

    //returns the route that the character will take to the given goal
    getPath(kinematic,goal)
    //returns the steering output for achieving the given path
    output(path, kinematic, goal)
}