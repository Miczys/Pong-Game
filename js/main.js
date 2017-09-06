document.addEventListener("DOMContentLoaded", function(event) {


    //mowimy przegladarce , ze chcemy malowac nasze plotno 60 razy na sekunde
    let animate = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function(callback) { window.setTimeout(callback, 1000 / 60) };

    //tworzymy nasze plotno w kontekscie 2d 
    let canvas = document.createElement('canvas');
    const CanvWidth = 800;
    const CanvHeight = 576;
    canvas.width = CanvWidth;
    canvas.height = CanvHeight;
    let context = canvas.getContext('2d');
    canvas.style.borderTop = "12px solid white";
    canvas.style.borderBottom = "12px solid white";

    //kiedy nasze okno zostanie wczytane to dodajemy nasz canvas i wywolujemy funkcje step 
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
        computer.update(ball);
        ball.update(player.paddle, computer.paddle);
    };

    //funkcja render rysuje nasze plotno i obiekty
    let render = function() {
        context.fillStyle = "#000000";
        context.fillRect(0, 0, CanvWidth, CanvHeight);
        player.render();
        computer.render();
        ball.render();
        courtLine1.render();
    };

    //------------------------------- obiekty ---------------------------//

    //linia dzielaca boisko 

    function courtLine(w, h) {
        this.lineHeight = h; //wysokosc  pojedynczej lini dzielacej boisko 
        this.lineWidth = w; //szerokosc pojedynczej lini dzielacej boisko
    }
    courtLine.prototype.render = function() {
        for (let i = this.lineHeight; i < CanvHeight; i += 30) {
            context.fillStyle = "white";
            context.fillRect((CanvWidth / 2) - 3, i, this.lineWidth, this.lineHeight);
        }
    }

    let courtLine1 = new courtLine(6, 12);

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
            this.y = height - this.height;
            this.y_speed = 0;
        }
    }

    //tworzymy konstruktory z prototypami dla paletki gracza i ai 

    //paletka gracza
    function Player() {
        this.paddle = new Paddle(20, ((CanvHeight - 62) / 2), 12, 62);
    }
    Player.prototype.render = function() {
        this.paddle.render();
    };


    //sterowanie 
    Player.prototype.update = function() {
        for (var key in keysDown) {
            var value = Number(key);
            if (value == 38) { // gora
                this.paddle.move(0, -4);
            } else if (value == 40) { // dol
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
        this.paddle = new Paddle(768, ((CanvHeight - 62) / 2), 12, 62);
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
        this.width = 12;
        this.height = 12;
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
        let bottomEdge = this.y + 12; //pozycja dolnej krawedzi
        let rightEdge = this.x + 12; //pozycja prawej krawedzi
        let topEdge = this.y; //pozycja gornej krawedzi

        if (this.y < 0) { // uderzenie w gorna sciane 
            this.y = 6;
            this.y_speed = -this.y_speed;
        } else if (this.y + 6 > CanvHeight) { // uderzenie w dolna sciane 
            this.y = (CanvHeight - 12);
            this.y_speed = -this.y_speed;
        }

        if (this.x < 0 || this.x > CanvWidth) { // jesli pilka wypadnie nie odbita to naliczamy punkt
            this.x_speed = -4;
            this.y_speed = 0;
            this.x = (CanvWidth / 2);
            this.y = (CanvHeight / 2);
            console.log('wpadlo');
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
                this.y_speed += (paddle1.y_speed / 2);
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
                this.y_speed += (paddle2.y_speed / 2);
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
        let diff = -((this.paddle.y + (this.paddle.height / 2)) - y_pos);
        if (diff < 0 && diff < -4) { // predkosc gora 
            diff = -4;
        } else if (diff > 0 && diff > 4) { // predkosc dol
            diff = 4;
        }

        //blokujemy wychodzenie paletki komputera poza obszar

        this.paddle.move(0, diff);

        if (this.paddle.y < 0) {
            this.paddle.y = 0;
        } else if (this.paddle.y + this.paddle.height > CanvHeight) {
            this.paddle.y = CanvWidth - this.paddle.height;
        }
    };

});