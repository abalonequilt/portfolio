import Character from "./objects/characters/Character";
import NPCOne from "./objects/characters/NPCOne";

export const Globals: any = {
  gameDevice : "DESKTOP", //can be either DESKTOP or MOBILE, maybe different types or resolutions
  gameplayCamera : null,
  eventsCenter : new Phaser.Events.EventEmitter(),
  uiTargetCharacters :  new Map<string, Character>,
  uiPursuerCharacters :   new Map<string, Character>,
  distanceToTargets :   new Array<number>,
  angleToTargets :   new Array<number>,
  playerColor : "",
  lineOfSightPlayerTargetThisCheck : false,
  lineOfSightPlayerTargetLastCheck: false,
  currentTargetedNPC : null,
  targetLocked : false
};

//Globals.uiTargetCharacters = new Array<Character>
//Globals.uiPursuerCharacters = new Array<Character>
//Globals.distanceToTargets = new Array<number>
//Globals.angleToTargets = new Array<number>

export function setsAreEqual(setA, setB) {
  if (setA.size !== setB.size) return false;
  for (let item of setA) {
    if (!setB.has(item)) return false;
  }
  return true;
}


export function constrainAngle45Degrees(angle : number){
    let snapped = Math.round(angle / (Math.PI /4)) * Math.PI/4
    return snapped
}

/*
General game logic: 
1) implement leaderboard (with appropriate data)
2) implement steering behaviors
3) implement Hierarchical task networks
4) implement formation 
5) implement basic abilities
6) some sort of progression/ EXP system in levels with abilities being granted for levels
7) Watch one video ad and there will be no ads for the next (3-5?) matches. need to calculate video ad vs regular ad. also only give this option after player has played a few matches so as not to frustrate
$10 to over $50 for 1000 views - video ads. $0.10 to $1 for 1000 views - regular ads
over 10 to 100x for video ads
8) Make a pathfinding queue and one global pathfinder in order to reduce memory usage (grid takes up memory, pathfinder takes up memory)
*/

/*
Audio things to do:
1) Need audio 'ching' sound for locking/selecting a player/npc
2) Need whispers that vary in volume when a pursuer gets close
3) Need discrete audio sound that plays whenever a new notification pops up "New pursuer on you, this player killed that player etc"
4) Need discrete audio sound that plays whenever blue/red arrows that make it easy to lock pop up
5) Need background music
6) Need kill/stun/fire lock weapon sounds
7) Audio at the start of the match that describes the goal of the match like they do in AC: Multiplayer (IMPORTANT)!!!
8) civilian killed sound
9) when one minute left, 'match will end in one minute' sound
*/

/*
UI things to do:
0) When starting a match, show game mode explanation like they do in AC:multiplayer, see 7) in audio
1) Need a kill/stun text notification spot for whenever the player gets points
2) Need multiplayer / bonus text notification over the kill/stun text notification in 1) that modifies 1)
3) Need small notification text in middle underneath player that pops up to show 'new pursuer on you' or 'this player killed that player', see audio 3)
4) Need to add small arrows to progress circle that show direction of each target, only used in TEAM modes
6) Need large blue and red arrows that show up whenever a target (blue) or pursuer/pursuer (red) fuck up and get reckless/run around, kill someone maybe?
7) Need a lock icon, and need to put the actionButton on top of it when in kill range (so the Yoffset increases for locked characters)
8) Progress Circle should light up and change color/opacity when line of sight with a target, also stronger outline to define the circle
9) Poison shader/effect when poisoned
10) when one minute left, UI time background starts blinking red
11) UI - show how many pursuers you have. Sho how many pursuers your target has as well
12) Ability icons, and a timer overlay on them and a proportionate fill when they've been used
13) death screen slow mo where another player kills you, maybe just zoom into the kill
14) respawn screen that allows you to change 'profiles' of abilities
15) finish screen with kills/deaths/points and modifier kills (exp is granted at this screen). titles are also granted

More general UI:
1) Main screen (Input Username, Find Match, QuickMatch, Settings, How to Play)
2) Find Match -> Show different game mode icons, with description of game modes
3) Settings -> Master volume bar, Sound effects bar, Music bar, Audio on/off, color blind settings,
4) How to Play -> screen changes for Desktop/Mobile, but basically show WASD to move, Space to Attack/Stun, Left click to select/lock, Hold SHIFT to run, TAB for leaderboard
5) Mobile UI buttons in gameplay screen like Leaderboard, settings, if isometric rotate button, A/B/X/Y buttons, joystick buttons
6) Get a font and add panels to make UI look spiffy
*/

