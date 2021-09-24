import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import Watcher from './draw-watch';
import GameHeader from '../../game/components/game-header/game-header.component';
import { Link, useParams } from 'react-router-dom';
import './end-watch-menu.styles.scss';

const ENDPOINT = process.env.REACT_APP_BACKEND_BASE + ":" + process.env.REACT_APP_PORT_ONE;

const Room = () => {
    const watcher = useRef<Watcher|null>(null);
    // const { from } = location.state;
    const [socket] = useState<Socket>(() => {
        const initialState = io(ENDPOINT);
        return initialState;
    });
    const [leftPlayerName, setLeftPlayerName] = useState<string>('leftPlayer');
    const [rightPlayerName, setRightPlayerName] = useState<string>('rightPlayer');
    const [winner, setWinner] = useState<string>('None');
    const [abandonned, setAbandonned] = useState<string>('No');

    const { room } = useParams<{ room: string }>();

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
    }, [socket])

    useEffect(() => {
        socket.emit('watchMatch', room);
        let canvas = document.getElementById('forCanvas');
        if (canvas)
            canvas.style.opacity = '1';
        watcher.current = new Watcher(canvas!, socket);
        // watcher.start();

    }, [socket, room])

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

            <canvas id="forCanvas" width={800} height={600}></canvas>
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