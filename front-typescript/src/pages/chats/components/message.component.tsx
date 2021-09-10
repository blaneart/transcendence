import React from "react";
import { Socket } from "socket.io-client";
import { MessageType, Room } from "../chats.types";

interface MessageParams {
  message: MessageType
  authToken: string
  blockList: Map<number, boolean>
  userId: number
  onBlock: Function
  room: Room
  socket: Socket
  amAdmin: boolean
}

interface BanRequest {
  roomName: string,
  userId: number
  minutes: number
}

function canIBan(userId: number, room: Room, amAdmin: boolean, message: MessageType): boolean
{
  if ((amAdmin || userId === room.ownerID) && message.senderID !== userId && message.senderID != room.ownerID)
  {
    return true;
  }
  return false;
}

const Message: React.FC<MessageParams> = ({message, authToken, blockList, userId, onBlock, room, socket, amAdmin}) => {

  // Block a user
  const handleBlock = async () => {
    // Send a response to the backend
    const response = await fetch(
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

  // Ban a user
  const handleBan = async () => {

    // Get the duration from the user
    let min = undefined
    while (!min)
    {
      min = window.prompt("How long should the ban be in integer minutes?");
    }
    // Send a request
    const req: BanRequest = {
      userId: message.senderID,
      roomName: room.name,
      minutes: parseInt(min)
    };
    socket.emit("banUser", req);
  }

  // Mute a user
  const handleMute = async () => {
    // Get the duration from the user
    let min = undefined
    while (!min)
    {
      min = window.prompt("How long should the mute be in integer minutes?");
    }
    // Send a request
    const req: BanRequest = {
      userId: message.senderID,
      roomName: room.name,
      minutes: parseInt(min)
    };
    socket.emit("muteUser", req);
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
      {userId === message.senderID ? null : <button onClick={handleBlock}>Block sender</button>}
      {canIBan(userId, room, amAdmin, message) ? <div>
        <button onClick={handleBan}>Ban sender</button><button onClick={handleMute}>Mute sender</button>
      </div> : null}
    </div>
  );

};

export default Message;