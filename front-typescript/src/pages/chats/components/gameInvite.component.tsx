import React from 'react';
import { useHistory } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import { UserPublic } from '../chats.types';


interface gameInviteProps {
    socket: Socket,
    enemy: UserPublic
    ranked: boolean
}

const GameInvite: React.FC<gameInviteProps> = ({socket, enemy, ranked}) => {

    let history = useHistory();
    
    socket.emit('gameInvite', enemy.id);

    socket.on('acceptedInvitation', (roomName)=>{
        history.replace(`/play/duels/${roomName}`)
    });
    const InvitePlayer = () => {
        socket.emit('sendGameInvitation', enemy.id, ranked);
        
    }

    return (
        <div onClick={InvitePlayer}>Invite for a game</div>        
    )
}

export default GameInvite;