import { Socket } from 'socket.io-client';
// import { threadId } from 'worker_threads';


// interface Vec {
//   x: number,
//   y: number
// }

// interface Vec {
//   x: number,
//   y: number
// }

class Vec {
  x: number;
  y: number;
  constructor(x = 0, y = 0)
  {
    this.x = x;
    this.y = y;
  }
  get len()
  {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  set len(value)
  {
    const fact = value / this.len;
    this.x *= fact;
    this.y *= fact;
  }
}

class Rect {
  pos: Vec;
  size: Vec;
  constructor(w: number, h: number)
  {
    this.pos = new Vec();
    this.size = new Vec(w, h);
  }
  get left()
  {
    return this.pos.x;
  }
  get right()
  {
    return this.pos.x + this.size.x;
  }
  get top()
  {
    return this.pos.y;
  }
  get bottom()
  {
    return this.pos.y + this.size.y;
  }
}

class Ball extends Rect {
  vel: Vec;
  constructor()
  {
    super(18,18);
    this.vel = new Vec();
  }
}

class PowerUp extends Rect {
	type: number;

	constructor () {
		super(50, 50);
		this.type = 0
	}
}

class Player extends Rect {
  score: number;
  empowered: number;
  constructor()
  {
    super(20,100);
    this.score = 8;
    this.empowered = 0;
  }
}



class Pong {
  _canvas: HTMLCanvasElement;
  _context: CanvasRenderingContext2D | null;
  ball: Ball;
  animation: number;
  players: Player [];
  obstacles: Rect [];
  curr_map: number;
  powerups: boolean;
  curr_powerUp: PowerUp;
  auth: string;
  socket: Socket;
  id: number;
  game_ended: boolean;
  fn: Function;
  enemy_id: number;
  constructor(fn: Function, canvas: HTMLElement, authToken: string, socket: Socket, id: number, map: any)
  {
    this._canvas = canvas as HTMLCanvasElement;
    this._context = this._canvas.getContext('2d');
    this.ball = new Ball();
    this.ball.pos.x = this._canvas.width / 2;
    this.ball.pos.y = this._canvas.height / 2;
    this.ball.vel.x = 0;
    this.ball.vel.y = 0;
    this.animation = 0;
    this.game_ended = false;
    this.players = [
      new Player(),
      new Player(),
    ]

    // MAPS
    this.curr_map = map.map;
    this.powerups = map.powerup;
	  this.curr_powerUp = new PowerUp();

    if (this.curr_map === 1)
    {
      this.obstacles = [
        new Rect(50, 50),
        new Rect(50, 50),
        new Rect(50, 50),
        new Rect(50, 50)
      ]
      this.obstacles[0].pos.x = this._canvas.width / 3 - this.obstacles[0].size.x / 2;
      this.obstacles[0].pos.y = this._canvas.height / 3 - this.obstacles[0].size.y / 2;
      this.obstacles[1].pos.x = this._canvas.width * 2 / 3 - this.obstacles[1].size.x / 2;
      this.obstacles[1].pos.y = this._canvas.height / 3 - this.obstacles[1].size.y / 2;
      this.obstacles[2].pos.x = this._canvas.width / 3 - this.obstacles[2].size.x / 2;
      this.obstacles[2].pos.y = this._canvas.height * 2 / 3 - this.obstacles[2].size.y / 2;
      this.obstacles[3].pos.x = this._canvas.width *2 / 3 - this.obstacles[3].size.x / 2;
      this.obstacles[3].pos.y = this._canvas.height * 2 / 3 - this.obstacles[3].size.y / 2;
    }
    else if (this.curr_map === 2)
    {
      this.obstacles = [
        new Rect(15, 40),
        new Rect(15, 80),
        new Rect(15, 40),
        new Rect(15, 80)
      ]
      this.obstacles[0].pos.x = this._canvas.width / 2 - this.obstacles[0].size.x / 2;
      this.obstacles[0].pos.y = 0;
      this.obstacles[1].pos.x = this._canvas.width / 2 - this.obstacles[1].size.x / 2;
      this.obstacles[1].pos.y = this._canvas.height / 4 - this.obstacles[1].size.y / 2;
      this.obstacles[2].pos.x = this._canvas.width / 2  - this.obstacles[2].size.x / 2;
      this.obstacles[2].pos.y = this._canvas.height - this.obstacles[2].size.y;
      this.obstacles[3].pos.x = this._canvas.width / 2 - this.obstacles[3].size.x / 2;
      this.obstacles[3].pos.y = this._canvas.height * 3 / 4 - this.obstacles[3].size.y / 2;
    }
    else
      this.obstacles = [];

    // MAPS END

    this.fn = fn;
    this.auth = authToken;
    this.players[0].pos.x = 30;
    this.players[1].pos.x = this._canvas.width - 30;
    this.players[0].pos.y = (this._canvas.height - this.players[0].size.y) / 2;
    this.players[1].pos.y = (this._canvas.height - this.players[0].size.y) / 2;
    this.socket = socket;
    let lastTime: number;
    this.id = id;
    this.enemy_id = id ? 0 : 1;

    const callback = (millis: number) => {

      if (lastTime) {
          this.update((millis - lastTime) / 1000);
      }
      lastTime = millis;
      this.animation = requestAnimationFrame(callback);
      
  };
    this.start();
    callback(0);  
  }

  end()
  {
    cancelAnimationFrame(this.animation);
  }



  start()
  {

    this.socket.on('changeScore', (message: number[]) => {
      this.players[0].score = message[0];
      this.players[1].score = message[1];
      this.draw();
    })
    // this.socket.emit('launchBall');
    // this.socket.on('getBallSpeed', (message: Vec) => {
    //     console.log(message);
    //     this.ball.pos = message;
    // })
    this.socket.on('endGame', (abandoned: string) => {
      if (this._context !== null)
      {
        this._canvas.style.opacity = '0.5';
      }
      if (abandoned === "abandoned")
        this.fn('gotAbandoned', this.auth)
      else if (this.players[this.id].score >= 10)
        this.fn('won', this.auth);
      else
        this.fn('lost', this.auth);
      this.socket.emit('leaveRoom');
      this.end();
    })
    this.socket.on('getPosition', (position: number) => {
      this.players[this.enemy_id].pos.y = position;
    })
    this.socket.on('getBallPosition', (position: Vec) => {
      this.ball.pos = position;
    })

    this.socket.on('getPowerUp', (powerUp: PowerUp) => {
      this.curr_powerUp = powerUp;
    })
    this.socket.on('getPaddles', (leftPaddle: Player, rightPaddle: Player) => {
      this.players[0] = leftPaddle;
      this.players[1] = rightPaddle;
    })


    // if (this.game_ended)
    // {
    //     if (this.players[this.id].score >= 10)
    //       this.fn('won', this.auth);
    //     else
    //       this.fn('lost', this.auth);
    //     this.socket.emit('leaveRoom');
    //     // this.end();
    //     this.game_ended = true;

    // }

    // if (this.ball.vel.x === 0 && this.ball.vel.y === 0) {
  // }

  }

  drawObstacles(rect: Rect)
  {
	  if (this._context !== null)
	  {
		this._context.fillStyle = "white";
		this._context.fillRect(rect.pos.x, rect.pos.y, 
			rect.size.x, rect.size.y);
	  }
  }
  
  drawPowerUp(powerUp: PowerUp)
  {
	  if (this._context !== null)
	  {
		  if (powerUp.type === 3)
		  	this._context.fillStyle = "green";
		  else if (powerUp.type === 2)
		  	this._context.fillStyle = "red";
		  else
		  	this._context.fillStyle = "blue";

        this._context.fillRect(powerUp.pos.x, powerUp.pos.y, 
			powerUp.size.x, powerUp.size.y);
	  }
  }

  draw()
  {
    if (this._context !== null)
    {
      this._context.fillStyle = "black";
      this._context.fillRect(0,0, 
                              this._canvas.width, this._canvas.height);
      this._context.fillStyle = 'white';
      this._context.beginPath();
      this._context.strokeStyle = "white";
      this._context.setLineDash([5, 5]);
      this._context.moveTo(this._canvas.width / 2, 0);
      this._context.lineTo(this._canvas.width / 2, this._canvas.height);
      this._context.stroke();
      this.players.forEach(player => this.drawRect(player));
      this.players.forEach((player, index) => this.drawScore(player.score.toString(), index));
      
      // Draw obstacles
      this.obstacles.forEach(obstacles => this.drawObstacles(obstacles));
      if (this.curr_powerUp.type !== 0)
        this.drawPowerUp(this.curr_powerUp);

      this._context.fillStyle = 'white';
      this._context.fillRect(this.ball.pos.x, this.ball.pos.y, this.ball.size.x, this.ball.size.y);
    }
  }
  
  drawScore(scores: string, index: number)
  {
    const align = this._canvas.width / 3;
    if (this._context !== null)
    {
      this._context.fillStyle = "white"; 
      this._context.font = '50px Anton';
      this._context.fillText(scores, align * (index + 1), 100);
    }
  }

  drawRect(rect: Rect)
  {
    if (this._context !== null)
    {
      this._context.fillStyle = "white";
      this._context.fillRect(rect.pos.x, rect.pos.y, 
                            rect.size.x, rect.size.y);
      }
  }
  update(dt: number) {
    this.draw();
  }
}

export default Pong;
