import Avatar from "boring-avatars";
import React from "react";
import { User } from "../../../App.types";
import { MessageType } from "../chats.types";
import MessageAvatar from "./messageAvatar.component";

interface UserTooltipProps {
  message: MessageType
}


const UserTooltip: React.FC<UserTooltipProps> = ({ message }) => {
  return (<div className="mt-2">
    <MessageAvatar message={message} />
    <p>{message.sender.name}</p>
    <p className="mt-0 leading-normal">Games: {message.sender.games} <br/>
    Wins: {message.sender.wins}<br/>
    Losses: {message.sender.games - message.sender.wins}</p>
  </div>);
};

export default UserTooltip;