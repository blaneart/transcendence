import { Socket } from 'socket.io-client';

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

class Watcher
{  
    animation: number;
    _canvas: HTMLCanvasElement;
    _context: CanvasRenderingContext2D | null;
    players: Player [];
    ball: Ball;
    socket: Socket;
    constructor(canvas: HTMLElement, socket: Socket)
    {
        this._canvas = canvas as HTMLCanvasElement;
        this._context = this._canvas.getContext('2d');
        let lastTime: number;
        this.animation = 0;
        this.players = [
          new Player(),
          new Player(),
        ]
        this.ball = new Ball();
        this.ball.pos.x = this._canvas.width / 2;
        this.ball.pos.y = this._canvas.height / 2;
        this.players[0].pos.x = 30;
        this.players[1].pos.x = this._canvas.width - 30;
        this.players[0].pos.y = (this._canvas.height - this.players[0].size.y) / 2;
        this.players[1].pos.y = (this._canvas.height - this.players[0].size.y) / 2;
        this.ball.vel.x = 0;
        this.ball.vel.y = 0;
        this.socket = socket;
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

    start()
    {
      this.socket.on('changeScore', (message: number[]) => {
        this.players[0].score = message[0];
        this.players[1].score = message[1];
        this.draw();
      })
      this.socket.on('endGame', () => {
        if (this._context !== null)
        {
          this._canvas.style.opacity = '0.5';
        }

      })
      this.socket.on('getBallPosition', (position: Vec) => {
        this.ball.pos = position;

        this.draw();
      })
      this.socket.on('getPosition', (position: number, id) => {
        this.players[id].pos.y = position;
      })
    }
    end()
   {
       cancelAnimationFrame(this.animation);
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

export default Watcher;