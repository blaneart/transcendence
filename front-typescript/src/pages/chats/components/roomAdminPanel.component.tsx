import React from "react";
import { Socket } from "socket.io-client";
import { Room } from "../chats.types";

interface RoomAdminPanelParams {
  authToken: string,
  room: Room,
  userId: number,
  socket: Socket,
};


const RoomAdminPanel: React.FC<RoomAdminPanelParams> = ({ authToken, room, userId, socket }) => {
  
  const handleDelete = () => {
    socket.emit('deleteRoom', room.name);
  }

  return (
    <div>
      <p>You are the owner of this room</p>
      <button onClick={handleDelete}>Delete room</button>
    </div>
  );
}

export default RoomAdminPanel;