import React, { useEffect, useState } from 'react';
import Pong from '../../game/game';
import EndGameMenu from '../../components/end-game-menu/end-game-menu.component';
import './game.styles.scss';
import GameHeader from "./components/game-header/game-header.component";
import { io, Socket } from 'socket.io-client';

const ENDPOINT = "http://127.0.0.1:3002";


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
  authToken: string
}

function restartGame(setReady: Function, setRestart: Function, restart: boolean, socket: Socket)
{
  setReady(false);
  socket.emit('leaveRoom')
  setRestart(!restart);
}

const Game: React.FC<IGameProps> = ({user, setUser, authToken}) => {
    console.log('game_component');
    const [isGameEnded, setIsGameEnded] = useState<string>('game');
    const [updateStats, setUpdateStats] = useState<boolean>(false);
    const [restart, setRestart] = useState<Boolean>(false);
    const [ready, setReady] = useState<Boolean>(false);
    const [id, setId] = useState<number>(3);
    const [gameId, setGameId] = useState<string>('no id');

    const [socket, setSocket] = useState<Socket>(() => {
      const initialState = io(ENDPOINT);
      return initialState;
    });

    var pong: Pong | null = null;
    useEffect(() => {
      console.log(socket);
      socket.emit('joinRoom');
      socket.on('ready', () => {
        setReady(true);
      })
      socket.on('getId', function(message: number) {
        console.log(message);
        setId(message);
     });
     socket.on('gameId', function(message: string) {setGameId(message)})
     socket.on('won', function(result: string, authToken: string) {
      setUpdateStats(true);
      socket.emit('leaveRoom');
    })
  }, [restart]);


  useEffect(() => {
    
    if (pong)
    {
      pong.end();
      setIsGameEnded('game');
    }
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
      return null;
    }

    setIsGameEnded('game')
    if (ready)
    {
      let canvas = document.getElementById('forCanvas');
      if (canvas)
        canvas.style.opacity = '1';
      if (canvas !== null)
      {
          pong = new Pong(updateGameStats, canvas, authToken, socket, id);
          console.log(id)

          canvas.addEventListener('mousemove', event => {
              pong!.players[id].pos.y = event.offsetY;
          });
          socket.emit('subscribe');
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
          socket?.emit('quitGame', pong!.players[0].score, pong!.players[1].score)
          // socket?.disconnect();
          pong!.end();
        }
      }
    }
}, [ready]);

useEffect(() => {
  return () => {
    socket?.disconnect();
  }
}, [])

useEffect(() => {
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
      localStorage.setItem("pongUser", JSON.stringify(userUpdate));
    }
    setIsGameEnded(result);
    return null;
  }
  if (updateStats)
    updateGameStats('won', authToken);

}, [updateStats])


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

    return(
      <div className='game'>
        {
        user ?
        <>
        {
          ready ?
        <>
          <GameHeader playerId = {id} userName={user!.name} enemyName="enemy"/>
        <canvas id="forCanvas" width={800} height={600}></canvas>
        <h1>{gameId}</h1>
        </>
        :
        <>
         <h1>Waiting for opponent...</h1>
         <div className="lds-hourglass"><div></div><div></div></div>
         </>
        }
        {            isGameEnded !== 'game' && <EndGameMenu result={isGameEnded} onClick={() =>
         {
           setReady(false);
           setRestart(!restart)
           socket.emit('leaveRoom');
        }
        }/> } 
      </>
        :
        <h1>SIGN IN TO PLAY</h1>
      }
      </div>

    );
}

export default Game;