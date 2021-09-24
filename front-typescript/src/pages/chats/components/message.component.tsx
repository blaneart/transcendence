import React from "react";
import { useHistory } from "react-router-dom";
import { Socket } from "socket.io-client";
import { ChatMessageType, MessageType, Room } from "../chats.types";
import MessageText from "./messageText.component";
import { Settings } from "../../../App.types";

interface MessageParams {
  message: MessageType
  authToken: string
  blockList: Map<number, boolean>
  userId: number
  onBlock: Function
  room: Room
  socket: Socket
  amAdmin: boolean
  gameRoomName: string
  gameSettings: Settings
}

interface BanRequest {
  roomName: string,
  userId: number
  minutes: number
}

function canIBan(userId: number, room: Room, amAdmin: boolean, message: MessageType): boolean
{
  if ((amAdmin || userId === room.ownerID) && message.senderID !== userId && message.senderID !== room.ownerID)
  {
    return true;
  }
  return false;
}

const Message: React.FC<MessageParams> = ({ message, authToken, blockList,
  userId, onBlock, room, socket, amAdmin, gameRoomName, gameSettings }) => {

  // Block a user
  const handleBlock = async () => {
    // Send a response to the backend
    await fetch(
      `${process.env.REACT_APP_API_URL}/chat/block/${message.senderID}/`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });
      onBlock();
  }

  let history = useHistory();
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
  let meIn = -1;
  console.log(message.receiverId, userId);
  // Else, show the message
  return (
    <div className="flex flex-row py-2">
      <MessageText message={message} socket={socket} userId={userId} gameSettings={gameSettings} authToken={authToken}/>
      {message.receiverId === userId && message.type === ChatMessageType.GAME_INVITE ? 
      <> 
      <button onClick={() => {
        socket.emit('acceptGame', message.senderID, message.id, gameRoomName);
        history.replace(`/play/${gameRoomName}/${meIn}`);
      }} >accept</button>
      <button onClick={() =>{
        console.log('gameRoomName', gameRoomName);
        socket.emit('rejectGame', message.senderID);
      }}>reject</button> 
      </>
      : null}
      
      {message.senderID === userId && message.type === ChatMessageType.GAME_INVITE &&
      <button onClick={() => {
        history.replace(`/play/${gameRoomName}/${userId}`);
      }}>join waiting room</button>
    }
      
      {userId === message.senderID ? null 
      : <button onClick={handleBlock}>Block sender</button>}
      
      {canIBan(userId, room, amAdmin, message) ? <div>
        <button onClick={handleBan}>Ban sender</button>
        <button onClick={handleMute}>Mute sender</button>
      </div> : null}
    </div>
  );

};

export default Message;