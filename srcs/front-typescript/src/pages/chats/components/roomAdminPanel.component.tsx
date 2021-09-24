import React from "react";
import { Socket } from "socket.io-client";
import { Room } from "../chats.types";
import Admins from "./admins.component";
import StyledButton from "./styledButton.component";

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
    while (!pass && pass !== null) {
      pass = window.prompt("Please enter the password to lock the room", undefined);
    }
    // Emit an event for the backend
    if (pass !== null)
      socket.emit('restrictRoom', { roomName: room.name, password: pass });
  }

  // Emit an event to make the room password-protected
  const handleUnrestrict = () => {
    // Emit an event for the backend
    socket.emit('unrestrictRoom', room.name);
  }

  return (
    <div className="border bg-gray-900 text-gray-300 border-gray-600 rounded-l-lg border-solid md:border-r-0 px-4 py-4">
      <h3 className="mt-2 text-xxl">Options</h3>
      <p className="text-sm font-normal">You are the owner of this room</p>
      <div className="flex flex-row">
        <div className="px-2">
          <StyledButton onClick={handleDelete}>Delete room</StyledButton>
        </div>
        <div>
          <StyledButton onClick={handleRestrict}>{room.restricted ? "Change room password" : "Make room private"}</StyledButton>
        </div>
      </div>
      {
          room.restricted ?
          <div className="flex flex-row">
            <div className="px-2 py-2 flex-1">
              <StyledButton onClick={handleUnrestrict}>Make room public</StyledButton>
            </div>
          </div>
            : null
        }


      <Admins authToken={authToken} room={room} socket={socket} />
    </div>
  );
}

export default RoomAdminPanel;