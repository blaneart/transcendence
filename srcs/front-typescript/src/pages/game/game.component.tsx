import React, { useEffect, useState, useRef } from 'react';
import Pong from '../../game/game';
import EndGameMenu from '../../components/end-game-menu/end-game-menu.component';
import './game.styles.scss';
import GameHeader from "./components/game-header/game-header.component";
import { io, Socket } from 'socket.io-client';
import { User, Settings } from "../../App.types";
import { useParams, useHistory } from 'react-router-dom';

const ENDPOINT = process.env.REACT_APP_SOCKET_BASE + ":" + process.env.REACT_APP_PORT_ONE;

export interface IGameProps {
  user?: User | null,
  setUser: React.Dispatch<React.SetStateAction<User | null | undefined>>,
  authToken: string
  gameSettings: Settings
}

interface FrontSettings
{
  maps: number
  powerUps: Boolean
}

const Game: React.FC<IGameProps> = ({user, setUser, authToken, gameSettings}) => {
    const {gameRoomName, userId} = useParams<{ gameRoomName: string, userId: string }>();
    /* result of the game stored in string; can be 'win' 'lost' and 'game' */
    const [isGameEnded, setIsGameEnded] = useState<string>('game');

    /* boolean to manage restart of the game */
    const [restart, setRestart] = useState<Boolean>(true);

    /* boolean state when set true both players connected to server and game can be started */
    const [ready, setReady] = useState<Boolean>(false);

    /* id of the player of this client can be 0 or 1, default on three rendomly set on server */
    const [id, setId] = useState<number>(3);

    const history = useHistory();

    const [frontSettings, setFrontSettings] = useState<FrontSettings>({} as FrontSettings);
    if (!gameRoomName)
    {
      frontSettings.maps = gameSettings.maps;
      frontSettings.powerUps = gameSettings.powerUps;
    }
    else if (gameRoomName && userId !== '-1')
    {
      frontSettings.maps = gameSettings.maps;
      frontSettings.powerUps = gameSettings.powerUps;
    }
    
    /* uid of the game room */
    const [gameId, setGameId] = useState<string>('no id');
    
    const [socket] = useState<Socket>(() => {
      const initialState = io(ENDPOINT,
        {
          auth: {
            token: authToken
          }
        });
        return initialState;
      });
      var ratio = 0.5;
      const canvasElement = document.querySelector('canvas');
      if (canvasElement)
        ratio = canvasElement.width / 800;
      socket.emit('gameSettings', gameSettings);
    /* event listener */

    const [enemyName, setEnemyName] = useState<string>('None');

    const pong = useRef<Pong|null>(null);


    
    /* connection function, called in the beginning and restart to establish connection to server */
    useEffect(() => {
      if (!gameRoomName && user && restart)
      {
        socket.emit('joinRoom', {userName: user.name, userId: user.id, userElo: user.elo, gameSettings: gameSettings});
        setRestart(false);
      }
      else if (gameRoomName && user && restart)
      {
        setRestart(false);
        if (userId === '-1')
        {
          socket.emit('joinRoomInvite', {userName: user.name, userId: user.id, gameSettings: null, gameRoomName: gameRoomName});
        }
        else
        {
          socket.emit('joinRoomInvite', {userName: user.name, userId: user.id, gameSettings: gameSettings, gameRoomName: gameRoomName});
        }
      }
      socket.on('enemyname', (eName) => {
        setEnemyName(eName);
      })
      socket.on('alreadyInAGame', () => {
        alert('Already in a game');
        history.push('/');
      })
      socket.on('setFrontSettings', (map, powerUps) => {
        let tmp = {} as FrontSettings; tmp.maps = map; tmp.powerUps = powerUps;
        setFrontSettings(tmp);
      })
      socket.on('eloChange', (newEloUser) => {
        
        if (user)
        {
          let user_wins = newEloUser > user.elo ? user.wins + 1 : user.wins;
        setUser({
          id: user.id,
          name: user.name,
          id42: user.id42,
          avatar: user.avatar,
          games: user.games + 1,
          elo: newEloUser,
          wins: user_wins,
          realAvatar: user.realAvatar,
          status: user.status,
          owner: user.owner,
          banned: user.banned,
          admin: user.admin,
        });
      }
      })
      socket.on('ready', () => {
        setReady(true);
      })
      socket.on('getId', function(message: number) {
        setId(message);
     });

     socket.on("disconnect", (reason) => {
      // If our socket has disconnected not because we wanted it to
      if (reason !== "io client disconnect") {
        alert("Sorry, we've lost connection to the server :(");
        socket.emit('setOffline');
        history.replace('/');
      }
    })
     socket.on('gameId', function(message: string) {setGameId(message)})
     socket.on('won', function(result: string, authToken: string) {
      socket.emit('leaveRoom');
    })
  }, [restart, user, gameRoomName, userId, gameSettings, socket, setUser, history]);



  /* function that starts the game, destroys game when ended */
  useEffect(() => {
    
    if (pong.current)
    {
      pong.current.end();
    }
    
    function updateGameStats(result: string, authToken: string){
      setIsGameEnded(result);
      socket.emit('setOnline');
      return null;
    }

    function mouseTracker(event: MouseEvent) 
    {
      let old_pos = pong.current!.players[id].pos.y;
      pong.current!.players[id].pos.y = (event.offsetY - (pong.current!.players[id].size.y / 2));
      let d_pos = pong.current!.players[id].pos.y - old_pos;
      socket.emit('playerPos', pong.current!.players[id].pos.y / pong.current!.ratio, d_pos / pong.current!.ratio);
    }
    if (ready)
    {
      let canvas = document.getElementById('forCanvas');
      if (canvas !== null && isGameEnded === 'game')
      {
        canvas.style.opacity = '1';
        pong.current = new Pong(updateGameStats, canvas, authToken, socket, id, {map: frontSettings.maps, powerup: frontSettings.powerUps, sounds: gameSettings.sounds}, ratio);

          canvas.addEventListener('mousemove', mouseTracker);
        //   window.addEventListener('keydown', event => {
        //     if (event.code == 'KeyW')
        //       pong.players[id ? 0 : 1].po             ps.y = pong.players[0].pos.y - 25;
        //     else if (event.code == 'KeyS')
        //       pong.players[id ? 0 : 1].pos.y = pong.players[0].pos.y + 25;
        // });
      return () => {
          socket?.emit('quitGame', pong.current!.players[0].score, pong.current!.players[1].score)
          pong.current!.end();
        }
      }
      else if (canvas)
        canvas.style.opacity = '0.5';
    }
}, [ready, authToken, frontSettings.maps, frontSettings.powerUps, id, ratio, setUser, socket, user, isGameEnded, gameSettings.sounds]);


/* willUnmount game destruction */
useEffect(() => {
  return () => {
    socket?.disconnect();

  }
}, [socket])

    return(
      <div className='game'>
        {
        user ?
        <>
        {
          ready ?
        <>
          <GameHeader playerId = {id} userName={user.name} enemyName={enemyName}/>
          <div className=" w-12/12 border border-white-800 border-solid">
        <canvas  id="forCanvas" width={800*ratio} height={600*ratio}></canvas>
        </div>
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
           setIsGameEnded('game');
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

