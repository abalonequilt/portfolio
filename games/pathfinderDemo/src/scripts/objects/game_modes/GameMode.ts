
export default class GameMode{
    time_limit_seconds : number
    score_to_win : number
    number_of_rounds : number
    
    constructor(timeLimit : number, scoreToWin : number, numRounds : number){
        this.time_limit_seconds = timeLimit
        this.score_to_win = scoreToWin
        this.number_of_rounds = numRounds

    }
}