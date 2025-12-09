
import { Globals } from "../helpers";

export default class PlayUIScene extends Phaser.Scene {
  scoreText
  fpsText
  //targetText
  unknownIcon
  characterIconsDict : Object
  hoverAttackButton
  uiTargetContainer
  uiLeaderboardContainer
  timerText
  progressEllipse
  progressMaxDistance
  progress
  progressCircleRadius
  oneSecondTimer
  halfSecondTimer
  progressFilled : boolean
  progressThreshold : number
  progressEllipseCoordinates : Phaser.Math.Vector2
  screenWidth : number
  screenHeight : number
  matchTime : number
  progressFullFillThreshold : number
  progressFillColor : number
  progressAlphaValue : number
  scoreDict : Map<string,number>
  tabKey
  constructor() {
    super({ key: 'PlayUIScene' })
    this.progressMaxDistance = 64*20  // distance at which circle starts growing
    this.progress = 0     // Map distance to "progress" (closer = fuller)
    this.progressCircleRadius = 50     // Draw circle with progress fill
    this.screenWidth = 0
    this.screenHeight = 0
    this.matchTime = 60*10
    this.progressThreshold = 0.9
    this.progressFullFillThreshold = 64*8
    this.progressFillColor = 0xFFFFFF
    this.progressAlphaValue = 0.4
    this.characterIconsDict = new Object
    this.scoreDict = new Map
  }
  preload(){
    this.load.image('unknown_target','assets/img/sprites/circle2eye_unknown_32px.png')
    this.load.image('space_bar' , 'assets/img/UI_elements/Space_Key_Light.png')
  }
  create() {
    this.screenWidth = Number(this.game.config.width)
    this.screenHeight = Number(this.game.config.height)

    this.fpsText = this.add.text(10, this.screenHeight-50, '', { fontSize: '16px'}).setOrigin(0)
    this.scoreText = this.add.text(16, 16, '1st: 0', { fontSize: '32px' }).setOrigin(0);
    this.scoreText.setColor('#ffffff');
    this.timerText = this.add.text(112, 50, this.getTimerString(), { fontSize: '32px' }).setOrigin(0);
    this.timerText.setColor('#ffffff');
    //this.uiLayer = this.add.container(BOUNDS_WIDTH / 2 - DEFAULT_WIDTH + 16, BOUNDS_HEIGHT / 2 - DEFAULT_HEIGHT + 16, [scoreText]);
    //this.cameras.main.ignore(this.uiLayer);

    //need UI for leaderboard

    // Title
    let leaderboardTitle = this.add.text(130, 0, 'Leaderboard', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setName('LeaderboardTitle')

    // Render top 8
    let leaderboardElements = new Array<Phaser.GameObjects.Text>
    leaderboardElements.push(leaderboardTitle)
    for(let i = 1; i <= 8; i++){
      //console.log("name: " + name + ", score: " + score)
      let name = ''
      let score = 0
      let nameTag = i.toString() + '.name'
      let scoreTag = i.toString() + '.score'
      let nameText = this.add.text(0, 0 + i * 25, `${i}. ${name}`, {
        fontSize: '18px',
        color: '#ffff66'
      }).setName(nameTag)

      let scoreText = this.add.text(260, 0 + i * 25, score.toString(), {
        fontSize: '18px',
        color: '#ffffff'
      }).setOrigin(1, 0).setName(scoreTag)
      leaderboardElements.push(nameText)
      leaderboardElements.push(scoreText)

    }
    this.uiLeaderboardContainer = this.add.container(this.screenWidth/2 - 250 , 30, leaderboardElements);
    this.uiLeaderboardContainer.setVisible(false)

    // Blue circle "radial meter"
    this.progressEllipse = this.add.graphics();

    this.progressEllipse.clear();
    this.progressEllipse.setAlpha(1)
    this.progressEllipse.lineStyle(2, 0x0000ff, 1);
    this.progressEllipseCoordinates = new Phaser.Math.Vector2(100, this.screenHeight * 0.25)
    //this.progressEllipse.strokeEllipse(this.progressEllipseCoordinates.x, this.progressEllipseCoordinates.y, this.progressCircleRadius + 20, this.progressCircleRadius);
    
    //uiTargetContainer logic

    // Draw rectangle background (using Graphics)
    let box = this.add.graphics();
    box.fillStyle(0x222222, 0.8); // dark gray with transparency
    box.fillRoundedRect(0,0, 100, 100, 10); // x, y, width, height, radius
    box.lineStyle(5, 0xffffff, 1);
    box.strokeRoundedRect(0, 0, 100, 100, 10);

    // Convert graphics to texture so we can use it as a sprite
    box.generateTexture('uiBox', 100, 100);
    box.destroy();

    // UI box sprite
    let boxSprite = this.add.image(0, 0, 'uiBox').setOrigin(0);

    // Add label text
    let label = this.add.text(15, 5, "Target", {
        //fontFamily: 'Arial',
        fontSize: '18px',
        color: '#ffffff'
    });
    
    // Add texture inside the box
    let targetIcon = this.add.image(16, 30, 'unknown_target')
        .setDisplaySize(64, 64) // scale to fit
        .setOrigin(0)
        .setVisible(true)
        .setName("targetIcon")
        
    
    // Group them in a container
    this.uiTargetContainer = this.add.container(this.screenWidth-140, 16, [boxSprite,label,targetIcon]);

    this.hoverAttackButton = this.add.image(0, 0, 'space_bar')
      .setVisible(false)
      .setDisplaySize(64,64)
      .setName('hoverAttackButton')
      .setOrigin(0)
 
    Globals.eventsCenter.on('UI-set-targetIcon',(characterName) => {
        this.drawTargetRectangle(characterName)
    });

    Globals.eventsCenter.on('UI-hover-npc-attack-button',(x,y) => {
        this.drawHoverAttackButton(x,y)
    });

    Globals.eventsCenter.on('UI-remove-hover-npc-attack-button',() => {
        this.disableHoverAttackButton()
    });

    Globals.eventsCenter.on('update-leaderboard',(characterPlayer,score) => {
      //console.log("updating leaderboard")
        this.scoreDict.set(characterPlayer,score)
    });

    this.events.on(Phaser.Scenes.Events.CREATE, () => {
        this.sceneReady()// works, because closure captures it
    });

    this.oneSecondTimer = this.time.addEvent({
        callback: this.oneSecondUpdate,
        callbackScope: this,
        delay: 1000,
        loop: true
    })
    this.halfSecondTimer = this.time.addEvent({
        callback: this.halfSecondUpdate,
        callbackScope: this,
        delay: 500,
        loop: true
    })
    this.progressFilled = false
    // Input: TAB key
    if (!this.input.keyboard) {
      throw new Error("Keyboard plugin is not enabled in the config!");
    }
    this.tabKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);
    this.tabKey.on('down', this.drawLeaderboard, this);
    this.tabKey.on('up', this.disableLeaderboard, this);
    //cleanup at shutdown
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
		  Globals.eventsCenter.off()
	  })

  }
  
  sceneReady(){
    Globals.eventsCenter.emit('UI-ready-to-receive')
  }

  update() {
    const fps = this.game.loop.actualFps;
    this.fpsText.setText(`FPS: ${fps.toFixed(1)}`);
    /*
    if(Globals.currentTargetedNPC && Globals.gameplayCamera){
      //not null
      //needs an offset above
      let [newX, newY] = this.worldToCameraCoords(Globals.gameplayCamera, Globals.currentTargetedNPC.x, Globals.currentTargetedNPC.y)
      this.hoverAttackButton.setPosition(newX, newY)
    }*/
  
  }

  worldToCameraCoords(camera, worldX, worldY){
    const screenX = (worldX - camera.worldView.x) * camera.main.zoom;
    const screenY = (worldY - camera.worldView.y) * camera.main.zoom;
    return [screenX, screenY]
  }

  drawHoverAttackButton(x : number, y : number){
    //console.log("in hover button")
    let xOffset, yOffset = 0
    if(Globals.gameDevice === "DESKTOP"){
      //change to "Space Bar" button rendered by this.hoverAttackButton
      xOffset = -32
      yOffset = -75
    }
    else if(Globals.gameDevice === "MOBILE"){
      //change which image is rendered by this.hoverAttackButton
      //change to "X" mobile button
      xOffset = 0
      yOffset = 0
    }
    else{
      xOffset = 0
      yOffset = 0
    }
    this.hoverAttackButton.setPosition(x + xOffset , y + yOffset)
    this.hoverAttackButton.setVisible(true)
  }

  disableHoverAttackButton(){
    this.hoverAttackButton.setVisible(false)
  }

  drawLeaderboard(){
    let sortedScores = new Array<Array<any>>
    for(let [name,score] of this.scoreDict.entries()){
      sortedScores.push([name,score])
    }
    sortedScores.sort((a, b) => b[1] - a[1]); // sort by value descending
    //console.log("score dict size is : " + this.scoreDict.size)
    //console.log("sortedScores size is : " + sortedScores.length)
    for(let i = 1; i <= sortedScores.length; i++){
      let nameTag = i.toString() + '.name'
      let scoreTag = i.toString() + '.score'
      let childNameText = this.uiLeaderboardContainer.getByName(nameTag)
      let childScoreText = this.uiLeaderboardContainer.getByName(scoreTag)
      let name = sortedScores[i-1][0]
      let score = sortedScores[i-1][1]
      //console.log("i is : " + i.toString() + ", name is: " + name + ", score is: " +score)
      childNameText.setText(`${i}. ${name}`)
      childScoreText.setText(score.toString())
    }
    this.uiLeaderboardContainer.setVisible(true)
  }

  disableLeaderboard(){
    //console.log("disable leaderboard called")
    this.uiLeaderboardContainer.setVisible(false)
  }

  drawTargetRectangle(targetTextureName : string){
    //textureName = targetCharacter.characterColor + 'dude'
    //'unknown_target' for resetting searching for target
    let child = this.uiTargetContainer.getByName('targetIcon');
    child.setTexture(targetTextureName); 
    //console.log("draw texture called: " + targetTextureName)
  }

  popupEnemyAlert(){
    //TODO
    //enemy ran while near player, red arrow appears pointing in direction of enemy
  }

  getTimerString(){
    if(this.matchTime <= 0){
      //TODO!!! match/game over, call other functions here
      return "00:00"
    }
    let minutes, seconds 
    minutes = Math.floor(this.matchTime / 60)
    seconds = this.matchTime % 60
    let minutesString, secondsString
    if(minutes >= 10){
      minutesString = minutes.toString()
    }
    else{
      minutesString = "0" + minutes.toString()
    }
    if(seconds < 10){
      secondsString = "0" + seconds.toString()
    }else{
      secondsString = seconds.toString()
    }

    let fullString = minutesString + ":" + secondsString
    return fullString
  }

  halfSecondUpdate(){
    this.progressCircleUpdate()
  }
  oneSecondUpdate(){
    //this.progressCircleUpdate()
    this.matchTime -= 1
    if(this.matchTime < 0){
      //TODO!!! match/game over, call other functions here
    }
    else{
      this.timerText.text = this.getTimerString()
    }

  }
  progressCircleUpdate(){

    //TODO UI should also take into account line of sight...like in Assassins Creed where the color lights up when there is a clear vector to target ( no walls between)
    let angle, dist
    //TODO!!! check line of sight for this method call
    //Globals.lineOfSightPlayerTargetThisCheck = 

    if(Globals.uiTargetCharacters.size == 0){
      //do nothing
      angle = 0 //probably useless to set angle and dist here
      dist = this.progressMaxDistance * 10 //just need to make dist/ over this be much greater than 1

      this.progressEllipse.clear()
      //TODO leave the line around ellipse
      return //no target characters to follow
    }
    else if(Globals.uiTargetCharacters.size == 1){
      dist = Globals.distanceToTargets[0]
      angle = Globals.angleToTargets[0]
      //console.log("Angle: " + angle * 360)
      //console.log("Distance: " + dist)
    }
    else{
      //more than one target character, show small arrows pointing to each target
      //also show the average direction to all the targets
      let num = Globals.uiTargetCharacters.size // could cause bugs, should be checking uiangle and ui distance 
      let sumAngle = 0
      let sumDistance = 0
      //TODO!!! Probably want to get the minimum distance character and not the sum
      //TODO!!! also need line of sight on any character to brighten the fill of progress ellipse
      for(let i = 0; i < Globals.uiTargetCharacters.size; i++){
        sumAngle += Globals.angleToTargets[i]
        sumDistance += Globals.distanceToTargets[i] 
      }
      angle = sumAngle / num
      
      dist = sumDistance / num
    }
    if(dist < this.progressFullFillThreshold){
      //TODO!!!
      //if line of sight with a target
      //set this.progressFilled = false so that the next if statement catches it and redraws
      //also need to catch going from line of sight to no line of sight to redraw new alpha
      //play a sound when going between these states?
      if(!Globals.lineOfSightPlayerTargetLastCheck && Globals.lineOfSightPlayerTargetThisCheck){
        //if it was false and it goes to true, draw alpha value 
        this.progressAlphaValue = 1
        this.progressFilled = false
      }
      else if(Globals.lineOfSightPlayerTargetLastCheck && !Globals.lineOfSightPlayerTargetThisCheck){
        //if it was true and it goes to false, draw 
        this.progressAlphaValue = 0.4
        this.progressFilled = false
      }

      if(!this.progressFilled ){
                //TODO do this only once, and reset once the character is a certain distance away
        //arbitrary number
        //change fillstyle to brighter blue
        this.progressEllipse.clear()
        this.progressEllipse.fillStyle(this.progressFillColor, this.progressAlphaValue);
        //Phaser.GameObjects.Graphics.
        //TODO actually fill this
        this.progressEllipse.slice(
            this.progressEllipseCoordinates.x, this.progressEllipseCoordinates.y,
            this.progressCircleRadius,
            angle - Math.PI ,               // start angle
            angle - Math.PI + (1 * Math.PI * 2), // sweep whole thing
            false
          );
        this.progressEllipse.fillPath();
        this.progressFilled = true
      }
    }else{
      this.progressFilled = false
      this.progress = Phaser.Math.Clamp(1-(dist-this.progressFullFillThreshold)/(this.progressMaxDistance - this.progressFullFillThreshold), 0.05, 1);
  
      this.progressEllipse.clear()
      this.progressEllipse.fillStyle(this.progressFillColor, 0.4);
      this.progressEllipse.slice(
        this.progressEllipseCoordinates.x, this.progressEllipseCoordinates.y,
        this.progressCircleRadius,
        Phaser.Math.Angle.Wrap(angle - (this.progress * 0.5 * Math.PI)),               // start angle
        Phaser.Math.Angle.Wrap(angle + (this.progress * 0.5 * Math.PI)), // sweep based on progress, fill only up to half of circle
        false
      );
      this.progressEllipse.fillPath();
    
    }
    //end of method, setting globals lineofsight to this check
    Globals.lineOfSightPlayerTargetLastCheck = Globals.lineOfSightPlayerTargetThisCheck

  }
}
    