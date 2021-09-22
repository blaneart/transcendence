import React, { useCallback, useEffect, useState } from "react";
import CreateRoom from './createRoom.component';
import './roomList.styles.scss';
import { Room } from '../chats.types';
import RoomLink from "./roomLink.component";
import DirectList from "../direct/directList.component";
import { Settings } from "../../../App.types";

interface RoomListProps {
  authToken: string
  userId: number
  gameSettings: Settings
}

// Get all open rooms from the backend
async function getRooms(authToken: string): Promise<Room[] | null> {
  // Perform the request to backend
  const response = await fetch("http://127.0.0.1:3000/chat/rooms", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });
  if (!response.ok)
    return null;
  // Read response as JSON
  const jsonData = await response.json();
  // Cast response to an array of rooms
  return jsonData as Room[];
}

async function addRoom(authToken: string, roomID: number, onAdd: Function) {
  // Perform the request to backend
  await fetch(`http://127.0.0.1:3000/chat/favs/${roomID}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });
  onAdd();
}

const RoomList: React.FC<RoomListProps> = ({ authToken, userId }) => {

  const [rooms, setRooms] = useState<Room[]>([]);

  // useCallback to prevent infinite state updates
  const refreshRooms = useCallback(() => {
    // Get all rooms from the backend and add them to state
    getRooms(authToken).then(newRooms => {
      if (newRooms !== null)
        setRooms(newRooms);
    });

  }, [authToken]);

  useEffect(() => {
    // On setup, we update the rooms
    refreshRooms();
  }, [refreshRooms]); // We don't really reupdate.

  return (
    <div className="flex flex-row px-4">
      <div className="flex-1">
        <h2>Direct messages: </h2>
        <DirectList authToken={authToken} userId={userId} />
      </div>

      <div className="px-4 flex-1">
        <h2>My rooms</h2>
        {rooms.map((room) => room.fav ?
          <div className="">
            <RoomLink key={room.id} authToken={authToken} room={room} onDelete={refreshRooms} userId={userId} />
          </div>
          : null)}
        <h2 className="mb-2">Rooms: </h2>
        <p className="text-sm mt-1">Click to join </p>
        {rooms.map((room) => room.fav 
        ? null
        : <div onClick={() => addRoom(authToken, room.id, refreshRooms)} className="bg-gray-400 bg-opacity-25 shadow-lg rounded-lg hover:bg-opacity-50">
          <p className="px-4 py-3">{room.name}</p>
        </div>)}
        <CreateRoom authToken={authToken} onCreate={refreshRooms} />
      </div>
    </div>
  );
}

export default RoomList;