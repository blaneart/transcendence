import React, { useEffect, useState } from 'react';
import Pong from '../../game/game';
import EndGameMenu from '../../components/end-game-menu/end-game-menu.component';
import './game.styles.scss';


import { io, Socket } from 'socket.io-client';

const ENDPOINT = "http://127.0.0.1:3002";




// socket?.on('msgToClient', (msg: number) => {
//   // console.log(msg);
// });

interface User {
  id: string;
  name: string;
  avatar: string;
  games: number;
  wins: number;
  twofa: boolean;
  twofaSecret: string;
  realAvatar: boolean;
}


interface IGameProps {
  user?: {
    id: string,
    name: string,
    avatar: string,
    games: number,
    wins: number,
    twofa: boolean,
    twofaSecret: string,
    realAvatar: boolean,
  } | null,
  setUser: React.Dispatch<React.SetStateAction<User | null | undefined>>,
  authToken: string
  socket: Socket
}


const Game: React.FC<IGameProps> = ({user, setUser, authToken, socket}) => {

    const [isGameEnded, setIsGameEnded] = useState<string>('game');
    const [restart, setRestart] = useState<Boolean>(false)
    const [wait, setWait] = useState<Boolean>(true)
    const [id, setId] = useState<number>(3);
    
    // var id = 0;


    useEffect(() => {
      console.log(socket);
      socket?.emit('joinRoom');

  }, [socket]);


  useEffect(() => {

    setIsGameEnded('game')
    socket?.on('getId', function(message: number) {
      setId(message);
   });
    if (id !== 3)
    {

      let canvas = document.getElementById('forCanvas');
      if (canvas)
        canvas.style.opacity = '1';
      if (canvas !== null)
      {
          var pong = new Pong(updateGameStats, canvas, authToken, socket!, id);
          console.log(id)

          canvas.addEventListener('mousemove', event => {
              pong.players[id].pos.y = event.offsetY;
          });
        //   window.addEventListener('keydown', event => {
        //     if (event.code == 'KeyW')
        //       pong.players[id ? 0 : 1].pos.y = pong.players[0].pos.y - 25;
        //     else if (event.code == 'KeyS')
        //       pong.players[id ? 0 : 1].pos.y = pong.players[0].pos.y + 25;
        // });
      //     canvas.addEventListener('click', event => {
      //     pong.start();
      // });
      return () => {
          socket?.emit('quitGame', pong.players[0].score, pong.players[1].score)
          socket?.disconnect();
          pong.end()
          
        }
      }    
    }
}, [id]);





  // socket.on('returnWaitingResponse', function(message: boolean) {
  //   if (message)
  //     setWait(false);
  // });



  const gameStart = () => {

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

// socket.on('won', function(result: string, authToken: string) {
//   updateGameStats('won', authToken);
// })

async function  updateGameStats(result: string, authToken: string){
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
    }
    setIsGameEnded(result);
    return null
  }
  
  const restartGame = () => {
    setRestart(!restart);
  }

    return(
      <div className='game'>
        {
          socket ?
          <canvas id="forCanvas" width={800} height={600}></canvas>
        :
         <h1>CONNECTING</h1>
        }
        {            isGameEnded !== 'game' && <EndGameMenu result={isGameEnded} onClick={restartGame}/>
}
      


      </div>

    );
}

export default Game;