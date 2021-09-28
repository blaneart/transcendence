import { globalAgent } from "http";
import { runInThisContext } from "vm";
import { Player } from './game.gateway';
import { PowerUpType } from "../app.types";
import { Socket } from "socket.io";

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

export class Paddle extends Rect {
  up: number;
  down: number;
  constructor()
  {
    super(20, 100);
    this.up = 0;
    this.down = 0;
  }
}

export class Ball extends Rect {
  vel: Vec;
  acceleration: number;
  lastTouched: number;
  constructor()
  {
    super(18, 18);
    this.vel = new Vec();
    this.acceleration = 50;
    this.lastTouched = this.vel.x ? 0 : 1;
  }
  setPosition(x: number, y: number)
  {
    this.pos.x = x;
    this.pos.y = y;
  }
}

class PowerUp extends Rect {
	type: PowerUpType;

	constructor () {
		super(100, 100);
		this.type = 0
	}
}


export class Pong {
  ball: Ball;
  height: number;
  width: number;
  interval: number;
  // players: Player[];
  scores: number[];
  leftPaddle: Paddle;
  rightPaddle: Paddle;
  obstacles: Rect [];
  curr_map: number;
  powerups: boolean;
  curr_powerUp: PowerUp;

  canvasWidth: number;
  canvasHeight: number;

  constructor(ball: Ball, scores, map: any)
  {
      this.ball = ball;
      this.ball.pos.x = 800 / 2;
      this.ball.pos.y = 600 / 2;
      this.ball.vel.x = -10;
      this.ball.vel.y = 20;
      this.curr_powerUp = new PowerUp();
      this.width = 800;
      this.height = 600;
      this.interval = 1000 / 60;
      this.scores = scores;
      this.leftPaddle;
      this.rightPaddle;
      this.canvasHeight = 600; // for now, fixed as on frontend
      this.canvasWidth = 800;


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
      this.obstacles[0].pos.x = this.canvasWidth / 3 - this.obstacles[0].size.x / 2;
      this.obstacles[0].pos.y = this.canvasHeight / 3 - this.obstacles[0].size.y / 2;

      this.obstacles[1].pos.x = this.canvasWidth * 2 / 3 - this.obstacles[1].size.x / 2;
      this.obstacles[1].pos.y = this.canvasHeight / 3 - this.obstacles[1].size.y / 2;

      this.obstacles[2].pos.x = this.canvasWidth / 3 - this.obstacles[2].size.x / 2;
      this.obstacles[2].pos.y = this.canvasHeight * 2 / 3 - this.obstacles[2].size.y / 2;

      this.obstacles[3].pos.x = this.canvasWidth * 2 / 3 - this.obstacles[3].size.x / 2;
      this.obstacles[3].pos.y = this.canvasHeight * 2 / 3 - this.obstacles[3].size.y / 2;
    }
    else if (this.curr_map === 2)
    {
      this.obstacles = [
        new Rect(15, 40),
        new Rect(15, 80),
        new Rect(15, 40),
        new Rect(15, 80)
      ]
      this.obstacles[0].pos.x = this.canvasWidth / 2 - this.obstacles[0].size.x / 2;
      this.obstacles[0].pos.y = 0;
      this.obstacles[1].pos.x = this.canvasWidth / 2 - this.obstacles[1].size.x / 2;
      this.obstacles[1].pos.y = this.canvasHeight / 4 - this.obstacles[1].size.y / 2;
      this.obstacles[2].pos.x = this.canvasWidth / 2  - this.obstacles[2].size.x / 2;
      this.obstacles[2].pos.y = this.canvasHeight - this.obstacles[2].size.y;
      this.obstacles[3].pos.x = this.canvasWidth / 2 - this.obstacles[3].size.x / 2;
      this.obstacles[3].pos.y = this.canvasHeight * 3 / 4 - this.obstacles[3].size.y / 2;
    }
    else
      this.obstacles = [];

    // MAPS END
  };
  
  update(dt:number, player1: Player, player2: Player, server: any, roomName: string)
  {
    let pos = this.accelerate(this.ball.pos.x, this.ball.pos.y, this.ball.vel.x, this.ball.vel.y, this.ball.acceleration, dt);

    if (this.powerups === true && this.ball.vel.x !== 0 && this.curr_powerUp.type === PowerUpType.NONE && Math.floor(Math.random() * 100) === 50)
    {
      this.curr_powerUp.pos.x = this.canvasWidth / 2 - this.curr_powerUp.size.x / 2;
      this.curr_powerUp.pos.y = Math.random() * (this.canvasHeight - this.curr_powerUp.size.y / 2);
      this.curr_powerUp.type = Math.floor(Math.random() * 3) + 1;
    }
    if ((this.ball.vel.y > 0) && (this.ball.bottom > this.height))
    {
      server.to(roomName).emit('playTwo');
      pos.y = this.height - this.ball.size.y;
      pos.dy = -pos.dy;
    }
    else if ((this.ball.vel.y < 0) && (this.ball.top < 0))
    {
      server.to(roomName).emit('playTwo');

      pos.y = 0;
      pos.dy = -pos.dy;
    }

    this.touched(this.curr_powerUp, player1, player2, pos);
    let paddle = (pos.dx < 0) ? player1 : player2;
    var pt = null;
    var paddleHit = false;
    pt = this.ballIntercept(this.ball, paddle.paddle, pos.nx, pos.ny);
    if (pt)
    {
      server.to(roomName).emit('playOne');

      this.ball.lastTouched = paddle.Id;
      paddleHit = true;
    }
    // if we don't hit the paddle, check if we hit the obstacles
    if (!pt)
    {
      let i = 0;
      while (i < this.obstacles.length && !pt)
      {
        pt = this.ballIntercept(this.ball, this.obstacles[i], pos.nx, pos.ny);
        i++;
      }
    }
    if (pt) {
      server.to(roomName).emit('playTwo');

      switch(pt.d) {
        case 'left':
        case 'right':
          pos.x = pt.x;
          pos.dx = -pos.dx;
          break;
        case 'top':
        case 'bottom':

          pos.y = pt.y;
          pos.dy = -pos.dy;

          break;
      }
      if (paddle.dp < 0)
        pos.dy = pos.dy * (pos.dy < 0 ? 0.5 : 1.5);
      else if (paddle.dp > 0)
        pos.dy = pos.dy * (pos.dy > 0 ? 0.5 : 1.5); 
    }

    this.ball.pos.x = pos.x;
    this.ball.pos.y = pos.y;
    this.ball.vel.x = pos.dx;
    this.ball.vel.y = pos.dy;

  
    if (this.powerups === true)
    {
      this.poweringUp(player1);
      this.poweringUp(player2);
    }
    if (paddleHit)
    {
      if (this.powerups === true && paddle.empowered === PowerUpType.RED)
		  {
        this.ball.vel.len *= 2.5;
        paddle.empowered = 0;
		  }
    }
    if (this.ball.right < 0)
      this.goal(1, player1, player2, server, roomName);
    if (this.ball.left
       > this.width)
      this.goal(0, player1, player2, server, roomName);
  }

  touched(powerUp: PowerUp, player0: Player, player1: Player, pos: any)
  {
    let pt = this.ballIntercept(this.ball, powerUp, pos.nx, pos.ny);
    const enemy = this.ball.lastTouched === 1 ? player1 : player0;
    if (pt)
    {
      enemy.empowered = powerUp.type;
      powerUp.type = 0;
      this.ball.lastTouched = 0;
    }
  }

  poweringUp(player: Player)
  {
    if (player.paddle.size.y > 100)
    {
      player.paddle.size.y -= 0.3;
      if (player.paddle.size.y < 100)
        player.paddle.size.y = 100;
    }
    if (player.empowered === PowerUpType.GREEN)
    {
      player.paddle.size.y = 300;
      player.empowered = PowerUpType.NONE;
    }
  }

  accelerate(x: number, y, dx, dy, accel, dt)
  {
    var x2  = x + (dt * dx) + (accel * dt * dt * 0.5);
    var y2  = y + (dt * dy) + (accel * dt * dt * 0.5);
    var dx2 = dx + (accel * dt) * (dx > 0 ? 1 : -1);
    var dy2 = dy + (accel * dt) * (dy > 0 ? 1 : -1);
    return { nx: (x2-x), ny: (y2-y), x: x2, y: y2, dx: dx2, dy: dy2 };
  }

  goal(pos: number, player1: Player, player2: Player, server: any, roomName: string)
  {
    if (!((pos === 0 && player2.empowered === PowerUpType.BLUE) || (pos === 1 && player1.empowered === PowerUpType.BLUE))) // If the loser is enchanted
      this.scores[pos] += 1;
    server.to(roomName).emit('playThree');

    this.reset(pos, player1, player2);
  }

  reset(pos: number, player1: Player, player2: Player)
  {
    this.ball.pos.x= 400;
    this.ball.pos.y = (Math.random() * (this.height - this.ball.size.y));
    // this.ball.vel.y = 
    this.ball.vel.x = pos ? - Math.random() * 200 : Math.random() * 200;
    this.ball.vel.y = pos ? - Math.random() * 100 : Math.random() * 100;
    player1.empowered = 0;
    player2.empowered = 0;
  }
  
  ballIntercept(ball: Ball, rect, nx, ny){
    var pt =null;
    if (nx < 0)
    {
      pt = this.intercept(ball.pos.x +ball.size.x / 2, ball.pos.y +ball.size.x / 2, ball.pos.x + ball.size.x / 2 + nx, ball.pos.y +  ball.size.x / 2 + ny, 
        rect.right   + ball.size.x / 2, 
        rect.top    - ball.size.x / 2, 
        rect.right   + ball.size.x / 2, 
        rect.bottom + ball.size.x / 2,
        "right");
    }
    else if (nx > 0)
    {
      pt = this.intercept(ball.pos.x +ball.size.x / 2, ball.pos.y +ball.size.x / 2, ball.pos.x + ball.size.x / 2 + nx, ball.pos.y +  ball.size.x / 2 + ny, 
        rect.left   - ball.size.x / 2, 
        rect.top    - ball.size.x / 2, 
        rect.left   - ball.size.x / 2, 
        rect.bottom + ball.size.x / 2,
        "left");
      
      }
    if (!pt) {
      if (ny < 0) {
          pt =  this.intercept(ball.pos.x +ball.size.x / 2, ball.pos.y +ball.size.x / 2, ball.pos.x + ball.size.x / 2 + nx, ball.pos.y +  ball.size.x / 2 + ny, 
                                     rect.left   - ball.size.x / 2,
                                     rect.bottom + ball.size.x / 2, 
                                     rect.right  + ball.size.x / 2, 
                                     rect.bottom + ball.size.x / 2,
                                     "bottom");

        }
      else if (ny > 0) {
          pt = this.intercept(ball.pos.x +ball.size.x / 2, ball.pos.y +ball.size.x / 2, ball.pos.x + ball.size.x / 2 + nx, ball.pos.y +  ball.size.x / 2 + ny, 
                                     rect.left   - ball.size.x  / 2, 
                                     rect.top    - ball.size.x  / 2, 
                                     rect.right  + ball.size.x  / 2, 
                                     rect.top    - ball.size.x  / 2,
                                     "top");

    }
  }
  return pt;
  }

  intercept(x1, y1, x2, y2, x3, y3, x4, y4, d) {
      var denom = ((y4-y3) * (x2-x1)) - ((x4-x3) * (y2-y1));
      if (denom != 0) {
        var ua = (((x4-x3) * (y1-y3)) - ((y4-y3) * (x1-x3))) / denom;

        if ((ua >= 0) && (ua <= 1)) {
          var ub = (((x2-x1) * (y1-y3)) - ((y2-y1) * (x1-x3))) / denom;
          if ((ub >= 0) && (ub <= 1)) {
            var x = x1 + (ua * (x2-x1));
            var y = y1 + (ua * (y2-y1));
            return { x: x, y: y, d: d};
          }
        }
      }
      return null;
    }
    intersects(a,b,c,d,p,q,r,s, where) {
      var det, gamma, lambda;
      det = (c - a) * (s - q) - (r - p) * (d - b);
      if (det === 0) {
        return false;
      } else {
        lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
        gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
        return { x: a, y: b, d: d};
      }
    };
  }
