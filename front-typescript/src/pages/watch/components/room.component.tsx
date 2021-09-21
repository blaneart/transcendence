import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import Watcher from './draw-watch';
import GameHeader from '../../game/components/game-header/game-header.component';
import { Link, useParams } from 'react-router-dom';
import './end-watch-menu.styles.scss';

const ENDPOINT = "http://127.0.0.1:3002";

const Room = () => {
    var watcher: Watcher;
    // const { from } = location.state;
    const [socket, setSocket] = useState<Socket>(() => {
        const initialState = io(ENDPOINT);
        return initialState;
    });
    const [leftPlayerName, setLeftPlayerName] = useState<string>('leftPlayer');
    const [rightPlayerName, setRightPlayerName] = useState<string>('rightPlayer');
    const [winner, setWinner] = useState<string>('None');
    const [abandonned, setAbandonned] = useState<string>('No');

    const { room } = useParams<{ room: string }>();

    useEffect(() => {

        socket.on('playersNames', (leftName, rightName) => {
            setLeftPlayerName(leftName);
            setRightPlayerName(rightName);
            console.log('leftPlayerName', leftPlayerName);
            console.log('new leftPlayerName', leftName);
            console.log('rightPlayerName', rightPlayerName);
            console.log('new rightPlayerName', rightName);
        })
        socket.on('endGame', (abandonned: string) => {
            setAbandonned(abandonned);
        })
        socket.on('winner', (winner: string) => {
            setWinner(winner)
        })
        console.log('room =', room);
        socket.emit('watchMatch', room);
        let canvas = document.getElementById('forCanvas');
        if (canvas)
            canvas.style.opacity = '1';
        watcher = new Watcher(canvas!, socket);
        // watcher.start();

    }, [])
    useEffect(() => {
        return (() => {
            watcher.end();
            socket.disconnect();
        })
    }, [])

    return (
        <div className='game'>
            <GameHeader playerId={0} userName={leftPlayerName} enemyName={rightPlayerName} />

            <h1>WATCHING</h1>

            <canvas id="forCanvas" width={800} height={600}></canvas>
            <h1>{room}</h1>

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