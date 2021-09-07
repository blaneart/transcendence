import React from "react";
import { Room } from "../chats.types";
import { Link } from "react-router-dom";
import './roomLink.styles.scss';

interface RoomLinkParams {
  authToken: string,
  room: Room
}

const RoomLink: React.FC<RoomLinkParams> = ({ authToken, room }) => {
  return (
    <div>
      <Link to={`/chats/${room.name}`}>{room.name}, owner: {room.owner_name}</Link>
      <button>Delete</button>
    </div>
  );
}

export default RoomLink;