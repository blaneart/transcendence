import React, { useCallback, useEffect, useState } from "react";
import CreateRoom from './createRoom.component';
import './roomList.styles.scss';
import { Room } from '../chats.types';
import RoomLink from "./roomLink.component";
import DirectList from "../direct/directList.component";

interface RoomListProps {
  authToken: string
  userId: number
}

// Get all open rooms from the backend
async function getRooms(authToken: string): Promise<Room[]> {
  // Perform the request to backend
  const response = await fetch("http://127.0.0.1:3000/chat/rooms", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });
  // Read response as JSON
  const jsonData = await response.json();
  // Cast response to an array of rooms
  return jsonData as Room[];
}


const RoomList: React.FC<RoomListProps> = ({ authToken, userId }) => {

  const [rooms, setRooms] = useState<Room[]>([]);

  // useCallback to prevent infinite state updates
  const refreshRooms = useCallback(() => {
    // Get all rooms from the backend and add them to state
    getRooms(authToken).then(newRooms => {
      setRooms(newRooms);
    });

  }, [authToken]);

  useEffect(() => {
    // On setup, we update the rooms
    refreshRooms();
  }, [refreshRooms]); // We don't really reupdate.

  return (
    <div className="">
      <div className="">
        <h2>Direct messages: </h2>
        <DirectList authToken={authToken} userId={userId} />
      </div>

      <h2 className="mt-10">Rooms: </h2>
      {rooms.map((room) => <RoomLink key={room.id} authToken={authToken} room={room} onDelete={refreshRooms} userId={userId}/>)}
      <CreateRoom authToken={authToken} onCreate={refreshRooms} />
    </div>
  );
}

export default RoomList;