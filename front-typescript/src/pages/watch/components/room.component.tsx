import {useEffect, useState} from 'react';
import { io, Socket } from 'socket.io-client';
import Watcher from './draw-watch';
import { useLocation, useParams } from 'react-router-dom';
const ENDPOINT = "http://127.0.0.1:3002";


const Room = () => {
    var watcher: Watcher;
    // const { from } = location.state;
    const [socket, setSocket] = useState<Socket>(() => {
        const initialState = io(ENDPOINT);
        return initialState;
      });
    const {room} = useParams<{ room: string }>();
    useEffect(() => {
        // socket.on('')
        socket.emit('watchMatch', room)
        let canvas = document.getElementById('forCanvas');
        watcher = new Watcher(canvas!, socket);

    }, [])
    useEffect(()=> {
        return ( () => {
            watcher.end();
            socket.disconnect();
        })
    }, [])
    return (
        <div>
            <h1>GOOD</h1>
            <canvas id="forCanvas" width={800} height={600}></canvas>
        </div>
    )
}

export default Room;