import React, { useEffect, useState } from 'react';
import Pong from '../../game/game';
import EndGameMenu from '../../components/end-game-menu/end-game-menu.component';

import '../../components/difficulty-lvl/difficulty-lvl.scss'
import './game.styles.scss';

interface User {
  id: string;
  name: string;
  id42: number;
  avatar: string;
  games: number;
  wins: number;
  twofa: boolean;
  twofaSecret: string;
  realAvatar: boolean
}


interface IGameProps {
  user?: {
    id: string,
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
  difficultyLvl: number
}


const Game: React.FC<IGameProps> = ({user, setUser, authToken, difficultyLvl}) => {

    const [isGameEnded, setIsGameEnded] = useState<string>('game');
    const [restart, setRestart] = useState<Boolean>(false)

    useEffect(() => {
		DifficultyGame();
        setIsGameEnded('game')
        let canvas = document.getElementById('forCanvas');
        if (canvas)
          canvas.style.opacity = '1';
        if (canvas !== null)
        {
            var pong = new Pong(updateGameStats, canvas, authToken, difficultyLvl);
            canvas.addEventListener('mousemove', event => {
                pong.players[0].pos.y = event.offsetY;
            });
            canvas.addEventListener('click', event => {
				difficultyLvl = difficultyLvl - 1;
				if (difficultyLvl == 0)
					difficultyLvl = 7;
				pong.changedifficulty(difficultyLvl)
				pong.start();
        });
        return () => {
            pong.end();
        }    
    }
  }, [restart]);

function	DifficultyGame()
{
	return (
		<div
			className='difficulty-item'
			onClick={() => {difficultyLvl = 1;}}>
			<h1>11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111</h1>
    	</div>		
	)
}

  const changeGameState = (user: User, result: string) => {
    return {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      games: user.games + 1 ,
      wins: result === 'won' ? user.wins + 1 : user.wins,
      twofa: user.twofa,
      twofaSecret: user.twofaSecret,
      realAvatar: user.realAvatar
    }
  }

async function  updateGameStats(result: string, authToken: string) {
    if (user)
    {
      var data = {
        games: user.games + 1,
        wins: result === 'won' ? user.wins + 1 : user.wins,
      }
      const response = await fetch('http://127.0.0.1:3000/account/setGames', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(data),
      });
      const jsonData = await response.json();
      const userUpdate = jsonData as User;
    
      setUser(userUpdate);
      localStorage.setItem("pongUser", JSON.stringify(userUpdate));
    }
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

export default Game;