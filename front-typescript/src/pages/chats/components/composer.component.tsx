import React, { useState } from "react";
import { Socket } from "socket.io-client";


interface ComposerProps {
  socket: Socket
  roomName: string
}

enum ChatMessageType {
  TEXT,
  GAME_INVITE,
  GAME_SCORE
}

interface ChatMessage {
  type: ChatMessageType,
  room: string,
  text: string,
}

const Composer: React.FC<ComposerProps> = ({ socket, roomName }) => {
  const [messageText, setMessageText] = useState<string>("");

  const sendMessage = (e: any) => {
    e.preventDefault();
    const newMessage: ChatMessage = {
      type: ChatMessageType.TEXT,
      room: roomName,
      text: messageText
    }
    console.log(socket);
    socket.emit("chatMessage", newMessage);
  }

  return (
    <div>
      <form onSubmit={(e) => sendMessage(e)}>
        <input type="text" onChange={(event) => setMessageText(event.target.value)}></input>
        <button>Submit</button>
      </form>
    </div>
  );
}

export default Composer;