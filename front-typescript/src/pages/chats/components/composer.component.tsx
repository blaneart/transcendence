import React, { useState } from "react";
import { Socket } from "socket.io-client";

// We need a socket and the room we're in to send messages.
interface ComposerProps {
  socket: Socket
  roomName: string
}

// The kind of a message (could be extended)
enum ChatMessageType {
  TEXT,
  GAME_INVITE,
  GAME_SCORE
}

// This is the back-end representation of the message.
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