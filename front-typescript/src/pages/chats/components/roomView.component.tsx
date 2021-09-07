import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { io, Socket } from "socket.io-client";
import Composer from "./composer.component";
import { useHistory } from 'react-router-dom';
import RoomAdminPanel from "./roomAdminPanel.component";
import { Room, MessageType } from "../chats.types";
import Message from "./message.component";

// We require a token passed as parameter
interface RoomParams {
  authToken: string
  userId: number
};

// The parameters we expect in the URL.
interface RoomRouteParams {
  roomName: string
}

// The data we get in the blocklist
interface BlockedUserEntry {
  blockedID: number
}

// Get the current room instance
async function getRoom(authToken:string, roomName: string)
{
  // Send the request to the backend
  const response = await fetch(
    `http://127.0.0.1:3000/chat/rooms/${roomName}/`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });
  return await response.json() as Room;
}

// Get the list of all blocked users
async function getBlockList(authToken: string): Promise<BlockedUserEntry[]>
{
  // Send a request to backend
  const response = await fetch(
    `http://127.0.0.1:3000/chat/block/`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });
  return await response.json() as BlockedUserEntry[];
}

const RoomView: React.FC<RoomParams> = ({ authToken, userId }) => {

  const { roomName } = useParams<RoomRouteParams>();
  const [ socket ] = useState<Socket>(() => io("ws://127.0.0.1:8080", {
    auth: {
      token: authToken
    }
  }));
  const [messages, setMessages] = useState<MessageType[]>();
  const [blockList, setBlockList] = useState<Map<number, boolean>>(new Map<number,boolean>());
  const [room, setRoom] = useState<Room>();
  let history = useHistory();

  useEffect(() => {
    // Get the current room instance
    getRoom(authToken, roomName).then((room)=>setRoom(room));

    // Get all the blocked users
    getBlockList(authToken).then((users) => {

      // Mutate the block list
      setBlockList((oldBlockList) => {

        // For each user, add their ID to the map
        users.map((user) => {
          oldBlockList.set(user.blockedID, true);
        });

        // Replace the old blocklist state
        return oldBlockList;
      });
    });

    // Handle the messages that were sent before we joined
    socket.on("initialMessages", (msg) => {
      // Receive an array of messages
      const newMessages = msg as MessageType[];
      // Right now, we sort them on front, maybe we should also sort them on back
      newMessages.sort((a,b) => a.id - b.id);
      // Set the state directly
      setMessages(newMessages);
    });

    // Once someone sends a message, we receive this event
    socket.on("newMessage", (msg) => {
      const newMessage = msg as MessageType; // we receive a single update
      setMessages((oldMessages) => {
        if (oldMessages)
        {
          // Add the new one to the end
          return [...oldMessages, newMessage];
        }
        // If this is the first message, we have to set the state to an array
        return [newMessage];
      });
    });

    // When we get kicked out of the room, we have to return to the chat screen.
    socket.on("kickedOut", ()=> {
      alert("You were kicked out of this room");
      socket.disconnect();
      history.replace("/chats/");
    })

    // When the backend asks us for password
    socket.on("loginRequest", () => {

      // Get the password from the user
      let pass = undefined;
      while (!pass)
      {
        pass = window.prompt("Please type in your password", undefined);
      }
      // Send the event to backend
      socket.emit("login", {roomName: roomName, password: pass});
    })

    // Ask to add us to this room and send us the initial messages.
    socket.emit("requestJoin", roomName);

    // On window/tab close, disconnect socket
    window.addEventListener('beforeunload', () => {
      socket.disconnect();
    }, false);

    // On component unmount, disconnect socket
    return function cleanup() {
      socket.disconnect();
    };

  }, [roomName, socket]); // We only re-run setup if room name or socket change
  // (In other words, we don't.)


  return (
    <div>
      <h2>Your block list: </h2>

      <h2>Room: {roomName}</h2>
      {room && (room.ownerID === userId) ? <RoomAdminPanel authToken={authToken} room={room} userId={userId} socket={socket}/> : null}
      
      {messages?.map((msg) => <Message message={msg} blockList={blockList} authToken={authToken} key={msg.id}/>)}
      <Composer socket={socket} roomName={roomName} />
    </div>
  );
}

export default RoomView;