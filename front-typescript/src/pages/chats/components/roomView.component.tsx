import React from "react";
import { useParams } from "react-router";
import { Room } from '../chats.types';

interface RoomParams {
  authToken: string
};

interface RoomRouteParams {
  roomName: string
}

const RoomView: React.FC<RoomParams> = ({ authToken }) => {

  const { roomName } = useParams<RoomRouteParams>();

  return (
    <div>
      <h2>Room: {roomName}</h2>
    </div>
  );
}

export default RoomView;