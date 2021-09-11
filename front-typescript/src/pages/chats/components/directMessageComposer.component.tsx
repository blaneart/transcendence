import { DirectMessageRequest } from "../chats.types";
import React, { useState } from "react";
import { Socket } from "socket.io-client";


interface DirectMessageComposer {
  socket: Socket
  interlocutor: string
}

const DirectMessageComposer: React.FC<DirectMessageComposer> = ({socket, interlocutor}) => {
  const [messageText, setMessageText] = useState<string>();

  const sendMessage = async (event: any) => {
    event.preventDefault();
    if (!messageText)
      return alert("Please enter message text");
    const request: DirectMessageRequest = {
      userB: interlocutor,
      text: messageText
    }
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