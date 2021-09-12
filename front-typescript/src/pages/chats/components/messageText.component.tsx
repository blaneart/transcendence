import Avatar from "boring-avatars";
import React from "react";
import { MessageType } from "../chats.types";

interface MessageTextProps {
  message: MessageType
}

const MessageText: React.FC<MessageTextProps> = ({ message }) => {
  return (
    <div className="message flex-1 flex flex-row items-center">
      <div className="px-2 items-center flex flex-column">
        {message.sender.realAvatar ?
          <img src={"http://127.0.0.1:3000/static/" + message.sender.avatar} className="message-image"></img>
          :
          <Avatar size={35} name={"" + message.sender.id42} variant="beam" />
        }
      </div>
      <a href={`/users/${message.name}/`} className="px-2">{message.name}: </a>{message.message}
    </div>
  );
}

export default MessageText;