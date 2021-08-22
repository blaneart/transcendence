class Vec {
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
  constructor(w,h)
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
  constructor()
  {
    super(10,10);
    this.vel = new Vec();
  }
}

class Player extends Rect {
  constructor()
  {
    super(20,100);
    this.score = 0;
  }
}



class Pong {
  constructor(canvas)
  {
    this._canvas = canvas;
    this._context = this._canvas.getContext('2d');
    this.ball = new Ball();
    this.ball.pos.x = 100;
    this.ball.pos.y = 100;
    this.ball.vel.x = 400;
    this.ball.vel.y = 400;
    this.animation = null;
    this.players = [
      new Player(),
      new Player(),
    ]

    this.players[0].pos.x = 40;
    this.players[1].pos.x = this._canvas.width - 40;
    this.players[0].pos.y = 100;
    let lastTime;

    const callback = (millis) => {
      if (lastTime) {
        this.update((millis - lastTime) / 1000);
      }
      lastTime = millis;
      this.animation = requestAnimationFrame(callback);
  };
    callback();
  }
  collide(player, ball)
  {
    if (player.left < ball.right && player.right > ball.left &&
        player.top < ball.bottom && player.bottom > ball.top)
        {
          ball.vel.x = -ball.vel.x;
          ball.vel.y += 300 * (Math.random() - .5); 
          ball.vel.len *= 1.05;
        }
  }
  end()
  {
    cancelAnimationFrame(this.animation);
  }
  reset()
  {
    this.ball.pos.x = this._canvas.width / 2;
    this.ball.pos.y = this._canvas.height / 2;
    this.ball.vel.x = 0;
    this.ball.vel.y = 0;
  }
  start()
  {
    if (this.ball.vel.x === 0 && this.ball.vel.y === 0) {
      this.ball.vel.x = 300 * (Math.random() > .5 ? 1 : -1);
      this.ball.vel.y = 300 * (Math.random() * 2  -1);
      this.ball.vel.len = 400;

    }
  }
  draw()
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
    
    this._context.fillRect(this.ball.pos.x, this.ball.pos.y, this.ball.size.x, this.ball.size.y);
    this.players.forEach(player => this.drawRect(player));
    this.players.forEach((player, index) => this.drawScore(player.score, index));
  }
  drawScore(scores, index)
  {
    const align = this._canvas.width / 3;

    this._context.fillStyle = "white"; 
    this._context.font = '50px Anton';
    this._context.fillText(scores, align * (index + 1), 100);
  }
  drawRect(rect)
  {
    this._context.fillStyle = "white";
    this._context.fillRect(rect.pos.x, rect.pos.y, 
                            rect.size.x, rect.size.y);

  }
  update(dt) {
    this.ball.pos.x += this.ball.vel.x * dt;
    this.ball.pos.y += this.ball.vel.y * dt;
  
    if (this.ball.left < 0 || this.ball.right > this._canvas.width)
    {
      let playerId = this.ball.vel.x < 0 | 0;
      this.players[playerId].score++;
      this.reset();
    }
    if (this.ball.top < 0 || this.ball.bottom > this._canvas.height)
    {
      this.ball.vel.y = -this.ball.vel.y;
    } 
    console.log('ell');
    // this.players[1].pos.y = this.ball.pos.y;
    this.players.forEach(player => this.collide(player, this.ball));
    this.draw(); 
  }
}

// const canvas = document.getElementById('pong');
// const context = canvas.getContext('2d');
// const pong = new Pong(canvas);






export default Pong;