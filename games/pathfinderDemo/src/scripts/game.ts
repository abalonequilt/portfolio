import 'phaser'
import PreloadScene from './scenes/preloadScene'
import PlayGameScene from './scenes/PlayGameScene'
import PlayUIScene from './scenes/PlayUIScene'

const DEFAULT_WIDTH = 1280
const DEFAULT_HEIGHT = 720

const config = {
  type: Phaser.AUTO,
  backgroundColor: '#000000',
  scale: {
    parent: 'phaser-game',
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT
  },
  scene: [PreloadScene, PlayGameScene, PlayUIScene],
  physics: {
    default: 'arcade',
    arcade: {
      debug: true,
      gravity: {x:0,  y: 0 }
    }
  },

}

window.addEventListener('load', () => {
  var game = new Phaser.Game(config)
 
})

