import Avatar from "boring-avatars";
import React from "react";

interface MessageAvatarUser
{
  id42: number;
  avatar: string;
  realAvatar: boolean;
}

interface MessageAvatarProps {
  // message: MessageType
  user: MessageAvatarUser
}

const MessageAvatar: React.FC<MessageAvatarProps> = ({ user }) => {
  if (user.realAvatar)
  {
    return <img src={process.env.REACT_APP_API_URL + "/static/" + user.avatar} className="message-image" alt="Avatar"></img>
  }
  else
  {
    return <Avatar size={35} name={"" + user.id42} variant="beam" />
  }
}

export default MessageAvatar;