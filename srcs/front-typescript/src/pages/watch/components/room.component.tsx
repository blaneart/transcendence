import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import Watcher from './draw-watch';
import GameHeader from '../../game/components/game-header/game-header.component';
import { Link, useHistory, useParams } from 'react-router-dom';
import './end-watch-menu.styles.scss';
import { Settings } from '../../../App.types';

const ENDPOINT = process.env.REACT_APP_BACKEND_BASE + ":" + process.env.REACT_APP_PORT_ONE;

interface IRoomProps{
    authToken: string
}
const Room: React.FC<IRoomProps> = ({authToken}) => {
    const watcher = useRef<Watcher|null>(null);
    // const { from } = location.state;
    const [socket] = useState<Socket>(() => {
        const initialState = io(ENDPOINT,
            {
              auth: {
                token: authToken
              }
            });
            return initialState;
        });
    let history = useHistory();
    const [leftPlayerName, setLeftPlayerName] = useState<string>('leftPlayer');
    const [rightPlayerName, setRightPlayerName] = useState<string>('rightPlayer');
    const [winner, setWinner] = useState<string>('None');
    const [abandonned, setAbandonned] = useState<string>('No');

    const { room } = useParams<{ room: string }>();
    const [settings, setSettings] = useState<Settings>({} as Settings)
    useEffect(()=> {
        socket.on('playersNames', (leftName, rightName) => {
            setLeftPlayerName(leftName);
            setRightPlayerName(rightName);
        })
        socket.on('endGame', (abandonned: string) => {
            setAbandonned(abandonned);
        })
        socket.on('winner', (winner: string) => {
            setWinner(winner)
        })
        socket.on('go404', () => {
            history.push('/watch');
        })
        socket.on('getSettings', (settings: Settings) => {
            setSettings(settings)
        })
        socket.emit('sendSettings', room);
    }, [socket, room, history])
    var ratio = 0.5;
    const canvasElement = document.querySelector('canvas');
    if (canvasElement)
      ratio = canvasElement.width / 800;
    useEffect(() => {


        socket.emit('watchMatch', room);
        let canvas = document.getElementById('forCanvas');
        if (canvas)
            canvas.style.opacity = '1';
        watcher.current = new Watcher(canvas!, socket, {map: settings.maps, powerup: settings.powerUps}, ratio);
        // watcher.start();

    }, [socket, room, settings, ratio])

    useEffect(() => {
        return (() => {
            watcher.current!.end();
            socket.disconnect();
        })
    }, [socket])

    return (
        <div className='game'>
            <GameHeader playerId={0} userName={leftPlayerName} enemyName={rightPlayerName} />

            <h1 className="text-center text-xl">WATCHING</h1>
            <div className=" w-12/12 h-3/6 border border-white-800 border-solid">

            <canvas id="forCanvas" width={800 * ratio} height={600* ratio}></canvas>
            </div>

            <h1 className="text-center text-xl">{room}</h1>

            {winner === 'None' ? (null) :
                (<div className='game end'>
                    <h1 style={{ fontSize: 72 }}>{winner} WON!</h1>
                        {abandonned === 'abandoned' ?
                        (<div>{winner === leftPlayerName ? rightPlayerName : leftPlayerName} has abandonned the Game</div>)
                        : (null)
                    }
                    <div className='element'>
                        <Link to="/">BACK TO THE MENU</Link>
                    </div>
                </div>)}

        </div>
    )
}

export default Room;