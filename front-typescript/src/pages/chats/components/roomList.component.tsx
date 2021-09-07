import React, { useCallback, useEffect, useState } from "react";
import CreateRoom from './createRoom.component';
import './roomList.styles.scss';
import { Link } from 'react-router-dom';
import { Room } from '../chats.types';

interface RoomListProps {
  authToken: string
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


const RoomList: React.FC<RoomListProps> = ({ authToken }) => {
  
  
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
  }, [rooms, refreshRooms]); // We don't really reupdate.

  return (
    <div>
      <h2>Rooms: </h2>
      {rooms.map((room) => <div key={room.id}><Link to={`/chats/${room.name}`}>{room.name}</Link></div>)}
      <CreateRoom authToken={authToken} onCreate={() => refreshRooms()} />
    </div>
  );
}

export default RoomList;