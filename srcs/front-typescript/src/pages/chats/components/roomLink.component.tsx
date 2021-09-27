import React from "react";
import { Room } from "../chats.types";
import { Link } from "react-router-dom";
import './roomLink.styles.scss';

interface RoomLinkParams {
  authToken: string,
  room: Room
  onDelete: Function,
  userId: number
}

// Get all open rooms from the backend
async function deleteRoom(authToken: string, roomName: string) {
  // Perform the request to backend
  await fetch(`${process.env.REACT_APP_API_URL}/chat/rooms/${roomName}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });
}

async function leaveRoom(authToken: string, roomID: number, onLeave: Function) {
  // Perform the request to backend
  await fetch(`${process.env.REACT_APP_API_URL}/chat/favs/${roomID}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });
  onLeave();
}

interface DangerButtonProps {
  onClick: React.MouseEventHandler<HTMLButtonElement>
  children: any
}

const DangerButton: React.FC<DangerButtonProps> = ({onClick, children}) => {
  return (
  <button className="cursor-pointer py-2 px-4 hover:bg-red-400 hover:text-white bg-red-300 text-red-600 shadow rounded-lg border-solid border-1 border-red-400 " onClick={onClick}>{children}</button>
  );
}

const RoomLink: React.FC<RoomLinkParams> = ({ authToken, room, onDelete, userId }) => {
  const deleteHandler = () => {
    deleteRoom(authToken, room.name).then(()=>onDelete());
  }

  return (
    <div className="bg-gray-100 bg-opacity-25 flex mb-4 flex-row rounded-lg shadow-lg hover:bg-opacity-50">
      <div className="flex-1 flex flex-row items-center">
        <div className="px-4 py-3 flex-1"><Link to={`/chats/${room.name}`}>{room.name}, owner: {room.owner_name}</Link></div>
        <div className="px-4">{room.ownerID === userId
         ? <DangerButton onClick={deleteHandler}>Delete</DangerButton>
         : <DangerButton onClick={() => {leaveRoom(authToken, room.id, onDelete)}}>Leave</DangerButton>}
         </div>
      </div>
    </div>
  );
}

export default RoomLink;