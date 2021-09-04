import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { io, Socket } from "socket.io-client";
import Composer from "./composer.component";

interface RoomParams {
  authToken: string
};

interface RoomRouteParams {
  roomName: string
}

// const socket = io("ws://127.0.0.1:8080");

// socket.on("connect", () => {
//   socket.emit("message", "here is some text");
// });

interface Message {
  id: number,
  name: string,
  message: string
}

const RoomView: React.FC<RoomParams> = ({ authToken }) => {

  const { roomName } = useParams<RoomRouteParams>();
  const [socket, setSocket] = useState<Socket>(io("ws://127.0.0.1:8080", {
    auth: {
      token: authToken
    }
  }));
  const [messages, setMessages] = useState<Message[]>();

  useEffect(() => {
    // setSocket(io("ws://127.0.0.1:8080"));
    // if (socket)
    console.log(`AuthToken: ${authToken}`)

    socket.on("response", (msg) => {
      console.log(`Got response: ${msg}`);
    });

    socket.on("roomUpdate", (msg) => {
      console.log(`Got room update: ${msg}`);
      console.log(msg);
    })

    socket.on("initialMessages", (msg) => {
      console.log(`Got initialMessages: ${msg}`);
      const newMessages = msg as Message[];
      setMessages(newMessages);
    })

    socket.emit("requestJoin", roomName);


  }, []);


  return (
    <div>
      <h2>Room: {roomName}</h2>
      {messages?.map((msg) => <div key={msg.id}><span>{msg.name}: </span>{msg.message}</div>)}
      <Composer socket={socket} roomName={roomName} />
    </div>
  );
}

export default RoomView;