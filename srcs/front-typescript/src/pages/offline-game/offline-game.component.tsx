import React, { useEffect, useState } from 'react';
import Offline_Pong from '../../offline-game/offline-game';
import EndGameMenu from '../../components/end-game-menu/end-game-menu.component';

import '../../components/difficulty-lvl/difficulty-lvl.scss'
import './offline-game.styles.scss';

interface IGameProps {

  authToken: string,
  difficultyLvl: any,
  map: any
}


const OfflineGame: React.FC<IGameProps> = ({authToken, difficultyLvl, map}) => {

    const [isGameEnded, setIsGameEnded] = useState<string>('game');
    const [restart, setRestart] = useState<Boolean>(false)

    useEffect(() => {
      setIsGameEnded('game')
      let canvas = document.getElementById('forCanvas');
      if (canvas)
        canvas.style.opacity = '1';
      if (canvas !== null)
      {
        var pong = new Offline_Pong(updateGameStats, canvas, authToken, difficultyLvl, map, 1);
        canvas.addEventListener('mousemove', event => {
            pong.players[0].pos.y = event.offsetY - pong.players[0].size.y / 2;
        });
        canvas.addEventListener('click', event => {
          pong.start();
        });
        return () => {
          pong.end();
        }
      }
  }, [restart, authToken, difficultyLvl, map]);

async function  updateGameStats(result: string, authToken: string) {
    setIsGameEnded(result);
    return null
}

  const restartGame = () => {
    setRestart(!restart);
  }

    return (
      <div className='gameoffline'>
        <div id="custom-border" className="w-12/12 border border-white-800 border-solid border-custom">
          <canvas id="forCanvas" width={800} height={600}></canvas>
          { isGameEnded !== 'game' && <EndGameMenu result={isGameEnded} onClick={restartGame}/>
          }
        </div>
      </div>
    );
}

export default OfflineGame;