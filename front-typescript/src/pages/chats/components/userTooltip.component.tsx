import React from "react";
import { Socket } from "socket.io-client";
import { MessageType } from "../chats.types";
import GameInvite from "./gameInvite.component";
import MessageAvatar from "./messageAvatar.component";
import { Settings } from "../../../App.types";

interface UserTooltipProps {
  message: MessageType,
  socket: Socket
  userId: number
  gameSettings: Settings
}



const UserTooltip: React.FC<UserTooltipProps> = ({ message, socket, userId, gameSettings }) => {
  return (<div className="mt-2">
    <MessageAvatar user={message.sender} />

    <p className=""><a className="text-black font-normal underline" href={`/users/${message.sender.name}`}>{message.sender.name}</a></p>
    <p className="mt-0 leading-normal">Games: {message.sender.games} <br/>
    Wins: {message.sender.wins}<br/>
    Losses: {message.sender.games - message.sender.wins}<br/></p>
    {userId === message.senderID ? null :<GameInvite socket={socket} ranked={true} enemy={message.sender} gameSettings={gameSettings}/> }

  </div>);
};

export default UserTooltip;