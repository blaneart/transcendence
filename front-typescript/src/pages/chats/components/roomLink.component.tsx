import React from "react";
import { Room } from "../chats.types";
import { Link } from "react-router-dom";
import './roomLink.styles.scss';
import StyledButton from "./styledButton.component";

interface RoomLinkParams {
  authToken: string,
  room: Room
  onDelete: Function,
  userId: number
}

// Get all open rooms from the backend
async function deleteRoom(authToken: string, roomName: string) {
  // Perform the request to backend
  await fetch(`http://127.0.0.1:3000/chat/rooms/${roomName}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });
}


const RoomLink: React.FC<RoomLinkParams> = ({ authToken, room, onDelete, userId }) => {
  const deleteHandler = () => {
    deleteRoom(authToken, room.name).then(()=>onDelete());
  }

  return (
    <div className="flex flex-row">
      <Link to={`/chats/${room.name}`}>{room.name}, owner: {room.owner_name}</Link>
      <div className="px-4 ">{room.ownerID === userId ? <StyledButton onClick={deleteHandler}>Delete</StyledButton> : null}</div>
    </div>
  );
}

export default RoomLink;