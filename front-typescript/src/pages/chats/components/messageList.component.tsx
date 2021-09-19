import React, { useCallback } from "react";
import { ChatMessageType, MessageType, Room } from "../chats.types";
import Message from "./message.component";
import { useState, useEffect } from "react";
import { Socket } from "socket.io-client";


interface MessageListParams {
  messages: MessageType[];
  userId: number;
  authToken: string;
  room: Room;
  socket: Socket;
  amAdmin: boolean
  amOwner: boolean
}

// Get the list of all blocked users
async function getBlockList(authToken: string): Promise<BlockedUserEntry[]> {
  // Send a request to backend
  const response = await fetch(
    `http://127.0.0.1:3000/chat/block/`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });
  return await response.json() as BlockedUserEntry[];
}



// The data we get in the blocklist
interface BlockedUserEntry {
  blockedID: number
}

const MessageList: React.FC<MessageListParams> = ({ messages, authToken, userId, room, socket, amAdmin, amOwner }) => {
  const [blockList, setBlockList] = useState<Map<number, boolean>>(new Map<number, boolean>());

  const updateBlockList = useCallback(() => {
    // Get all the blocked users
    getBlockList(authToken).then((users) => {

      // Mutate the block list
      setBlockList((oldBlockList) => {
        const newBlockList = new Map<number, boolean>(oldBlockList)
        // For each user, add their ID to the map
        users.map((user) => newBlockList.set(user.blockedID, true));
        // Replace the old blocklist state
        return newBlockList;
      });
    });
  }, [authToken]);

  useEffect(() => {
    updateBlockList();
  }, [updateBlockList]);

  const mainClasses = "px-4 py-4 border border-b-0 bg-gray-900 text-gray-300 border-gray-600 rounded-tr-lg border-solid h-full" + ( amOwner ? "" : " rounded-l-lg");

  return (
    <div className={mainClasses}>
      <h5 className="text-xl mt-2 mb-4">Messages</h5>
      {messages?.filter((msg) => {if (msg.type !== ChatMessageType.GAME_INVITE || msg.senderID === userId  || msg.receiverId === userId) return msg})
      .map((msg) => <Message message={msg} blockList={blockList} 
      onBlock={updateBlockList} authToken={authToken} userId={userId} 
      room={room} socket={socket} key={msg.id} amAdmin={amAdmin}/>)}
    </div>
  );
}

export default MessageList;