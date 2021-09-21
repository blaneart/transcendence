import React, { useEffect, useState } from 'react';
import Pong from '../../game/game';
import EndGameMenu from '../../components/end-game-menu/end-game-menu.component';
import './game.styles.scss';
import GameHeader from "./components/game-header/game-header.component";
import { io, Socket } from 'socket.io-client';
import { User, Settings } from "../../App.types";

const ENDPOINT = "ws://127.0.0.1:3002";

export interface IGameProps {
  user?: User | null,
  setUser: React.Dispatch<React.SetStateAction<User | null | undefined>>,
  authToken: string
  gameSettings: Settings
}





const Game: React.FC<IGameProps> = ({user, setUser, authToken, gameSettings}) => {
    console.log('game_component');

    /* result of the game stored in string; can be 'win' 'lost' and 'game' */
    const [isGameEnded, setIsGameEnded] = useState<string>('game');

    /* boolean to manage restart of the game */
    const [restart, setRestart] = useState<Boolean>(true);

    /* boolean state when set true both players connected to server and game can be started */
    const [ready, setReady] = useState<Boolean>(false);

    /* id of the player of this client can be 0 or 1, default on three rendomly set on server */
    const [id, setId] = useState<number>(3);

    /* uid of the game room */
    const [gameId, setGameId] = useState<string>('no id');

    const [socket, setSocket] = useState<Socket>(() => {
      const initialState = io(ENDPOINT,
          {
            auth: {
              token: authToken
            }
          });
      return initialState;
    });
    var ratio = 0.5;


    /* event listener */
    var mouse;

    const [enemyName, setEnemyName] = useState<string>('None');

    var pong: Pong | null = null;


    /* connection function, called in the beginning and restart to establish connection to server */
    useEffect(() => {
      console.log(socket);
      console.log(user)
      if (user && restart)
      {
        socket.emit('joinRoom', user.name, user.id, user.elo, gameSettings);
        setRestart(false);
      }
      socket.on('enemyname', (eName) => {
        setEnemyName(eName);
      })

      socket.on('ready', () => {
        setReady(true);
      })
      socket.on('getId', function(message: number) {
        console.log(message);
        setId(message);
     });
     socket.on('gameId', function(message: string) {setGameId(message)})
     socket.on('won', function(result: string, authToken: string) {
      socket.emit('leaveRoom');
    })
  }, [restart, user]);



  /* function that starts the game, destroys game when ended */
  useEffect(() => {
    
    if (pong)
    {
      pong.end();
      setIsGameEnded('game');
    }
    
    async function updateGameStats(result: string, authToken: string){
      if (user)
      {
        var data = {
          value: user.id,
        }
        const response = await fetch('http://127.0.0.1:3000/userById', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(data),
        });
        const jsonData = await response.json();
        const userUpdate = jsonData as User;
        document.getElementById('forCanvas')?.removeEventListener('mousemove', mouseTracker);
        setUser(userUpdate);
      }

      setIsGameEnded(result);
      return null;
    }

    function mouseTracker(event: MouseEvent) 
    {
      let old_pos = pong!.players[id].pos.y;
      pong!.players[id].pos.y = (event.offsetY - (pong!.players[id].size.y / 2));
      let d_pos = pong!.players[id].pos.y - old_pos;
      socket.emit('playerPos', pong!.players[id].pos.y / pong!.ratio, d_pos / pong!.ratio);
    }
    setIsGameEnded('game')
    if (ready)
    {
      let canvas = document.getElementById('forCanvas');
      if (canvas)
        canvas.style.opacity = '1';
      if (canvas !== null)
      {
          pong = new Pong(updateGameStats, canvas, authToken, socket, id, {map: 1, powerup: true}, ratio);
          console.log(id)

          canvas.addEventListener('mousemove', mouseTracker);
        //   window.addEventListener('keydown', event => {
        //     if (event.code == 'KeyW')
        //       pong.players[id ? 0 : 1].po             ps.y = pong.players[0].pos.y - 25;
        //     else if (event.code == 'KeyS')
        //       pong.players[id ? 0 : 1].pos.y = pong.players[0].pos.y + 25;
        // });
      return () => {
          socket?.emit('quitGame', pong!.players[0].score, pong!.players[1].score)
          pong!.end();
        }
      }
    }
}, [ready]);


/* willUnmount game destruction */
useEffect(() => {
  return () => {
    socket?.disconnect();
  }
}, [])

    return(
      <div className='game'>
        {
        user ?
        <>
        {
          ready ?
        <>
          <GameHeader playerId = {id} userName={user.name} enemyName={enemyName}/>
        <canvas id="forCanvas" width={800*ratio} height={600*ratio}></canvas>
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
           setRestart(true)
           socket.emit('leaveRoom');
        }
        }/> 
        }
      </>
        :
        <h1>SIGN IN TO PLAY</h1>
      }
      </div>

    );
}

export default Game;

