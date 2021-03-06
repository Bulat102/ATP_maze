class GameScene extends Phaser.Scene{
	constructor(config){
		super(config);
	}
	
	init(){
		this.time_amount = 300*1000;
		this.score = 0;
	}
	
	preload(){
		this.load.image('background','assets/background.bmp');
		this.load.image('level','assets/level.png');
		this.load.image('pressure','assets/pressure.png');
		this.load.image('flow','assets/flow.png');
		this.load.image('temperature','assets/temperature.png');
		this.load.image('helmet','assets/helmet.png');
		
		this.load.image('level_big','assets/big_icons/level_big.png');
		this.load.image('pressure_big','assets/big_icons/pressure_big.png');
		this.load.image('flow_big','assets/big_icons/flow_big.png');
		this.load.image('temperature_big','assets/big_icons/temperature_big.png');
	}

	create(){
		
		let backg = this.add.image(200,0,'background');
		backg.setOrigin(0,0);
		
		
		let graphics = this.add.graphics();
		this.draw_graphics(graphics);
		
		
		//Координаты мест для значков
		this.spots =[{"x":402,"y":195,"number":0},{"x":408,"y":355,"number":3},{"x":484,"y":128,"number":1},{"x":475,"y":82,"number":2},{"x":826,"y":55,"number":3},{"x":683,"y":311,"number":1},{"x":652,"y":356,"number":2},{"x":616,"y":423,"number":3},{"x":617,"y":475,"number":0},{"x":606,"y":554,"number":3},{"x":476,"y":476,"number":1},{"x":892,"y":484,"number":3}];

		this.new_sensors=[
			{x:150, y: 90, amount:0, name: 'level'},
			{x:150, y: 190, amount:0, name: 'pressure'},
			{x:150, y: 390, amount:0, name: 'temperature'},
			{x:150, y: 290, amount:0, name: 'flow'}
		];
		//Расставляем названия значков на панельке
		let sensor_text_format = {fontSize:'16px', fontStyle:'bold', color:'#000000', align:'left'};
		let sensor_x = 37;
		let sensor_dy = -23;
		let sensor_texts = [];
		sensor_texts.push(this.add.text(sensor_x,100+sensor_dy, 'Датчик\nуровня', sensor_text_format));
		sensor_texts.push(this.add.text(sensor_x,200+sensor_dy, 'Датчик\nдавления', sensor_text_format));
		sensor_texts.push(this.add.text(sensor_x,300+sensor_dy, 'Датчик\nрасхода', sensor_text_format));
		sensor_texts.push(this.add.text(sensor_x,425+sensor_dy, 'Датчик\nтемпературы', sensor_text_format));
		
		//обновим число требуемых датчиков по количеству мест
		for(let i=0;i<this.spots.length;i++){
			this.new_sensors[this.spots[i].number].amount++;
		}
		this.sensors = [];
		for(let i=0;i<this.new_sensors.length;i++){
			let type = i;
			if(this.new_sensors[i].amount>0){
				this.sensors.push(new Sensor(this,this.new_sensors[i].x,this.new_sensors[i].y,this.new_sensors[i].name, i));
				this.new_sensors[i].text_field = this.add.text(this.new_sensors[i].x-this.sensors[i].width/2,this.new_sensors[i].y-this.sensors[i].height/2-1,String(this.new_sensors[i].amount),{fontSize:'14px', fontStyle:'bold', color:'#FFFFFF'});
			}
		}
		
		// Ставим большие значки датчиков и скрываем их
		this.big_sensors =[];
		for(let i=0;i<this.new_sensors.length;i++){
			let type = i;
			this.big_sensors.push(this.add.image(this.new_sensors[i].x,this.new_sensors[i].y,this.new_sensors[i].name+'_big'));
			this.big_sensors[type].visible = false;
			this.big_sensors[type].depth = 1;
		}
		
		//Ставим поля времени и очков
		this.timer_field = this.add.text(50,20,"Таймер: "+String(this.time_amount/1000)+' сек',{fontSize:'20px', fontStyle:'bold', color:'#000000'});
		this.score_field = this.add.text(300,20,"Очки: "+String(this.score),{fontSize:'20px', fontStyle:'bold', color:'#000000'});
		this.lifes_field = this.add.text(60,480,"Попыток: "+String(lifes),{fontSize:'20px', fontStyle:'bold', color:'#FF0000'});
		
		//Показываем жизни
		this.helmet_images = [];
		for(let i=0;i<lifes;i++){
			this.helmet_images.push(this.add.image(70+i*50,524,'helmet'));
			this.helmet_images[i].setScale(0.4);
		}
		
		//Настраиваем таймер
		this.timerEvent = this.time.addEvent({callback:this.timerLoop, delay : 1000, repeat: Math.round(this.time_amount/1000)-1, callbackScope:this}); 
		
		this.set_icon_listeners();
    }
    
    //Рисуем поле инструментов
    draw_graphics(gr){
		gr.lineStyle(7,0xE67E22 ,1.0);
		gr.beginPath();
		gr.moveTo(30,49);
		gr.lineTo(170,49);
		gr.closePath();
		gr.strokePath();
		gr.fillStyle(0xF0B27A,1.0);
		gr.fillRect(30,50,140,400);
		//gr.strokeRect(50,50,100,410);
	}
	
	//Функция высвечивания/скрытия больщого сенсора
	show_big_sensor(type,visible = false){
		this.big_sensors[type].visible = visible;
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
			gameObject.setScale(0.57);
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
						
						gameObject.setScale(0.57);
						gameObject.scene.input.setDefaultCursor('default');//Ставим обычный курсор
						gameObject.x = gameObject.spots[i].x;
						gameObject.y = gameObject.spots[i].y;
						
						gameObject.scene.new_sensors[gameObject.type].amount--;
						gameObject.scene.new_sensors[gameObject.type].text_field.setText(gameObject.scene.new_sensors[gameObject.type].amount);
						gameObject.spots.splice(i,1);
						
						if(gameObject.spots.length == 0){
							gameObject.scene.gameOver();
							return;
						}
						
						gameObject.scene.spawn_sensor(gameObject.type);
						throw_back = false;
						gameObject.scene.addScore(50); // Добавляем 50 очков
						
						break;
					}
				}
			}
			if(throw_back){
				gameObject.setScale(1);
				
				//Если выходит в зону спотов >300px - вычитаем жизнь
				if(gameObject.x > 300){
					gameObject.scene.cameras.main.shake(100,0.005);
					lifes--;
					gameObject.scene.lifes_field.setText("Попыток: "+String(lifes)); 
					gameObject.scene.helmet_images[lifes].destroy();
					gameObject.scene.helmet_images.splice(lifes,1);
					if(lifes == 0){	
						gameObject.scene.timerEvent.remove(); //Удаляем бонус за вермя
						gameObject.scene.gameOver();
						return;
					};
				}
				
				gameObject.x = gameObject.scene.new_sensors[gameObject.type].x;
				gameObject.y = gameObject.scene.new_sensors[gameObject.type].y;
				
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
		time_score = time_left
		this.scene.add('EndScene',EndScene,true); // Название и класс должны быть одинаковыми
		this.scene.remove(this);
	}
}
