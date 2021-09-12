import { DirectMessageRequest } from "../chats.types";
import React, { useState } from "react";
import { Socket } from "socket.io-client";

interface DirectMessageComposerProps {
  socket: Socket
  interlocutor: string
}

const DirectMessageComposer: React.FC<DirectMessageComposerProps> = ({ socket, interlocutor }) => {
  const [messageText, setMessageText] = useState<string>();

  // Handle sending a message
  const sendMessage = async (event: any) => {
    // Prevent default form action
    event.preventDefault();

    // Handle empty message text
    if (!messageText)
      return alert("Please enter message text");

    // Create a request instance
    const request: DirectMessageRequest = {
      userB: interlocutor,
      text: messageText
    }
    // Send the backend request
    socket.emit("directMessage", request);
  }

  return (
    <div className="border border-white border-solid border-t-0 py-2 px-2">
      <form className="flex flex-row" onSubmit={(e) => sendMessage(e)}>
        <input className="flex-1 py-2" type="text" onChange={(event) => setMessageText(event.target.value)}></input>
        <button className="px-6">Submit</button>
      </form>
    </div>
  );
}

export default DirectMessageComposer;