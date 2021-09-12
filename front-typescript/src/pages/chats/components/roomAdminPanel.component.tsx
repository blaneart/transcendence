import React from "react";
import { Socket } from "socket.io-client";
import { Room } from "../chats.types";
import Admins from "./admins.component";

interface RoomAdminPanelParams {
  authToken: string,
  room: Room,
  userId: number,
  socket: Socket,
};

const RoomAdminPanel: React.FC<RoomAdminPanelParams> = ({ authToken, room, userId, socket }) => {

  // Emit an event to delete the room
  const handleDelete = () => {
    socket.emit('deleteRoom', room.name);
  }

  // Emit an event to make the room password-protected
  const handleRestrict = () => {

    // Ask the user for the future password
    let pass = undefined;
    while (!pass)
    {
      pass = window.prompt("Please enter the password to lock the room", undefined);
    }

    // Emit an event for the backend
    socket.emit('restrictRoom', {roomName: room.name, password: pass});
  }

  return (
    <div className="border border-white border-solid md:border-r-0 px-4 py-4">
      <h3 className="mt-2 text-xxl">Options</h3>
      <p className="text-sm font-normal">You are the owner of this room</p>
      <button className="ml-0" onClick={handleDelete}>Delete room</button>
      <button onClick={handleRestrict}>{room.restricted ? "Change room password" : "Make room private"}</button>

      <Admins authToken={authToken} room={room} socket={socket}/>
    </div>
  );
}

export default RoomAdminPanel;