import React, { useState } from "react";
import { Socket } from "socket.io-client";

// We need a socket and the room we're in to send messages.
interface ComposerProps {
  socket: Socket
  roomName: string
  muted: boolean
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

const Composer: React.FC<ComposerProps> = ({ socket, roomName, muted }) => {
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

  if (muted)
  {
    return (
      <p>You are muted :(</p>
    )
  }

  return (
    <div className="px-4 py-4 border border-white border-l-0 border-solid">
      <form className="flex flex-row" onSubmit={(e) => sendMessage(e)}>
        <input className="py-2 composer" type="text" onChange={(event) => setMessageText(event.target.value)}></input>
        <button className="px-6">Submit</button>
      </form>
    </div>
  );
}

export default Composer;