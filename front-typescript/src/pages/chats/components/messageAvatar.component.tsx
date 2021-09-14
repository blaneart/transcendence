import Avatar from "boring-avatars";
import React from "react";
import { MessageType } from "../chats.types";

interface MessageAvatarProps {
  message: MessageType
}

const MessageAvatar: React.FC<MessageAvatarProps> = ({ message }) => {
  if (message.sender.realAvatar)
  {
    return <img src={"http://127.0.0.1:3000/static/" + message.sender.avatar} className="message-image" alt="Avatar"></img>
  }
  else
  {
    return <Avatar size={35} name={"" + message.sender.id42} variant="beam" />
  }
}

export default MessageAvatar;