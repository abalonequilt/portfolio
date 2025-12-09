import Character from "./objects/characters/Character";
import NPCOne from "./objects/characters/NPCOne";

export const Globals: any = {
  gameDevice : "DESKTOP", //can be either DESKTOP or MOBILE, maybe different types or resolutions
  gameplayCamera : null,
  eventsCenter : new Phaser.Events.EventEmitter(),
  uiTargetCharacters :  new Map<string, Character>,
  uiChaseCharacters :   new Map<string, Character>,
  distanceToTargets :   new Array<number>,
  angleToTargets :   new Array<number>,
  playerColor : "",
  lineOfSightPlayerTargetThisCheck : false,
  lineOfSightPlayerTargetLastCheck: false,
  currentTargetedNPC : null,
  targetLocked : false
};

//Globals.uiTargetCharacters = new Array<Character>
//Globals.uiChaseCharacters = new Array<Character>
//Globals.distanceToTargets = new Array<number>
//Globals.angleToTargets = new Array<number>

export function setsAreEqual(setA, setB) {
  if (setA.size !== setB.size) return false;
  for (let item of setA) {
    if (!setB.has(item)) return false;
  }
  return true;
}