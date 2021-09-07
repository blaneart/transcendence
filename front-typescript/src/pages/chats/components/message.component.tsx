import React from "react";
import { MessageType } from "../chats.types";

interface MessageParams {
  message: MessageType
  authToken: string
  blockList: Map<number, boolean>
}

const Message: React.FC<MessageParams> = ({message, authToken, blockList}) => {

  // Block a user
  const handleBlock = () => {
    // Send a response to the backend
    const response = fetch(
      `http://127.0.0.1:3000/chat/block/${message.senderID}/`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });
  }

  // If the sender of the message is blocked
  if (blockList.has(message.senderID))
  {
    // Don't show the message
    return (
      <p>Message blocked</p>
    );
  }

  // Else, show the message
  return (
    <div>
      <a href={`/users/${message.name}/`}>{message.name}: </a>{message.message}
      <button onClick={handleBlock}>Block sender</button>
    </div>
  );

};

export default Message;