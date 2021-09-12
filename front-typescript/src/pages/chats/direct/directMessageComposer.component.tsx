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
    <div>
      <form onSubmit={(e) => sendMessage(e)}>
        <input type="text" onChange={(event) => setMessageText(event.target.value)}></input>
        <button>Submit</button>
      </form>
    </div>
  );
}

export default DirectMessageComposer;