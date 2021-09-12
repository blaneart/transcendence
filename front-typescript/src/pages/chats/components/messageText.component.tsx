import Avatar from "boring-avatars";
import React from "react";
import { MessageType } from "../chats.types";
import MessageAvatar from "./messageAvatar.component";
import UserTooltip from "./userTooltip.component";

interface MessageTextProps {
  message: MessageType
}


const MessageText: React.FC<MessageTextProps> = ({ message }) => {


  return (



    <div className="message flex-1 flex flex-row items-center message-text">

      <div className="px-2 items-center flex flex-column">
          <MessageAvatar message={message} />
        <div className="tooltip">
        <div className="tooltiptext shadow-lg">
            <UserTooltip message={message}/>
        </div>
        <a href={`/users/${message.name}/`} className="px-2">{message.name}: </a>
        </div>
      </div>
      <span>{message.message}</span>
    </div>

  );
}

export default MessageText;