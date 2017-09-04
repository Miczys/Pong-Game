document.addEventListener("DOMContentLoaded", function(event) {


    //mowimy przegladarce , ze chcemy malowac nasze plotno 60 razy na sekunde
    let animate = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function(callback) { window.setTimeout(callback, 1000 / 60) };

    //tworzymy nasze plotno w kontekscie 2d 
    let canvas = document.createElement('canvas');
    let width = 800;
    let height = 600;
    canvas.width = width;
    canvas.height = height;
    let context = canvas.getContext('2d');
    //kiedy nasze okno zostanie wczytane to "rysujemy" nasz canvas i wywolujemy funkcje step 
    window.onload = function() {
        document.body.appendChild(canvas);
        animate(step);
    };
    //funkcja step aktualizuje polozenie naszych obiektow , renderuje je i wywoluje funkcje ponownie 
    let step = function() {
        update();
        render();
        animate(step);
    };


    //
    let update = function() {
        player.update();
        ball.update(player.paddle, computer.paddle);
    };

    //funkcja render rysuje nasze plotno i obiekty
    let render = function() {
        context.fillStyle = "#000000";
        context.fillRect(0, 0, width, height);
        player.render();
        computer.render();
        ball.render();
    };

    //------------------------------- obiekty ---------------------------//
    //obiekt paletki
    function Paddle(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.x_speed = 0;
        this.y_speed = 0;
    }

    //metoda ktora tworzy paletke na podstawie konstruktora oraz jej polozenie i rozmiar
    Paddle.prototype.render = function() {
        context.fillStyle = "white";
        context.fillRect(this.x, this.y, this.width, this.height);
    }

    Paddle.prototype.move = function(x, y) {
        this.x += x;
        this.y += y;
        this.x_speed = x;
        this.y_speed = y;
        if (this.x < 0) { // all the way to the left
            this.x = 0;
            this.x_speed = 0;
        } else if (this.x + this.width > 400) { // all the way to the right
            this.x = 400 - this.width;
            this.x_speed = 0;
        }
    }

    //tworzymy konstruktory z prototypami dla paletki gracza i ai 

    //gracz 
    function Player() {
        this.paddle = new Paddle(20, 275, 12, 62);
    }
    Player.prototype.render = function() {
        this.paddle.render();
    };

    Player.prototype.update = function() {
        for (var key in keysDown) {
            var value = Number(key);
            if (value == 38) { // left arrow
                this.paddle.move(-4, 0);
            } else if (value == 40) { // right arrow
                this.paddle.move(4, 0);
            } else {
                this.paddle.move(0, 0);
            }
        }
    };


    //komputer 
    function Computer() {
        this.paddle = new Paddle(770, 275, 12, 62);
    }
    Computer.prototype.render = function() {
        this.paddle.render();
    };


    //konstruktor i prototyp pileczki

    function Ball(x, y) {
        this.x = x;
        this.y = y;
        this.x_speed = -3;
        this.y_speed = 0;
        this.width = 12;
        this.height = 12;
    }

    Ball.prototype.render = function() {
        context.beginPath();
        context.rect(this.x, this.y, this.width, this.height);
        context.fillStyle = "white";
        context.fill();
    };

    //prototyp do poruszania pileczki 
    Ball.prototype.update = function(paddle1, paddle2) {
        this.x += this.x_speed;
        this.y += this.y_speed;
        let top_x = this.x - 5;
        let top_y = this.y - 5;
        let bottom_x = this.x + 5;
        let bottom_y = this.y + 5;

        if (this.y - 5 < 0) { // hitting the top wall
            this.x = 5;
            this.x_speed = -this.x_speed;
        } else if (this.y + 5 > 800) { // hitting the bottom wall
            this.x = 395;
            this.x_speed = -this.x_speed;
        }

        if (this.x < 0 || this.x > 600) { // a point was scored
            this.x_speed = 0;
            this.y_speed = 3;
            this.x = 294;
            this.y = 394;
        }

        if (top_x > 300) {
            if (top_x < (paddle1.x + paddle1.width) && bottom_x > paddle1.x && top_x < (paddle1.x + paddle1.width) && bottom_x > paddle1.x) {
                // hit the player's paddle
                this.y_speed = -3;
                this.x_speed += (paddle1.x_speed / 2);
                this.x += this.x_speed;
            }
        } else {
            if (top_x < (paddle2.y + paddle2.height) && bottom_y > paddle2.y && top_x < (paddle2.x + paddle2.width) && bottom_x > paddle2.x) {
                // hit the computer's paddle
                this.y_speed = 3;
                this.x_speed += (paddle2.x_speed / 2);
                this.y += this.y_speed;
            }
        }
    };

    //sterowanie 

    let keysDown = {};

    window.addEventListener("keydown", function(event) {
        keysDown[event.keyCode] = true;
    });

    window.addEventListener("keyup", function(event) {
        delete keysDown[event.keyCode];
    });

    //tworzenie nowych paletek i pileczki na bazie konsttruktorow 

    let player = new Player();
    let computer = new Computer();
    let ball = new Ball(394, 294);



});