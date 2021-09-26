import React, { useCallback, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { ChatMessageType, MessageType, UserPublic } from "../chats.types";
import MessageAvatar from "./messageAvatar.component";
import UserTooltip from "./userTooltip.component";
import { Settings } from "../../../App.types";

interface MessageTextProps {
  message: MessageType,
  socket: Socket
  userId: number
  gameSettings: Settings,
  authToken: string
}

async function getUserById(authToken: string, userID: number): Promise<UserPublic | null> {
  const response = await fetch(process.env.REACT_APP_API_URL + `/profile/${userID}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
  });
  if (!response.ok)
    return null;
  const jsonData = await response.json();

  return jsonData as UserPublic;
}


const MessageText: React.FC<MessageTextProps> = ({ message, socket, userId, gameSettings, authToken }) => {

  const [invitee, setInvitee] = useState<UserPublic | null>(null);

  const refreshUser = useCallback(() => {
    if (message.receiverId) {
      getUserById(authToken, message.receiverId).then(update => setInvitee(update));
    }
  }, [authToken, message.receiverId]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  if (message.type === ChatMessageType.GAME_INVITE) {
    if (message.senderID === userId) {
      return <div className="message flex-1 flex flex-row items-center message-text">
        <div className="md:px-2">
          <p>You invited {invitee ? <a href={`/users/${invitee.name}/`}>{invitee.name}</a> : "someone"} for a game</p>
        </div>
      </div>
    }
    return (
      <div className="message flex-1 flex flex-row items-center message-text">

        <div className="md:px-2 items-center flex flex-column">
          <div className="hidden md:block">
            <MessageAvatar user={message.sender} />
          </div>
          <div className="tooltip">
            <div className="tooltiptext shadow-lg">
              <UserTooltip message={message} socket={socket} userId={userId} gameSettings={gameSettings} authToken={authToken} />
            </div>
          </div>
        </div>
        <p><a href={`/users/${message.name}/`}>{message.sender.name}</a> invited you for a game</p>
      </div>
    );
  }
  if (message.type === ChatMessageType.GAME_INVITE_REJECTED) {
    if (message.senderID === userId) {
      return <div className="message flex-1 flex flex-row items-center message-text">
        {invitee &&
        <div className="md:px-2 items-center flex flex-column">
            <div className="hidden md:block">
              <MessageAvatar user={invitee} />
            </div>
            <div className="tooltip">
              <div className="tooltiptext shadow-lg">
                <UserTooltip message={message} socket={socket} userId={userId} gameSettings={gameSettings} authToken={authToken} />
              </div>
          </div>
        </div>
        }
        <span>{invitee ? <a href={`/users/${invitee.name}/`}>{invitee.name}</a> : "Someone"} rejected your invitation for a game</span>
      </div>
    }
    return (
      <div className="message flex-1 flex flex-row items-center message-text">
        <div className="md:px-2 items-center flex flex-column">
        </div>
          <span>You rejected <a href={`/users/${message.name}/`}>{message.sender.name}</a>'s invite for a game</span>
      </div>
    );
  }
  if (message.type === ChatMessageType.GAME_INVITE_EXPIRED) {
    if (message.senderID === userId) {
      return <div className="message flex-1 flex flex-row items-center message-text">
        <div className="md:px-2 items-center flex flex-column">
          <span>Good game with {invitee ? <a href={`/users/${invitee.name}/`}>{invitee.name}</a> : "Someone"}. Well played!</span>
        </div>
      </div>
    }
    return (
      <div className="message flex-1 flex flex-row items-center message-text">
        <div className="md:px-2 items-center flex flex-column">
        </div>
        <span>Good game with <a href={`/users/${message.name}/`}>{message.sender.name}</a>. Well played!</span>
      </div>
    );
  }


  return (
    <div className="message flex-1 flex flex-row items-center message-text">

      <div className="md:px-2 items-center flex flex-column">
        <div className="hidden md:block">
          <MessageAvatar user={message.sender} />
        </div>
        <div className="tooltip">
          <div className="tooltiptext shadow-lg">
            <UserTooltip message={message} socket={socket} userId={userId} gameSettings={gameSettings} authToken={authToken} />
          </div>
          {
            message.senderID === userId ? <span className="px-2">You: </span>
            :
            <a href={`/users/${message.name}/`} className="px-2">{message.name}: </a>
          }
        </div>
      </div>
      <span>{message.message}</span>
    </div>

  );
}

export default MessageText;