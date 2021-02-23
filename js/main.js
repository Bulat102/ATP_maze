var config = {
        type: Phaser.AUTO,
        width: 1100,
        height: 600,
        backgroundColor:0xFFFFFF,
        scene: GameScene
    };

var game = new Phaser.Game(config);
var name = String(decodeURIComponent(window.location.search)).slice(6); //Имя игрока
var total_score = 0;

