import { Component } from 'react';
import Pong from '../../game/game';
import './game.styles.scss';

// var Ball = {
//   position_x: 50,
//   position_y: 50,
//   vel_x: 0.5,
//   vel_y: 0.5

// }
// class Peddle {
//   constructor(x, y) {
//     this.position_x = x;
//     this.position_y = y;
//     this.size = [10, 50];
//   }

// }
// let ball = Ball;
// let peddleOne = new Peddle(10, 50);
// let peddleTwo  = new Peddle(580, 150);
// let ctx = null;

// class Pong {
//   constructor() 
//   {
//     // score_1: 0,
//     // score_2: 0
//   }
// }
class Game extends Component {

  constructor()
  {
    super();
    this.state = {
      pong: null
    }
  }
  componentDidMount() {
    let canvas = document.getElementById('forCanvas');
    this.state.pong = new Pong(canvas);
    console.log(this.state.animation);
    canvas.addEventListener('mousemove', event => {
      this.state.pong.players[0].pos.y = event.offsetY;
    });
    canvas.addEventListener('click', event => {
      this.state.pong.start();
    });
  }
  componentWillUnmount() {
   this.state.pong.end();
  }
  render() {
    console.log('render');
    return(
      <div className='game'>
        <canvas id="forCanvas" width={600} height={400}></canvas>
      </div>
    );
  }
}

export default Game;