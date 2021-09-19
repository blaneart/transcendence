import React from "react";
import { Socket } from "socket.io-client";
import { MessageType } from "../chats.types";
import MessageAvatar from "./messageAvatar.component";
import UserTooltip from "./userTooltip.component";

interface MessageTextProps {
  message: MessageType,
  socket: Socket
  userId: number
}



const MessageText: React.FC<MessageTextProps> = ({ message, socket, userId }) => {


  return (



    <div className="message flex-1 flex flex-row items-center message-text">

      <div className="md:px-2 items-center flex flex-column">
        <div className="hidden md:block">
          <MessageAvatar user={message.sender} />
        </div>
        <div className="tooltip">
        <div className="tooltiptext shadow-lg">
            <UserTooltip message={message} socket={socket} userId={userId}/>
        </div>
        <a href={`/users/${message.name}/`} className="px-2">{message.name}: </a>
        </div>
      </div>
      <span>{message.message}</span>
    </div>

  );
}

export default MessageText;