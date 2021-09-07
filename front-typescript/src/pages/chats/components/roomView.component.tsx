import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { io, Socket } from "socket.io-client";
import Composer from "./composer.component";
import { useHistory } from 'react-router-dom';
import RoomAdminPanel from "./roomAdminPanel.component";
import { Room } from "../chats.types";

// We require a token passed as parameter
interface RoomParams {
  authToken: string
  userId: number
};

// The parameters we expect in the URL.
interface RoomRouteParams {
  roomName: string
}

// This is the front-end message: the sender, and the text.
interface Message {
  id: number,
  name: string,
  message: string
}

async function getRoom(authToken:string, roomName: string)
{
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

const RoomView: React.FC<RoomParams> = ({ authToken, userId }) => {

  const { roomName } = useParams<RoomRouteParams>();
  const [ socket ] = useState<Socket>(() => io("ws://127.0.0.1:8080", {
    auth: {
      token: authToken
    }
  }));
  const [messages, setMessages] = useState<Message[]>();
  const [room, setRoom] = useState<Room>();
  let history = useHistory();

  useEffect(() => {
    // Get the current room instance
    getRoom(authToken, roomName).then((room)=>setRoom(room));

    // Handle the messages that were sent before we joined
    socket.on("initialMessages", (msg) => {
      // Receive an array of messages
      const newMessages = msg as Message[];
      // Right now, we sort them on front, maybe we should also sort them on back
      newMessages.sort((a,b) => a.id - b.id);
      // Set the state directly
      setMessages(newMessages);
    });

    // Once someone sends a message, we receive this event
    socket.on("newMessage", (msg) => {
      const newMessage = msg as Message; // we receive a single update
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
      <h2>Room: {roomName}</h2>
      {room ? <RoomAdminPanel authToken={authToken} room={room} userId={userId} socket={socket}/> : null}
      
      {messages?.map((msg) => <div key={msg.id}><span>{msg.name}: </span>{msg.message}</div>)}
      <Composer socket={socket} roomName={roomName} />
    </div>
  );
}

export default RoomView;