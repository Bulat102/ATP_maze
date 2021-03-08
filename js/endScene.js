class EndScene extends Phaser.Scene{
	constructor(config){
		super(config);
	}
	
	preload(){
		this.load.image('end_background','assets/end_background.jpg');
		this.load.image('m_gold','assets/medals/gold.png');
		this.load.image('m_silver','assets/medals/silver.png');
		this.load.image('m_bronze','assets/medals/bronze.png');
	}
	
	create(){
		let backg = this.add.image(200,10,'end_background');
		backg.setOrigin(0,0);
		
		let scene = this;
		
		//Подложка таблицы
		let graphics = this.add.graphics();
		this.draw_graphics(graphics);
		
		//Кнопка обновления
		let button = this.add.graphics();
		this.draw_button(button,148,565);
		let button_text = this.add.text(148+2,565+8, 'Обновить таблицу', {fontSize:'20px', fontStyle:'bold', color:'#000000'});
		button_text.setInteractive({cursor: 'pointer'});
		button_text.on('pointerdown', function(){
			scene.getScore();
		});
		//Пока прячем кнопку
		button_text.visible=false;
		button.visible=false;
		
		//Надписи
		let end_text = 'Вами набрано '+ String(total_score)+' очков\n Из них:\n За верные датчики: '+String(total_score-time_score)+' очков\n За время: '+String(time_score)+' очков'+'\n\nИдет загрузка рекордов...'
		this.head = this.add.text(250,160,'Список рекордов:',{fontSize:'30px', fontStyle:'bold', color:'#000000'});
		this.table_field= this.add.text(200,210,end_text,{fontSize:'20px', fontStyle:'bold', color:'#000000'});
		
		//Делаем запрос на сервер с задержкой в 3 секунды
		this.time.delayedCall(3000, function(){
				this.setScore(scene);
				button_text.visible=true;
				button.visible=true;
				this.show_medals();
			},[],this);
		
		sessionStorage.setItem('session_score',total_score);
	}
	
	//Рисуем подложку
	draw_graphics(gr){
		gr.lineStyle(5,0xE67E22 ,1.0);
		gr.fillStyle(0xF0B27A,0.4);
		gr.fillRect(150,150,500,410);
		gr.strokeRect(150,150,500,410);
	}
	
	//Рисуем кнопку
	draw_button(gr,x,y){
		gr.lineStyle(2,0x000000 ,1.0);
		gr.fillStyle(0xD0D3D4,0.6);
		gr.fillRoundedRect(x,y,200,30, 5);
		gr.strokeRoundedRect(x,y,200,30, 5);
	}
	
	//Рисуем медали
	show_medals(){
		let medals = [];
		let medal_x = 180;
		let medal_y = 255;
		let medal_dy = 20;
		medals.push(this.add.image(medal_x,medal_y,'m_gold').setScale(0.3));
		medals.push(this.add.image(medal_x,medal_y+medal_dy,'m_silver').setScale(0.3));
		medals.push(this.add.image(medal_x,medal_y+medal_dy*2,'m_bronze').setScale(0.3));
	}
	
	//Запрос на сервер по поводу таблицы рекордов
	setScore(scene){
		
		var xhr = new XMLHttpRequest();
		
		var json = JSON.stringify({
			name: name,
			surname: surname,
			player_class: player_class,
			player_school: player_school,
			score: Number(total_score)
		});
		
		xhr.open("POST","HTTPS://Bulat102.pythonanywhere.com/set_score/atp",true);
		xhr.setRequestHeader("Content-type",'application/json; charset=utf-8');
			
		xhr.send(json);
			
		console.log('Запрос post отправлен');
			
		xhr.onreadystatechange = function(){
			if (xhr.readyState !=4) return;
			
			if (xhr.status != 200){
				//обработать ошибку
				alert("Ошибка " + xhr.status + ': ' + xhr.statusText);
			} else {
				// вывести результат
				let score_table = String(xhr.responseText).slice(0,-1);
				let top_place = Number(String(xhr.responseText).slice(-1)); //выводим топовое место, если получили, если нет то 0
				//console.log(xhr.responseText);
				
				score_table = 'Место       Игрок       Очки'+'\n\n'+ score_table;
				scene.table_field.setText(score_table);
				
				/*if (Boolean(top_place)){
					scoresText.text = scoresText.text+"\n\n Ваш результат "+score+" попал на "+top_place+' место!';
				}else{
					scoresText.text = scoresText.text+"\n\n Ваш результат "+score+" не попал в топ(";
				}*/
			}
		}
	}
	
	//Делаем запрос на получение таблицы рекордов
	getScore(){
		
		var xhr = new XMLHttpRequest();
		var scene = this;
		
		
		xhr.open("GET","HTTPS://Bulat102.pythonanywhere.com/get_score/atp_get",true);
		xhr.setRequestHeader("Content-type",'application/json; charset=utf-8');
			
		xhr.send();
			
		console.log('Запрос get отправлен');
			
		xhr.onreadystatechange = function(){
			if (xhr.readyState !=4) return;
			
			if (xhr.status != 200){
				//обработать ошибку
				alert("Ошибка " + xhr.status + ': ' + xhr.statusText);
			} else {
				// вывести результат
				let score_table = String(xhr.responseText).slice(0,-1);
				let top_place = Number(String(xhr.responseText).slice(-1)); //выводим топовое место, если получили, если нет то 0
				
				score_table = 'Место       Игрок       Очки'+'\n\n'+ score_table;
				scene.table_field.setText(score_table);
			}
		}
	}
}
