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

enum PowerUpType {
  NONE = 0,
  RED = 1, // Speeds up the ball temporarily
  GREEN = 2, // Makes the last player's paddle larger temporarily
  BLUE = 3, // The player losing this ball will win the point
}

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

class Paddle extends Rect {
  up: number;
  down: number;
  constructor()
  {
    super(20, 100);
    this.up = 0;
    this.down = 0;
  }
}

class Ball extends Rect {
  vel: Vec;
  constructor(ratio: number)
  {
    super(18 * ratio, 18 * ratio);
    this.vel = new Vec();
  }
}

class PowerUp extends Rect {
	type: PowerUpType;

	constructor (ratio: number) {
		super(100 * ratio, 100 * ratio);
		this.type = 0
	}
}

class Player extends Rect {
  score: number;
  empowered: PowerUpType;
  paddle: Paddle;
  constructor(ratio: number)
  {
    super(20 * ratio, 100 * ratio);
    this.score = 0;
    this.empowered = PowerUpType.NONE;
    this.paddle = new Paddle()
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
  ratio: number;
  audios: any [];
  isSound: boolean;
  constructor(fn: Function, canvas: HTMLElement, authToken: string, socket: Socket, id: number, map: any, ratio: number)
  {
    this.audios = [
      new Audio(process.env.REACT_APP_API_URL + "/audio/paddle_sound.mp3"),
      new Audio(process.env.REACT_APP_API_URL + "/audio/wall_sound.mp3"),
      new Audio(process.env.REACT_APP_API_URL + "/audio/score_sound.mp3")
    ]
    this.audios[0].load();
    this.audios[1].load();
    this.audios[2].load();

    this._canvas = canvas as HTMLCanvasElement;
    this._context = this._canvas.getContext('2d');
    this.ball = new Ball(ratio);
    this.ball.pos.x = this._canvas.width / 2;
    this.ball.pos.y = this._canvas.height / 2;
    this.ball.vel.x = 0;
    this.ball.vel.y = 0;
    this.animation = 0;
    this.game_ended = false;
    this.players = [
      new Player(ratio),
      new Player(ratio),
    ]

    this.ratio = ratio;

    // MAPS
    this.curr_map = map.map;
    this.powerups = map.powerup;
    this.isSound = map.sounds;
	  this.curr_powerUp = new PowerUp(ratio);

    if (this.curr_map === 1)
    {
      this.obstacles = [
        new Rect(50 * ratio, 50 * ratio),
        new Rect(50 * ratio, 50 * ratio),
        new Rect(50 * ratio, 50 * ratio),
        new Rect(50 * ratio, 50 * ratio)
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
        new Rect(15 * ratio, 40 * ratio),
        new Rect(15 * ratio, 80 * ratio),
        new Rect(15 * ratio, 40 * ratio),
        new Rect(15 * ratio, 80 * ratio)
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
    this.players[0].pos.x = 30 * ratio ;
    this.players[1].pos.x = this._canvas.width - 50 * ratio;
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
    if (this.isSound)
    {
      this.socket.on('playOne', () => this.audios[0].play())
      this.socket.on('playTwo', () => this.audios[1].play())
      this.socket.on('playThree', () => this.audios[2].play())
    }
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
      this.players[this.enemy_id].pos.y = position * this.ratio;
    })
    this.socket.on('getBallPosition', (position: Vec, changeX: boolean, changeY: boolean) => {
      this.ball.pos.x = position.x * this.ratio;
      this.ball.pos.y = position.y * this.ratio;
    })

    this.socket.on('getPowerUp', (powerUp: PowerUp) => {
      this.curr_powerUp.size.x = powerUp.size.x * this.ratio;
      this.curr_powerUp.size.y = powerUp.size.y * this.ratio;
      
      this.curr_powerUp.pos.x = powerUp.pos.x * this.ratio;
      this.curr_powerUp.pos.y = powerUp.pos.y * this.ratio;
      
      this.curr_powerUp.type = powerUp.type;
    })
    this.socket.on('getPaddles', (leftPaddle: Player, rightPaddle: Player) => {

      if (leftPaddle && rightPaddle && leftPaddle.paddle.size && rightPaddle.paddle.size) {
        this.players[0].size.x = leftPaddle.paddle.size.x * this.ratio;
        this.players[0].size.y = leftPaddle.paddle.size.y * this.ratio;
        this.players[0].empowered = leftPaddle.empowered;
        this.players[1].size.x = rightPaddle.paddle.size.x * this.ratio;
        this.players[1].size.y = rightPaddle.paddle.size.y * this.ratio;
        this.players[1].empowered = rightPaddle.empowered;
      }
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
		  if (powerUp.type === PowerUpType.GREEN)
		  	this._context.fillStyle = "green";
		  else if (powerUp.type === PowerUpType.RED)
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
      const size = 50 * this.ratio;
      this._context.font = `${size}px Anton`;
      this._context.fillText(scores, align * (index + 1), 100 * this.ratio);
    }
  }

  drawRect(rect: Player)
  {
    if (this._context !== null)
	  {
      if (this.powerups === true)
      {
        if (rect.empowered === PowerUpType.RED)
          this._context.fillStyle = "red";
        else if (rect.empowered === PowerUpType.BLUE)
          this._context.fillStyle = "blue";
        else if (rect.size.y > 100 * this.ratio)
          this._context.fillStyle = "green";
        else
          this._context.fillStyle = "white";
      }
      else
        this._context.fillStyle = "white";
      this._context.fillRect(rect.pos.x, rect.pos.y, 
                            rect.size.x, rect.size.y);
    }
  }

  changeplace(object: Rect, ratio: number)
  {
    object.size.x *= ratio;
    object.size.y *= ratio;
    object.pos.x *= ratio;
    object.pos.y *= ratio;
  }

  update(dt: number) {
    let size = window.innerWidth < window.innerHeight ? window.innerWidth : window.innerHeight;
    this._canvas.width = size * 0.7;
    this._canvas.height = size * 0.7 * 0.75;

    if (this.ratio !== this._canvas.width / 800)
    {
      let old_ratio = this.ratio
      this.ratio = this._canvas.width / 800;
      old_ratio = this.ratio / old_ratio;
      this.changeplace(this.ball, old_ratio);
      this.ball.vel.x *= old_ratio;
      this.ball.vel.y *= old_ratio;
      this.changeplace(this.curr_powerUp, old_ratio);
      this.players.forEach(player => this.changeplace(player, old_ratio));
      this.obstacles.forEach(obstacle => this.changeplace(obstacle, old_ratio));
    }
    this.draw();
  }
}

// enum Empowerment {
//   blue = 1,
//   red = 2,
//   green = 3,
//   redTwo = 4,
//   greenTwo = 5,
// }

export default Pong;
