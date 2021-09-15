import React, { useEffect, useState } from 'react';
import Offline_Pong from '../../offline-game/offline-game';
import EndGameMenu from '../../components/end-game-menu/end-game-menu.component';

import '../../components/difficulty-lvl/difficulty-lvl.scss'
import './offline-game.styles.scss';

interface User {
  id: number;
  name: string;
  id42: number;
  avatar: string;
  games: number;
  wins: number;
  twofa: boolean;
  twofaSecret: string;
  realAvatar: boolean
  status: number;
}


interface IGameProps {
  user?: {
    id: number,
    name: string,
    id42: number,
    avatar: string,
    games: number,
    wins: number,
    twofa: boolean,
    twofaSecret: string,
    realAvatar: boolean,
  } | null,
  setUser: React.Dispatch<React.SetStateAction<User | null | undefined>>,
  authToken: string,
  difficultyLvl: any,
  map: any
}


const OfflineGame: React.FC<IGameProps> = ({user, setUser, authToken, difficultyLvl, map}) => {

    const [isGameEnded, setIsGameEnded] = useState<string>('game');
    const [restart, setRestart] = useState<Boolean>(false)

    console.log("in offlinegame", map);
    useEffect(() => {
        setIsGameEnded('game')
        let canvas = document.getElementById('forCanvas');
        if (canvas)
          canvas.style.opacity = '1';
        if (canvas !== null)
        {
            var pong = new Offline_Pong(updateGameStats, canvas, authToken, difficultyLvl, map);
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
  }, [restart]);

async function  updateGameStats(result: string, authToken: string) {
    setIsGameEnded(result);
    return null
}

  const restartGame = () => {
    setRestart(!restart);
  }

    return (
      <div className='game'>
        <canvas id="forCanvas" width={800} height={600}></canvas>
        { isGameEnded !== 'game' && <EndGameMenu result={isGameEnded} onClick={restartGame}/>
        }
      </div>
    );
}

export default OfflineGame;