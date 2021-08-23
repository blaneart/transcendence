import React, { useEffect, useState } from 'react';
import Pong from '../../game/game';
import EndGameMenu from '../../components/end-game-menu/end-game-menu.component';


import './game.styles.scss';


interface IGameProps {
  user: {
    id: string,
    name: string,
    avatar: string,
    games: number,
    wins: number
  } | null
}
const Game: React.FC<IGameProps> = ({user}) => {

    const [isGameEnded, setIsGameEnded] = useState<string>('game');
    const [restart, setRestart] = useState<Boolean>(false)
    useEffect(() => {
        setIsGameEnded('game')
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

  const changeGameState = (result: string) => {
    if (user)
    {
      user.games += 1;
      if (result === 'won')
        user.wins += 1;
    }
      setIsGameEnded(result);

  }
  const restartGame = () => {
    setRestart(!restart);
  }

    return(
      <div className='game'>
        <canvas id="forCanvas" width={800} height={600}></canvas>
        { isGameEnded !== 'game' && <EndGameMenu result={isGameEnded} onClick={restartGame}/>
        }
      </div>
    );
}

export default Game;