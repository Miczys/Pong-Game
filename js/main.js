document.addEventListener("DOMContentLoaded", function(event) {

    var isGamePlaying = false;

    var onOff = document.querySelector('#onOff');
    var gameWindow = document.querySelector('#gameContainer');
    gameWindow.style.display = 'none';

    onOff.addEventListener('click', function() {
        if (gameWindow.style.display == 'none') {
            gameWindow.style.display = 'initial';
        } else {
            gameWindow.style.display = 'none';
        }
    });

    var starter = document.querySelector('#start');
    starter.addEventListener('click', function() {
        isGamePlaying = true;
        console.log(isGamePlaying);
    });

    var reset = document.querySelector('#reset');
    reset.addEventListener('click', function() {
        isGamePlaying = false;
        globCounterP1.points = 0;
        globCounterAi.points = 0;
        player.paddle.y = ((CanvHeight - 42.25) / 2);
        computer.paddle.y = ((CanvHeight - 42.25) / 2);
        ball.x = (CanvWidth / 2);
        ball.y = (CanvHeight / 2);
        ball.x_speed = -3;
        ball.y_speed = 0;


    });
    // GameInit()

    //mowimy przegladarce , ze chcemy odswiezac nasze okno 60 razy na sekunde
    var animate = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function(callback) { window.setTimeout(callback, 1000 / 60) };

    //tworzymy nasze plotno w kontekscie 2d 
    var canvas = document.createElement('canvas');
    const CanvWidth = 427;
    const CanvHeight = 309;
    canvas.width = CanvWidth;
    canvas.height = CanvHeight;
    var context = canvas.getContext('2d');


    //---------stylowanie

    //canvas 
    Object.assign(canvas.style, {
        borderTop: "6.5px solid white",
        borderTopLeftRadius: '30px 5px',
        borderTopRightRadius: '30px 5px',
        borderBottomLeftRadius: '30px 5px',
        borderBottomRightRadius: '30px 5px',
        borderBottom: "6.5px solid white",
        margin: "0 auto",
        width: "42.7rem",
        height: "30.9rem",

    });


    // //---------- tlo i otoczka dla canvas (cala estetyka)

    // let mainBoard = document.createElement('div');
    // // mainBoard.

    // Object.assign(mainBoard.style, {
    //     width: "1000px",
    //     margin: "0 auto",
    //     backgroundColor: 'blue',
    // });
    var tvWindow = document.querySelector('#gameContainer');
    //kiedy nasze okno zostanie wczytane to dodajemy nasz canvas i wywolujemy funkcje step 
    window.onload = function() {
        // document.body.appendChild(mainBoard);
        tvWindow.appendChild(canvas); //po wczytaniu laduje nasz canvas 
        animate(step);
    };
    //funkcja step aktualizuje polozenie naszych obiektow , renderuje je i wywoluje funkcje ponownie 


    var step = function() {
        update();
        render();
        animate(step);
    };


    //
    var update = function() {
        if (isGamePlaying == true) {
            player.update();
            computer.update(ball);
            ball.update(player.paddle, computer.paddle);
        }

    };

    //funkcja render rysuje nasze plotno i obiekty
    var render = function() {
        context.fillStyle = "#1b191a";
        context.fillRect(0, 0, CanvWidth, CanvHeight);
        player.render();
        computer.render();
        ball.render();
        courtLine1.render();
        globCounterP1.render();
        globCounterAi.render();
    };

    //------------------------------- obiekty ---------------------------//
    //licznik
    let counterP1 = 0;
    let counterAi = 0;

    function globCounter(points, w, h) {
        this.points = points; //punkt
        this.width = w;
        this.height = h;
    }
    globCounter.prototype.render = function() {
        context.font = "20px Monaco";
        context.fillText(this.points, this.height, this.width);
    }

    globCounter.prototype.update = function() {
        this.points = this.points + 1;
    };

    let globCounterP1 = new globCounter(counterP1, 35, 180);
    let globCounterAi = new globCounter(counterAi, 35, 235);

    //linia dzielaca boisko 

    function courtLine(w, h) {
        this.lineHeight = h; //wysokosc  pojedynczej lini dzielacej boisko 
        this.lineWidth = w; //szerokosc pojedynczej lini dzielacej boisko
    }
    courtLine.prototype.render = function() {
        for (let i = this.lineHeight; i < CanvHeight; i += 30) { //ile razy ma renderowac paski na srodku
            context.fillStyle = "white";
            context.fillRect((CanvWidth / 2) - 3, i, this.lineWidth, this.lineHeight);
        }
    }

    let courtLine1 = new courtLine(3.25, 6.5);

    //obiekt paletki
    function Paddle(x, y, w, h) {
        this.x = x; //polozenie paletki w poziomie
        this.y = y; //polozenie paletki w pionie 
        this.width = w; //szerokosc paletki
        this.height = h; //wysokosc paletki
        this.x_speed = 0; //predkosc poruszania sie paletki w poziomie
        this.y_speed = 0; //predkosc poruszania sie paletki w pionie 
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

        // blokada ruchu w gore (zeby nie wyszlo poza canvas )
        if (this.y < 0) {
            this.y = 0;
            this.y_speed = 0;
        }
        // blokada ruchu w dol (zeby nie wyszlo poza canvas )
        else if (this.y + this.height > CanvHeight) {
            this.y = CanvHeight - this.height;
            this.y_speed = 0;
        }
    }

    //tworzymy konstruktory z prototypami dla paletki gracza i ai 

    //paletka gracza
    function Player() {
        this.paddle = new Paddle(6.5, ((CanvHeight - 42.25) / 2), 6.5, 42.25);
    }
    Player.prototype.render = function() {
        this.paddle.render();
    };


    //sterowanie 
    Player.prototype.update = function() {
        for (var key in keysDown) {
            var value = Number(key);
            if (value == 87) { // gora
                this.paddle.move(0, -4);
            } else if (value == 83) { // dol
                this.paddle.move(0, 4);
            } else {
                this.paddle.move(0, 0);
            }
        }
    };

    let keysDown = {};

    window.addEventListener("keydown", function(event) {
        keysDown[event.keyCode] = true;
    });

    window.addEventListener("keyup", function(event) {
        delete keysDown[event.keyCode];
    });


    //paletka komputera
    function Computer() {
        this.paddle = new Paddle(417, ((CanvHeight - 42.25) / 2), 6.5, 42.25);
    }
    Computer.prototype.render = function() {
        this.paddle.render();
    };


    //konstruktor i prototyp pileczki

    function Ball(x, y) {
        //polozenie pilki
        this.x = x;
        this.y = y;
        //predkosc pilki
        this.x_speed = -3;
        this.y_speed = 0;
        //rozmair pilki
        this.width = 6.5;
        this.height = 6.5;
    }

    //wyswietlenie pileczki
    Ball.prototype.render = function() {
        context.beginPath();
        //ksztalt pilki - kwadrat
        context.rect(this.x, this.y, this.width, this.height);
        //wypelnienie 
        context.fillStyle = "white";
        context.fill();
    };

    //prototyp do poruszania/update'owania polozenia pileczki 

    Ball.prototype.update = function(paddle1, paddle2) {
        this.x += this.x_speed; //update polozenia w poziomie, aktualna pozycja + predkosc
        this.y += this.y_speed; //update polozenia w pionie , aktualna pozycja + predkosc
        //krawedzie pilki
        let leftEdge = this.x; // pozycja lewej krawedzi
        let bottomEdge = this.y + 6.5; //pozycja dolnej krawedzi
        let rightEdge = this.x + 6.5; //pozycja prawej krawedzi
        let topEdge = this.y; //pozycja gornej krawedzi

        if (this.y < 0) { // uderzenie w gorna sciane 
            this.y = 6;
            this.y_speed = -this.y_speed;
        } else if (this.y + 6 > CanvHeight) { // uderzenie w dolna sciane 
            this.y = (CanvHeight - 6.5);
            this.y_speed = -this.y_speed;
        }

        // jesli pilka wypadnie nie odbita to naliczamy punkt

        if (this.x < 0) {
            counterAi++;
            this.x_speed = 4;
            this.y_speed = 0;
            this.x = (CanvWidth / 2);
            this.y = (CanvHeight / 2);
            console.log(counterAi);
            globCounterAi.update();
        }
        if (this.x > CanvWidth) {
            counterP1++;
            this.x_speed = -4;
            this.y_speed = 0;
            this.x = (CanvWidth / 2);
            this.y = (CanvHeight / 2);
            console.log(counterP1);
            globCounterP1.update();
        }
        //-------------------------- odbicia od paletek

        // odbicie gracza
        if (leftEdge < (CanvWidth / 2)) {

            //sprawdzamy czy pileczka natrafia na paletke i nie wykracza
            //poza jej szerokosc jak i poznaje jej krawedz 

            if (leftEdge <= (paddle1.x + paddle1.width) &&
                rightEdge >= paddle1.x &&
                topEdge >= paddle1.y &&
                bottomEdge <= (paddle1.y + paddle1.height)) {

                this.x_speed = 4;
                this.y_speed += (paddle1.y_speed / 2) + Math.random() < 0.5 ? -1 : 1; //dodalem 0.5 zeby przy braku poruszania paletkami pilka nie trwala w jednej linii

                this.x += this.x_speed;
            }
        }
        // odbicie komputera
        else {
            if (leftEdge >= paddle2.x &&
                rightEdge >= paddle2.x &&
                topEdge >= paddle2.y &&
                bottomEdge <= paddle2.y + paddle2.height) {

                this.x_speed = -4;
                this.y_speed += (paddle2.y_speed / 2) + Math.random() < 0.5 ? -1 : 1; // dodalem 0.5 jak wyzej 
                this.x += this.x_speed;
            }
        }
    };

    //tworzenie nowych paletek i pileczki na bazie konstruktorow 

    let player = new Player();
    let computer = new Computer();
    let ball = new Ball((CanvWidth / 2), (CanvHeight / 2));

    //------------------------------------------ai komputera 

    //kazemy AI sledzic pozycje y pilki i dopasowywac do niej paletke

    Computer.prototype.update = function(ball) {
        let y_pos = ball.y; //polozenie pilki 
        let d = -((this.paddle.y + (this.paddle.height / 2)) - y_pos);
        if (d < 0 && d < -4) { // predkosc gora 
            d = -4;
        } else if (d > 0 && d > 4) { // predkosc dol
            d = 4;
        }

        //blokujemy wychodzenie paletki komputera poza obszar

        this.paddle.move(0, d);

        if (this.paddle.y < 0) {
            this.paddle.y = 0;
        } else if (this.paddle.y + this.paddle.height > CanvHeight) {
            this.paddle.y = CanvWidth - this.paddle.height;
        }
    };

});