import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';


const DuelGame = ({}) => {
    const [socket, setSocket] = useState<Socket>(() => {
        const initialState = io('ws://127.0.0.1:3002');
        return initialState;
      });
    const {room} = useParams<{ room: string }>();

    return (
        <div>
            
        </div>
    );
}

export default DuelGame;