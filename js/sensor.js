class Sensor extends Phaser.GameObjects.Sprite{
	constructor(scene,x,y,name,type){
		super(scene,x,y,name);
		scene.add.existing(this);
		
		this.type = type;
		this.scene = scene;
		this.spots = scene.spots;
		this.x = x;
		this.y = y;
		this.setInteractive({cursor: 'pointer'});
		scene.input.setDraggable(this);
		
		this.on('pointerover', function(){
			//this.setTint(0x00ff00);
			this.setScale(1.2);
		});
		
		this.on('pointerout', function(){
			//this.clearTint();
			this.setScale(1);
		});
		
	}
}
