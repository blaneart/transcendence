import React from 'react';
import { useHistory } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import { UserPublic } from '../chats.types';
import { Settings } from "../../../App.types";


interface gameInviteProps {
    socket: Socket,
    enemy: UserPublic
    ranked: boolean
    gameSettings: Settings
}

const GameInvite: React.FC<gameInviteProps> = ({ socket, enemy }) => {

    let history = useHistory();

    let meIn = -1;
    socket.on('acceptedInvitation', (roomName)=>{
        history.replace(`/play/${roomName}/${meIn}`)
    });
    const InvitePlayer = () => {
        socket.emit('sendGameInvitation', enemy.id);
    }

    return (
        <div onClick={InvitePlayer}>Invite for a game</div>        
    )
}

export default GameInvite;