import React, { useEffect, useState } from 'react';
import Pong from '../../game/game';
import EndGameMenu from '../../components/end-game-menu/end-game-menu.component';


import './game.styles.scss';

const Game = () => {
    const [isGameEnded, setIsGameEnded] = useState<Boolean>(false);
    const [restart, setRestart] = useState<Boolean>(false)
    useEffect(() => {
        setIsGameEnded(false)
        let canvas = document.getElementById('forCanvas');
        if (canvas)
          canvas.style.opacity = '1';
        if (canvas !== null)
        {
            var pong = new Pong(changeGameState, canvas);
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
  }, [restart]);

  const changeGameState = () => {
    setIsGameEnded(true);
  }
  const restartGame = () => {
    setRestart(!restart);
  }
    return(
      <div className='game'>
        <canvas id="forCanvas" width={800} height={600}></canvas>
        { isGameEnded  && <EndGameMenu onClick={restartGame}/>
        }
      </div>
    );
}

export default Game;