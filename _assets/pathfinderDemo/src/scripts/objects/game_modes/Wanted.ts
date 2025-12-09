import GameMode from "./GameMode";

export default class Wanted extends GameMode{

    constructor(timeLimit, scoreToWin, numRounds){
        super(timeLimit, scoreToWin, numRounds)
    }
}