import React, { useState } from "react";
import { Socket } from "socket.io-client";
import StyledSubmit from "./styledSubmit.component";

// We need a socket and the room we're in to send messages.
interface ComposerProps {
  socket: Socket
  roomName: string
  muted: boolean
  amOwner: boolean
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

const Composer: React.FC<ComposerProps> = ({ socket, roomName, muted, amOwner }) => {
  const [messageText, setMessageText] = useState<string>("");

  const sendMessage = (e: any) => {
    e.preventDefault();
    if (messageText === "")
      return alert("Please enter message text");
    const newMessage: ChatMessage = {
      type: ChatMessageType.TEXT,
      room: roomName,
      text: messageText
    }
    socket.emit("chatMessage", newMessage);
    setMessageText("");
  }

  if (muted)
  {
    return (
      <div className="px-4 py-4 border bg-gray-900 text-gray-300 border-gray-600 border-solid rounded-b-lg">
        <p>You are muted :( </p>
    </div>
    )
  }

  const mainClass="px-4 py-4 border bg-gray-900 text-gray-300 border-gray-600 rounded-br-lg border-solid" + (amOwner ? "" : " rounded-bl-lg")

  return (
    <div className={mainClass}>
      <form className="flex flex-row" onSubmit={(e) => sendMessage(e)}>
        <input className="py-2 composer bg-gray-700 rounded-lg text-gray-300 border-gray-600" type="text" value={messageText} onChange={(event) => setMessageText(event.target.value)}></input>
        <StyledSubmit value="Send message"></StyledSubmit>
      </form>
    </div>
  );
}

export default Composer;