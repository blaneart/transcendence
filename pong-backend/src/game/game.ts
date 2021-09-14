import { globalAgent } from "http";
import { runInThisContext } from "vm";
import {Player} from './game.gateway';
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
  constructor()
  {
    super(18, 18);
    this.vel = new Vec();
    this.acceleration = 5;
  }
  setPosition(x: number, y: number)
  {
    this.pos.x = x;
    this.pos.y = y;
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
  constructor(ball: Ball, scores)
  {
      this.ball = ball;
      this.ball.pos.x = 100;
      this.ball.pos.y = 200;
      this.ball.vel.x = -10;
      this.ball.vel.y = 20;
      this.width = 800;
      this.height = 600;
      this.interval = 1000 / 60;
      this.scores = scores;
      this.leftPaddle;
      this.rightPaddle;
  };
  update(dt:number, player1: Player, player2: Player)
  {
    
    let pos = this.accelerate(this.ball.pos.x, this.ball.pos.y, this.ball.vel.x, this.ball.vel.y, this.ball.acceleration, dt);
    // this.ball.pos.x = this.ball.pos.x + this.ball.vel.x * (dt);
    // this.ball.pos.y = this.ball.pos.y + this.ball.vel.y * (dt);
    if ((this.ball.vel.y > 0) && (this.ball.bottom > this.height))
    {
      pos.y = this.height - this.ball.size.y;
      pos.dy = -pos.dy;
    }
    else if ((this.ball.vel.y < 0) && (this.ball.top < 0))
    {
      pos.y = 0;
      pos.dy = -pos.dy;
    }

    
    let paddle = (pos.dx < 0) ? player1 : player2;
    var pt = null;
    pt = this.ballIntercept(this.ball, paddle.paddle, pos.nx, pos.ny);
    if (pt) {
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
    if (this.ball.right < 0)
      this.goal(1);
    if (this.ball.left
       > this.width)

      this.goal(0);
    }



  accelerate(x: number, y, dx, dy, accel, dt)
  {
    var x2  = x + (dt * dx) + (accel * dt * dt * 0.5);
    var y2  = y + (dt * dy) + (accel * dt * dt * 0.5);
    var dx2 = dx + (accel * dt) * (dx > 0 ? 1 : -1);
    var dy2 = dy + (accel * dt) * (dy > 0 ? 1 : -1);
    return { nx: (x2-x), ny: (y2-y), x: x2, y: y2, dx: dx2, dy: dy2 };
  }

  goal(pos: number)
  {
    // this.players[pos].score += 1;
    this.scores[pos] += 1;
    this.reset(pos);
  }
  reset(pos: number)
  {
    this.ball.pos.x= 400;
    this.ball.pos.y = (Math.random() * (this.height - this.ball.size.y));
    this.ball.vel.y = 
    this.ball.vel.x = pos ? -Math.random() * 200 : Math.random() * 200;
    this.ball.vel.y = pos ? -Math.random() * 100 : Math.random() * 100;
  }
  
  ballIntercept(ball: Ball, rect, nx, ny){
    var pt =null;
    if (nx < 0)
    {
      pt = this.intercept(ball.pos.x , ball.pos.y, ball.pos.x + nx, ball.pos.y + ny, 
        rect.right, 
        rect.top, 
        rect.right,  
        rect.bottom,
        "right");
    }
    else if (nx > 0)
    {
      pt = this.intercept(ball.pos.x, ball.pos.y, ball.pos.x + nx, ball.pos.y + ny, 
        rect.left   - ball.size.x / 2, 
        rect.top    - ball.size.x / 2, 
        rect.left   - ball.size.x / 2, 
        rect.bottom + ball.size.x / 2,
        "left");
      
      }
    if (!pt) {
      if (ny < 0) {
          pt =  this.intercept(ball.pos.x, ball.pos.y, ball.pos.x + nx, ball.pos.y + ny, 
                                     rect.left   - ball.size.x,
                                     rect.bottom + ball.size.x, 
                                     rect.right  + ball.size.x, 
                                     rect.bottom + ball.size.x,
                                     "bottom");

        }
      else if (ny > 0) {
          pt =this.intercept(ball.pos.x, ball.pos.y, ball.pos.x + nx, ball.pos.y + ny, 
                                     rect.left   - ball.size.x, 
                                     rect.top    - ball.size.x, 
                                     rect.right  + ball.size.x, 
                                     rect.top    - ball.size.x,
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
