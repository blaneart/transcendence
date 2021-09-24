import React from "react";
import { Socket } from "socket.io-client";
import { useHistory } from "react-router-dom";
import { DirectMessageUpdate } from "../chats.types";
import MessageText from "../components/messageText.component";
import { Settings } from "../../../App.types";
import { ChatMessageType } from "../chats.types";

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

const DirectMessageComponent: React.FC<DirectMessageProps> = ({ message, userId, blockList, authToken, onBlock, socket, gameRoomName, gameSettings }) => {

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

  // If the sender of the message is blocked
  if (blockList.has(message.senderID)) {
    // Don't show the message
    return (
      <p>Message blocked</p>
    );
  }
  let meIn = -1;
  return (<div className="flex flex-row py-2">
    {/* <a href={`/users/${message.name}/`}>{message.name}: </a>{message.message} */}
    <MessageText message={message} socket={socket} userId={userId} gameSettings={gameSettings} authToken={authToken}/>
    {userId === message.senderID ? null : <button onClick={handleBlock}>Block sender</button>}
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
  </div>);
};

export default DirectMessageComponent