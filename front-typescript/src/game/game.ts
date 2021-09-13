import { io, Socket } from 'socket.io-client';
import { threadId } from 'worker_threads';


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

class Player extends Rect {
  score: number;
  constructor()
  {
    super(20,100);
    this.score = 8;
  }
}



class Pong {
  _canvas: HTMLCanvasElement;
  _context: CanvasRenderingContext2D | null;
  ball: Ball;
  animation: number;
  players: Player [];
  auth: string;
  socket: Socket;
  id: number;
  game_ended: boolean;
  fn: Function;
  constructor(fn: Function, canvas: HTMLElement, authToken: string, socket: Socket, id: number)
  {
    this._canvas = <HTMLCanvasElement> canvas;
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
    this.fn = fn;
    this.auth = authToken;
    this.players[0].pos.x = 30;
    this.players[1].pos.x = this._canvas.width - 30;
    this.players[0].pos.y = (this._canvas.height - this.players[0].size.y) / 2;
    this.players[1].pos.y = (this._canvas.height - this.players[0].size.y) / 2;
    this.socket = socket;
    let lastTime: number;
    this.id = id;


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
  collide(player: Player, ball: Ball)
  {
    if (player.left < ball.right && player.right > ball.left &&
        player.top < ball.bottom && player.bottom > ball.top)
        {
          ball.vel.x = -ball.vel.x;
          ball.vel.y += 300 * (1 - .5); 
          if (ball.vel.len < 500)
            ball.vel.len *= 1.05;
        }
  }
  end()
  {
    cancelAnimationFrame(this.animation);
  }


  reset(id: number)
  {
    this.ball.pos.x = this._canvas.width / 2;
    this.ball.pos.y = this._canvas.height / 2;
    this.ball.vel.x = 0;
    this.ball.vel.y = 0;
    this.socket.emit('scored', id);
    this.start()

  }


  isGameEnded() : boolean
  {
    return (this.players[0].score >= 10 || this.players[1].score >= 10)
  }

  start()
  {
    if (this.game_ended || this.isGameEnded())
    {
        
        if (this.players[this.id].score >= 10 || this.game_ended)
          this.fn('won', this.auth);
        else
          this.fn('lost', this.auth);
        this.socket.emit('leaveRoom');
        // this.end();
        this.game_ended = true;
        if (this._context !== null)
        {
          this._canvas.style.opacity = '0.5';
        }
    }
    this.socket.on('won', message => {
      this.game_ended = true;
      this.start();
    })
    if (this.ball.vel.x === 0 && this.ball.vel.y === 0) {


      this.socket.emit('launchBall');
      this.socket.on('getBallSpeed', (message: Vec) => {
          console.log(message);
          this.ball.pos = message;
      })
      this.socket.on('changeScore', (message: number[]) => {
        this.players[0].score = message[0];
        this.players[1].score = message[1];
    })
  }
    // if (this.ball.vel.x === 0 && this.ball.vel.y === 0) {
    //   this.ball.vel.x = 300 * (Math.random() > .5 ? 1 : -1);
    //   this.ball.vel.y = 300 * (Math.random() * 2  -1);
    //   this.ball.vel.len = 400;
    // }
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
      if (!this.isGameEnded())
      {
        this._context.fillStyle = 'white';
        this._context.fillRect(this.ball.pos.x, this.ball.pos.y, this.ball.size.x, this.ball.size.y);
      }
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
    this.socket.on('getPosition', (message: number) => {
      let playerId = this.id ? 0 : 1;
      this.players[playerId].pos.y = message;
    })
    this.socket.on('getBallPosition', (msg: Vec) => {
      // console.log(message);
      this.ball.pos.x = msg.x;
      this.ball.pos.y = msg.y;
    })
    
    // this.ball.pos.x += this.ball.vel.x * dt;
    // this.ball.pos.y += this.ball.vel.y * dt;
    this.socket.emit('msgToServer', this.players[this.id].pos.y);
    if (this.game_ended && (this.ball.right <= 0 || this.ball.left >= this._canvas.width))
    {
      this.ball.vel.x = -this.ball.vel.x;
    }
    else if (this.ball.right <= 0 || this.ball.left >= this._canvas.width)
    {
      let playerId = this.ball.vel.x < 0 ? 1 : 0;
      // this.players[playerId].score++;
      this.reset(playerId);
    }
    if (this.ball.top < 0 || this.ball.bottom > this._canvas.height)
      this.ball.vel.y = -this.ball.vel.y;
	  // if (this.ball.top < 0)
		// this.ball.pos.y = 0;
	  // else
		// this.ball.pos.y = this._canvas.height - this.ball.size.y;
    // } 
    // this.players[1].pos.y = this.ball.pos.y;
    this.players.forEach(player => this.collide(player, this.ball));
    this.draw(); 
  }
}

export default Pong;
