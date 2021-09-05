import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { io, Socket } from "socket.io-client";
import Composer from "./composer.component";

// We require a token passed as parameter
interface RoomParams {
  authToken: string
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

const RoomView: React.FC<RoomParams> = ({ authToken }) => {

  const { roomName } = useParams<RoomRouteParams>();
  const [ socket ] = useState<Socket>(() => io("ws://127.0.0.1:8080", {
    auth: {
      token: authToken
    }
  }));
  const [messages, setMessages] = useState<Message[]>();

  useEffect(() => {
    // Handle the messages that were sent before we joined
    socket.on("initialMessages", (msg) => {
      // Receive an array of messages
      const newMessages = msg as Message[];
      // Right now, we sort them on front, maybe we should also sort them on back
      newMessages.sort((a,b) => a.id - b.id);
      // Set the state directly
      setMessages(newMessages);
    })
    
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
    })

    // Ask to add us to this room and send us the initial messages.
    socket.emit("requestJoin", roomName);

  }, [roomName, socket]); // We only re-run setup if room name or socket change
  // (In other words, we don't.)


  return (
    <div>
      <h2>Room: {roomName}</h2>
      {messages?.map((msg) => <div key={msg.id}><span>{msg.name}: </span>{msg.message}</div>)}
      <Composer socket={socket} roomName={roomName} />
    </div>
  );
}

export default RoomView;