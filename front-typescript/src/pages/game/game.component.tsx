import React, { useEffect } from 'react';
import Pong from '../../game/game';
import './game.styles.scss';

const Game = () => {

    useEffect(() => {
        let canvas = document.getElementById('forCanvas');
        if (canvas !== null)
        {
            var pong = new Pong(canvas);
            canvas.addEventListener('mousemove', event => {
                pong.players[0].pos.y = event.offsetY;
            });
            canvas.addEventListener('click', event => {
            pong.start();
        });
        return () => {
            pong.end();
        }    
    }
  }, []);

    return(
      <div className='game'>
        <canvas id="forCanvas" width={600} height={400}></canvas>
      </div>
    );
}

export default Game;