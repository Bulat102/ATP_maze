class GameScene extends Phaser.Scene{
	constructor(config){
		super(config);
	}
	
	init(){
		this.time_amount = 1*1000;
		this.score = 0;
	}
	
	preload(){
		this.load.image('background','assets/background.bmp');
		this.load.image('level','assets/level.png');
		this.load.image('pressure','assets/pressure.png');
		this.load.image('flow','assets/flow.png');
		this.load.image('temperature','assets/temperature.png');
	}

	create(){
		
		let backg = this.add.image(200,0,'background');
		backg.setOrigin(0,0);
		
		let graphics = this.add.graphics();
		this.draw_graphics(graphics);
		
		
		//Координаты мест для значков
		this.spots =[{"x":402,"y":195,"number":0},{"x":408,"y":355,"number":3},{"x":484,"y":128,"number":1},{"x":475,"y":82,"number":2},{"x":826,"y":55,"number":3},{"x":683,"y":311,"number":1},{"x":652,"y":356,"number":2},{"x":616,"y":423,"number":3},{"x":617,"y":475,"number":0},{"x":606,"y":554,"number":3},{"x":476,"y":476,"number":1},{"x":892,"y":484,"number":3}];

		this.new_sensors=[
			{x:100, y: 100, amount:0, name: 'level'},
			{x:100, y: 200, amount:0, name: 'pressure'},
			{x:100, y: 400, amount:0, name: 'temperature'},
			{x:100, y: 300, amount:0, name: 'flow'}
		];
		//обновим число требуемых датчиков по количеству мест
		for(let i=0;i<this.spots.length;i++){
			this.new_sensors[this.spots[i].number].amount++;
		}
		this.sensors = [];
		for(let i=0;i<this.new_sensors.length;i++){
			let type = i;
			if(this.new_sensors[i].amount>0){
				this.sensors.push(new Sensor(this,this.new_sensors[i].x,this.new_sensors[i].y,this.new_sensors[i].name, i));
				this.new_sensors[i].text_field = this.add.text(this.new_sensors[i].x+this.sensors[i].width/2-10,this.new_sensors[i].y+this.sensors[i].height/2-5,String(this.new_sensors[i].amount),{fontSize:'14px', fontStyle:'bold', color:'#FFFFFF'});
			}
		}
		
		//Ставим поля времени и очков
		this.timer_field = this.add.text(50,20,"Таймер: "+String(this.time_amount/1000)+' сек',{fontSize:'20px', fontStyle:'bold', color:'#000000'});
		this.score_field = this.add.text(300,20,"Очки: "+String(this.score),{fontSize:'20px', fontStyle:'bold', color:'#000000'});
		
		//Настраиваем таймер
		this.timerEvent = this.time.addEvent({callback:this.timerLoop, delay : 1000, repeat: Math.round(this.time_amount/1000)-1, callbackScope:this}); 
		
		this.set_icon_listeners();
    }
    
    //Рисуем поле инструментов
    draw_graphics(gr){
		gr.lineStyle(5,0xE67E22 ,1.0);
		gr.fillStyle(0xF0B27A,1.0);
		gr.fillRect(50,50,100,410);
		gr.strokeRect(50,50,100,410);
	}
	
	//Функция добавления очков
	addScore(score){
		this.score +=score;
		this.score_field.setText("Очки: "+String(this.score));
	}
	
	//Функция таймера, раз в секунду = delay
	timerLoop(){
		let progress = this.timerEvent.getRepeatCount();
		this.timer_field.setText("Таймер: "+String(progress)+' сек');
		if(progress == 0){
			this.gameOver();
		}
	}
	
	//Создаем значек сенсора в поле инструментов
	spawn_sensor(type){
		if(this.new_sensors[type].amount>0){
			this.sensors.push(new Sensor(this,this.new_sensors[type].x,this.new_sensors[type].y,this.new_sensors[type].name, type));
		}
	}
	
	//Ставим интерактивность для иконок
	set_icon_listeners(){
		
		this.input.on('dragstart', function(pointer, gameObject, dragX, dragY){
			gameObject.x = pointer.position.x;
			gameObject.y = pointer.position.y;
			gameObject.setScale(0.4);
		});
		
		this.input.on('drag', function(pointer, gameObject, dragX, dragY){
			gameObject.x = pointer.position.x;
			gameObject.y = pointer.position.y;
		});
		
		this.input.on('dragend', function(pointer, gameObject){
			let throw_back = true; //Флаг - нужно ли возвращать на базу иконку
			for(let i=0; i<gameObject.spots.length; i++){
				if(gameObject.spots[i].number == gameObject.type){
					if(gameObject.scene.overlap(gameObject.spots[i].x,gameObject.spots[i].y,gameObject)){
						gameObject.removeInteractive();
						
						gameObject.setScale(0.4);
						gameObject.scene.input.setDefaultCursor('default');//Ставим обычный курсор
						gameObject.x = gameObject.spots[i].x;
						gameObject.y = gameObject.spots[i].y;
						
						gameObject.scene.new_sensors[gameObject.type].amount--;
						gameObject.scene.new_sensors[gameObject.type].text_field.setText(gameObject.scene.new_sensors[gameObject.type].amount);
						gameObject.spots.splice(i,1);
						
						if(gameObject.spots.length == 0){
							gameObject.scene.gameOver();
						}
						
						gameObject.scene.spawn_sensor(gameObject.type);
						throw_back = false;
						gameObject.scene.addScore(50);
						
						break;
					}
				}
			}
			if(throw_back){
				gameObject.setScale(1);
				gameObject.x = gameObject.scene.new_sensors[gameObject.type].x;
				gameObject.y = gameObject.scene.new_sensors[gameObject.type].y;
				gameObject.scene.cameras.main.shake(100,0.005);
				gameObject.scene.input.setDefaultCursor('default');//Ставим обычный курсор
			}
		});
	}
	
	//функция определения попадания датчика на спот
	overlap(x,y, obj){
		let x_obj = obj.x - obj.width/2*obj.scaleX;
		let y_obj = obj.y - obj.height/2*obj.scaleX;
		let flag = false;
		if(x>x_obj & x<(x_obj+obj.width*obj.scaleX)){
			if(y>y_obj & y<(y_obj+obj.height*obj.scaleX)){
				flag = true;
				return flag;
			}
		}
	}
	
	gameOver(){
		let time_left = this.timerEvent.getRepeatCount();
		total_score =  time_left + this.score;
		this.scene.add('EndScene',EndScene,true); // Название и класс должны быть одинаковыми
		this.scene.remove(this);
	}
}
