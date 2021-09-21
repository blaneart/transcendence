import React from "react";
import { Socket } from "socket.io-client";
import { DirectMessageUpdate } from "../chats.types";
import MessageText from "../components/messageText.component";
import { Settings } from "../../../App.types";

interface DirectMessageProps {
  message: DirectMessageUpdate
  userId: number
  blockList: Map<number, boolean>
  authToken: string
  onBlock: Function,
  socket: Socket
  gameRoomName: string
  gameSettings: Settings
}

const DirectMessageComponent: React.FC<DirectMessageProps> = ({ message, userId, blockList, authToken, onBlock, socket, gameSettings }) => {

  // Block a user
  const handleBlock = async () => {
    // Send a response to the backend
    await fetch(
      `http://127.0.0.1:3000/chat/block/${message.senderID}/`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });
    onBlock();
  }

  // If the sender of the message is blocked
  if (blockList.has(message.senderID)) {
    // Don't show the message
    return (
      <p>Message blocked</p>
    );
  }

  return (<div className="flex flex-row py-2">
    {/* <a href={`/users/${message.name}/`}>{message.name}: </a>{message.message} */}
    <MessageText message={message} socket={socket} userId={userId} gameSettings={gameSettings} />
    {userId === message.senderID ? null : <button onClick={handleBlock}>Block sender</button>}
  </div>);
};

export default DirectMessageComponent