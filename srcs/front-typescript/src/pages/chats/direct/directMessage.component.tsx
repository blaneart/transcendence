import React from "react";
import { Socket } from "socket.io-client";
import { useHistory } from "react-router-dom";
import { DirectMessageUpdate } from "../chats.types";
import MessageText from "../components/messageText.component";
import { Settings } from "../../../App.types";
import { ChatMessageType } from "../chats.types";
import StyledButton from "../components/styledButton.component";

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
  return (<div className="flex flex-row py-2 items-center">
    {/* <a href={`/users/${message.name}/`}>{message.name}: </a>{message.message} */}
    <MessageText message={message} socket={socket} userId={userId} gameSettings={gameSettings} authToken={authToken} />
    {message.receiverId === userId && message.type === ChatMessageType.GAME_INVITE ?
      <>
        <button  className="px-4 py-2 bg-green-400 text-green-800 rounded-lg border-2 border-green-500 border-solid hover:text-white hover:bg-green-500" onClick={() => {
          socket.emit('acceptDirectGame', {
            interlocutorID: message.senderID,
            inviteID: message.id,
            gameRoomName: gameRoomName
          });
          history.replace(`/play/${message.roomName}/${meIn}`);
        }} >Accept</button>
        <button className="px-4 py-2 bg-red-400 text-red-800 rounded-lg border-2 border-red-500 border-solid hover:text-white hover:bg-red-500" onClick={() => {
          socket.emit('rejectDirectGame', {
            inviteID: message.id,
            interlocutorID: message.senderID
          });
        }}>Reject</button>
      </>
      :
      null
    }

    {message.senderID === userId && message.type === ChatMessageType.GAME_INVITE &&
      <button className="px-4 py-2 bg-green-400 text-green-800 rounded-lg border-2 border-green-500 border-solid hover:text-white hover:bg-green-500" onClick={() => {
        history.replace(`/play/${message.roomName}/${userId}`);
      }}>Join waiting room</button>
    }
    <div className="ml-4">
      {userId === message.senderID ? null : <StyledButton onClick={handleBlock}>Block sender</StyledButton>}
    </div>
  </div>);
};

export default DirectMessageComponent