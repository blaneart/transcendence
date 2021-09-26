import React, { useEffect, useState, useCallback } from "react";
import { Socket } from "socket.io-client";
import { MessageType } from "../chats.types";
import GameInvite from "./gameInvite.component";
import MessageAvatar from "./messageAvatar.component";
import { Settings } from "../../../App.types";
import { Link } from "react-router-dom";

interface UserTooltipProps {
  message: MessageType,
  socket: Socket
  userId: number
  gameSettings: Settings,
  authToken: string
}

async function getGameNumbers(authToken: string, id: number): Promise<number[]> {
  const data = {
    id: id,
  };
  const response = await fetch(process.env.REACT_APP_API_URL + "/gameNumbers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok)
    return [0, 0, 0];

  const jsonData = await response.json();

  return jsonData as number[];
}

const UserTooltip: React.FC<UserTooltipProps> = ({ message, socket, userId, gameSettings, authToken }) => {
  const [gameNumbers, setGameNumbers] = useState<number[]>();

  // useCallback to prevent infinite state updates
  const refreshGameNumbers = useCallback(() => {
    // Get all users from the backend and add them to state
    getGameNumbers(authToken, message.sender.id).then(newGameNumbers => {
      setGameNumbers(newGameNumbers);
    });
  }, [authToken, message.sender.id]);

  useEffect(() => {
    // On setup, we update the users
    refreshGameNumbers();
  }, [refreshGameNumbers]); // We don't really reupdate.

  return (<div className="mt-2">
    <MessageAvatar user={message.sender} />

    <p className=""><Link className="text-black font-normal underline" to={`/users/${message.sender.name}`}>{message.sender.name}</Link></p>
    <p className="mt-0 leading-normal">Games: {gameNumbers ? gameNumbers[1] : null} <br />
      Wins: {gameNumbers ? gameNumbers[0] : null}<br />
      Losses: {gameNumbers ? gameNumbers[2] : null}<br /></p>
    {userId === message.senderID ? null : <GameInvite socket={socket} ranked={true} enemy={message.sender} gameSettings={gameSettings} />}

  </div>);
};

export default UserTooltip;