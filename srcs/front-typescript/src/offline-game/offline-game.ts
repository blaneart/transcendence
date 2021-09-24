
// interface Vec {
//   x: number,
//   y: number
// }

// import { collapseTextChangeRangesAcrossMultipleVersions } from "typescript";

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
  lastTouch: number
  constructor(ratio: number)
  {
    super(18 * ratio, 18 * ratio);
    this.vel = new Vec();
	this.lastTouch = 0;
  }
}

class PowerUp extends Rect {
	type: number;

	constructor (ratio: number) {
		super(50 * ratio, 50 * ratio);
		this.type = 0
	}
}

class Player extends Rect {
  score: number;
  botDifficulty: number;
  empowered: number;

  constructor(difficulty: number, ratio: number)
  {
    super(20 * ratio, 100 * ratio);
	  this.empowered = 0;
    this.score = 0;
	  this.botDifficulty = difficulty;
  }
}



class Offline_Pong {
  _canvas: HTMLCanvasElement;
  _context: CanvasRenderingContext2D | null;
  ball: Ball;
  animation: number;
  players: Player [];
  obstacles: Rect [];
  auth: string;
  curr_powerUp: PowerUp;
  powerups: boolean;
  curr_map: number;
  last_score: number;
  audios: any [];
  ratio: number;
  borderElem: any;
  isSound: boolean;
  constructor(fn: Function, canvas: HTMLElement, authToken: string, difficultyBot: any, map: any, ratio: number)
  {
    this.last_score = -1;
	  this.curr_map = map.maps;
    this.isSound = map.sounds;
	  this.powerups = map.powerUps;
    this._canvas = canvas as HTMLCanvasElement;
    this.borderElem = document.getElementById("custom-border");
    let size = window.innerWidth < window.innerHeight * 4 / 3 ? window.innerWidth : window.innerHeight;
    this._canvas.width = size * 0.8;
    this._canvas.height = size * 0.8 * 3 / 4;
    this.borderElem.style.width = this._canvas.width;
    this.ratio = this._canvas.width / 800;
    this.curr_powerUp = new PowerUp(this.ratio);
    this._context = this._canvas.getContext('2d');
    this.ball = new Ball(this.ratio);
    this.ball.pos.x = this._canvas.width / 2 - this.ball.size.x / 2;
    this.ball.pos.y = this._canvas.height / 2 - this.ball.size.y / 2;
    this.ball.vel.x = 0;
    this.ball.vel.y = 0;
    this.animation = 0;

    this.audios = [
      new Audio(process.env.REACT_APP_API_URL + "/audio/paddle_sound.mp3"),
      new Audio(process.env.REACT_APP_API_URL + "/audio/wall_sound.mp3"),
      new Audio(process.env.REACT_APP_API_URL + "/audio/score_sound.mp3")
    ]
    this.audios[0].load();
    this.audios[1].load();
    this.audios[2].load();

    this.players = [
      new Player(-1, this.ratio),
      new Player(difficultyBot.number + 1, this.ratio),
    ]

	if (this.curr_map === 1)
	{
		this.obstacles = [
			new Rect(50 * this.ratio, 50 * this.ratio),
			new Rect(50 * this.ratio, 50 * this.ratio),
			new Rect(50 * this.ratio, 50 * this.ratio),
			new Rect(50 * this.ratio, 50 * this.ratio)
		]
		this.obstacles[0].pos.x = this._canvas.width / 3 - this.obstacles[0].size.x / 2;
    this.obstacles[0].pos.y = this._canvas.height / 3 - this.obstacles[0].size.y / 2;
    
		this.obstacles[1].pos.x = this._canvas.width * 2 / 3 - this.obstacles[1].size.x / 2;
    this.obstacles[1].pos.y = this._canvas.height / 3 - this.obstacles[1].size.y / 2;
    
		this.obstacles[2].pos.x = this._canvas.width / 3 - this.obstacles[2].size.x / 2;
    this.obstacles[2].pos.y = this._canvas.height * 2 / 3 - this.obstacles[2].size.y / 2;
    
		this.obstacles[3].pos.x = this._canvas.width * 2 / 3 - this.obstacles[3].size.x / 2;
		this.obstacles[3].pos.y = this._canvas.height * 2 / 3 - this.obstacles[3].size.y / 2;
	}
	else if (this.curr_map === 2)
	{
		this.obstacles = [
			new Rect(15 * this.ratio, 40 * this.ratio),
			new Rect(15 * this.ratio, 80 * this.ratio),
			new Rect(15 * this.ratio, 40 * this.ratio),
			new Rect(15 * this.ratio, 80 * this.ratio)
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
  this.auth = authToken;
  this.players[0].pos.x = 20 * this.ratio;
  this.players[1].pos.x = this._canvas.width - 20 * this.ratio - this.players[1].size.x;
  this.players[0].pos.y = (this._canvas.height - this.players[0].size.y) / 2;
  this.players[1].pos.y = (this._canvas.height - this.players[0].size.y) / 2;


    let lastTime: number;

    const callback = (millis: number) => {
      if (this.isGameEnded())
      {
          if (this.players[0].score >= 10)
            fn('won', this.auth);
          else
            fn('lost', this.auth);
          this.end();
          if (this._context !== null)
          {
            this._canvas.style.opacity = '0.5';
          }
      }
      else 
      {
        if (lastTime) {
          this.update((millis - lastTime) / 1000, difficultyBot, map);
        }
        lastTime = millis;
        this.animation = requestAnimationFrame(callback);
      }
  };
    callback(0);
  }

  collide(player: Player, ball: Ball)
  {
    if (player.left < ball.right && player.right > ball.left &&
        player.top < ball.bottom && player.bottom > ball.top)
    {
      if (this.isSound)
        this.audios[0].play();
      ball.vel.x = -ball.vel.x;
		  if (player.botDifficulty < 0)
      {
        ball.pos.x = player.pos.x + player.size.x;
        this.ball.lastTouch = 1;
      }
		  else
      {
        this.ball.lastTouch = 2;
        ball.pos.x = player.pos.x - ball.size.x;
      }
      ball.vel.y = (((player.pos.y + player.size.y / 2) - (ball.pos.y + ball.size.y / 2)) * -15) * 100 * this.ratio / player.size.y;
      ball.vel.len *= 1.05;
		  if (this.powerups === true && (player.empowered === 2 || player.empowered === 4))
		  {
        ball.vel.len *= 2.5;
        if (player.empowered === 4)
          player.empowered = 1;
        else
          player.empowered = 0;
		  }
    }
  }

  collideObstacles(obstacle: Rect, ball: Ball)
  {
    let vert = 0
    let left = ball.vel.x > 0 ? -1 : 1;
    if (obstacle.left < ball.right && obstacle.right > ball.left &&
        obstacle.top < ball.bottom && obstacle.bottom > ball.top)
    {
      if (this.isSound)
        this.audios[1].play();
			if (ball.vel.y < 0)
			{
				if (left >= 0)
				{
					if (Math.abs(ball.vel.x) > Math.abs(ball.vel.y))
					{
						ball.pos.x = obstacle.pos.x + obstacle.size.x;
						vert = -1;
					}
					else
					{
						ball.pos.y = obstacle.pos.y + obstacle.size.y;
						vert = 1;
					}
				}
				else
				{
					if (Math.abs(ball.vel.x) > Math.abs(ball.vel.y))
					{
						ball.pos.x = obstacle.pos.x - ball.size.x;
						vert = -1;

					}
					else
					{
						ball.pos.y = obstacle.pos.y + obstacle.size.y;
						vert = 1;

					}
				}
			}
			else
			{
				if (left >= 0)
				{
					if (Math.abs(ball.vel.x) > Math.abs(ball.vel.y))
					{
						ball.pos.x = obstacle.pos.x + obstacle.size.x;
						vert = -1;

					}
					else
					{
						ball.pos.y = obstacle.pos.y - ball.size.y;
						vert = 1;

					}
				}
				else
				{
					if (Math.abs(ball.vel.x) > Math.abs(ball.vel.y))
					{
						ball.pos.x = obstacle.pos.x - ball.size.x;
						vert = -1;

					}
					else
					{
						ball.pos.y = obstacle.pos.y - ball.size.y;
						vert = 1;
					}
				}
			}
			ball.vel.y = (((obstacle.pos.y + obstacle.size.y / 2) - (ball.pos.y + ball.size.y / 2)) * -15) * 30 / obstacle.size.y;
			if (vert === -1)
        ball.vel.x = -ball.vel.x;
		}
  }

  touched(rect: PowerUp, ball: Ball)
  {
    if (rect.left < ball.right && rect.right > ball.left &&
          rect.top < ball.bottom && rect.bottom > ball.top && ball.lastTouch !== 0)
    {
      if (this.players[ball.lastTouch - 1].empowered === 1 && rect.type !== 1)
        this.players[ball.lastTouch - 1].empowered += rect.type + 1;
      else
        this.players[ball.lastTouch - 1].empowered = rect.type;
      rect.type = 0;
      this.ball.lastTouch = 0;
    }
  }

  end()
  {
    cancelAnimationFrame(this.animation);
  }

  changedifficulty(difficulty: any)
  {
	  this.players[1].botDifficulty = difficulty.number + 1;
  }

  reset()
  {
    this.ball.lastTouch = 0;
    this.ball.pos.x = this._canvas.width / 2 - this.ball.size.x / 2;
    this.ball.pos.y = this._canvas.height / 2 - this.ball.size.y / 2;
    this.ball.vel.x = 0;
    this.ball.vel.y = 0;
    this.players[1].pos.x = this._canvas.width - 20 * this.ratio - this.players[1].size.x;
    this.players[1].pos.y = (this._canvas.height - this.players[0].size.y) / 2;
    this.players[1].size.y = 100 * this.ratio;
    this.players[0].size.y = 100 * this.ratio;
    this.players[0].empowered = 0;
    this.players[1].empowered = 0;
  }

  isGameEnded() : boolean
  {
    return (this.players[0].score >= 10 || this.players[1].score >= 10)
  }

  poweringUp(player: Player)
  {
    if (player.size.y > 100 * this.ratio)
    {
      player.size.y -= 0.3 * this.ratio;
      if (player.size.y < 100 * this.ratio)
        player.size.y = 100 * this.ratio;
    }
    if (player.empowered === 3 || player.empowered === 5)
    {
      player.size.y = 300 * this.ratio;
      if (player.empowered === 5)
        player.empowered = 1;
      else
        player.empowered = 0;
    }
  }

  start()
  {
    if (this.ball.vel.x === 0 && this.ball.vel.y === 0) {
      if (this.last_score === -1)
        this.ball.vel.x = 300 * this.ratio * (Math.random() > .5 ? 1 : -1);
      else
        this.ball.vel.x = 300 * this.ratio * (this.last_score === 0 ? 1 : -1);
      this.ball.vel.y = 100 * this.ratio * (Math.random() * 2 - 1);
      this.ball.vel.len = 400 * this.ratio;
	    this.ball.lastTouch = 0;
    }
  }
  draw()
  {
    if (this._context !== null)
    {
      this._context.fillStyle = "black";
      this._context.fillRect(0,0,this._canvas.width, this._canvas.height);
      this._context.fillStyle = 'white';
      this._context.beginPath();
      this._context.strokeStyle = "white";
      this._context.setLineDash([5, 5]);
      this._context.moveTo(this._canvas.width / 2, 0);
      this._context.lineTo(this._canvas.width / 2, this._canvas.height);
      this._context.stroke();
      this.players.forEach(player => this.drawRect(player));
      this.players.forEach((player, index) => this.drawScore(player.score.toString(), index));
      this.obstacles.forEach(obstacles => this.drawObstacles(obstacles));
      if (this.curr_powerUp.type !== 0) //
        this.drawPowerUp(this.curr_powerUp); // 
      if (!this.isGameEnded())
      {
        this._context.fillStyle = 'white';
        this._context.fillRect(this.ball.pos.x, this.ball.pos.y, this.ball.size.x, this.ball.size.y);
      }
    }
  }
  drawScore(scores: string, index: number)
  {
    const size = 50 * this.ratio;
    const align = this._canvas.width / 3;
    if (this._context !== null)
    {
      this._context.fillStyle = "white"; 
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
        if (rect.empowered === 2 || rect.empowered === 4)
        this._context.fillStyle = "red";
        else if (rect.empowered === 1)
          this._context.fillStyle = "blue";
        else if (rect.size.y > 100 * this.ratio)
          this._context.fillStyle = "green";
        else
          this._context.fillStyle = "white";
        this._context.fillRect(rect.pos.x, rect.pos.y, 
                              rect.size.x, rect.size.y);
      }
      else
      {
        this._context.fillStyle = "white";
        this._context.fillRect(rect.pos.x, rect.pos.y, 
                              rect.size.x, rect.size.y);
      }
    }
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
  changeplace(object: Rect, ratio: number)
  {
    object.size.x *= ratio;
    object.size.y *= ratio;
    object.pos.x *= ratio;
    object.pos.y *= ratio;
  }

  update(dt: number, difficulty: any, map: any) {
    this.ball.pos.x += this.ball.vel.x * dt;
    this.ball.pos.y += this.ball.vel.y * dt;
    let size = window.innerWidth < window.innerHeight * 4 / 3 ? window.innerWidth : window.innerHeight;
    this._canvas.width = size * 0.8;
    this._canvas.height = size * 0.8 * 3 / 4;
    this.borderElem.style.width = this._canvas.width;
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
    if (this.powerups === true && this.ball.vel.x !== 0 && this.curr_powerUp.type === 0 && Math.floor(Math.random() * 100) === 50)
    {
      this.curr_powerUp.pos.x = this._canvas.width / 2 - this.curr_powerUp.size.x / 2;
      this.curr_powerUp.pos.y = Math.random() * (this._canvas.height - this.curr_powerUp.size.y / 2);
      this.curr_powerUp.type = Math.floor(Math.random() * 3) + 1;
    }
    if (this.ball.right <= 0 || this.ball.left >= this._canvas.width)
    {
      if (this.isSound)
        this.audios[2].play();
      let playerId = this.ball.vel.x < 0 ? 1 : 0;
      if (this.players[playerId ? 0 : 1].empowered !== 1 && this.players[playerId ? 0 : 1].empowered !== 4 && this.players[playerId ? 0 : 1].empowered !== 5)
      {
        this.players[playerId].score++;
        this.last_score = playerId;
      }
      this.reset();
    }
    if (this.ball.top < 0 || this.ball.bottom > this._canvas.height)
    {
      if (this.isSound)
        this.audios[1].play();
      this.ball.vel.y = -this.ball.vel.y;
      if (this.ball.top < 0)
        this.ball.pos.y = 0;
      else
        this.ball.pos.y = this._canvas.height - this.ball.size.y;
    }
    this.touched(this.curr_powerUp, this.ball);
    this.players.forEach(player => this.collide(player, this.ball));
    this.obstacles.forEach(obstacles => this.collideObstacles(obstacles, this.ball));
    if (this.powerups === true)
      this.players.forEach(player => this.poweringUp(player));
    this.changedifficulty(difficulty);
    if (this.ball.pos.y - (this.players[1].pos.y + this.players[1].size.y / 2) >= this.players[1].botDifficulty)
      this.players[1].pos.y += this.players[1].botDifficulty * this.ratio;
    else if (this.ball.pos.y - (this.players[1].pos.y + this.players[1].size.y / 2) <= -this.players[1].botDifficulty)
      this.players[1].pos.y -= this.players[1].botDifficulty * this.ratio;
    this.draw(); 
  }
}

export default Offline_Pong;