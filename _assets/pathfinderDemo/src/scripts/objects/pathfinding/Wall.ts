

export default class Wall extends Phaser.Physics.Arcade.Sprite {



  constructor(scene : Phaser.Scene, x : number, y : number, texture : string) {
    super(scene, x, y, texture)
    this.x = x;
    this.y = y;
    this.scene = scene;
;
    this.setTexture(texture );
    
    scene.physics.add.existing(this);
    this.scene.add.existing(this);


    this.setPushable(false);
    this.setGravity(0);
  } 
  
  override update(): void{

  }

}