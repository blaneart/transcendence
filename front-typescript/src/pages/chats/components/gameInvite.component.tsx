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

const GameInvite: React.FC<gameInviteProps> = ({ socket, enemy, ranked, gameSettings }) => {

    let history = useHistory();
    
    socket.emit('gameInvite', enemy.id);

    socket.on('acceptedInvitation', (roomName)=>{
        history.replace(`/play/duels/${roomName}`)
    });
    const InvitePlayer = () => {
        socket.emit('sendGameInvitation', enemy.id, ranked, gameSettings);
    }

    return (
        <div onClick={InvitePlayer}>Invite for a game</div>        
    )
}

export default GameInvite;