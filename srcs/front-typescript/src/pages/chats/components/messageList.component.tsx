import React, { useCallback } from "react";
import { ChatMessageType, MessageType, Room } from "../chats.types";
import Message from "./message.component";
import { useState, useEffect } from "react";
import { Socket } from "socket.io-client";
import { Settings } from "../../../App.types";


interface MessageListParams {
  messages: MessageType[];
  userId: number;
  authToken: string;
  room: Room;
  socket: Socket;
  amAdmin: boolean
  amOwner: boolean
  gameRoomName: string
  gameSettings: Settings
}

// Get the list of all blocked users
async function getBlockList(authToken: string): Promise<BlockedUserEntry[] | null> {
  // Send a request to backend
  const response = await fetch(
    `${process.env.REACT_APP_API_URL}/chat/block/`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });
  if (!response.ok)
    return null;
  return await response.json() as BlockedUserEntry[];
}



// The data we get in the blocklist
interface BlockedUserEntry {
  blockedID: number
}

const MessageList: React.FC<MessageListParams> = ({ messages, authToken, userId, room, socket,
                                                  amAdmin, amOwner, gameRoomName, gameSettings}) => {
  const [blockList, setBlockList] = useState<Map<number, boolean>>(new Map<number, boolean>());

  const updateBlockList = useCallback(() => {
    // Get all the blocked users
    getBlockList(authToken).then((users) => {

      // If the backend response failed, don't corrupt the state
      if (users === null)
        return;

      // Mutate the block list
      setBlockList(() => {
        const newBlockList = new Map<number, boolean>()
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

  return (
    <div className='px-4 py-4'>
      <h5 className="text-xl mt-2 mb-4">Messages</h5>
      {messages?.filter((msg) => {
      if (msg.type === ChatMessageType.TEXT || msg.senderID === userId  || msg.receiverId === userId)
        return msg
      return null
    })
      .map((msg) => <Message message={msg} blockList={blockList} 
      onBlock={updateBlockList} authToken={authToken} userId={userId} 
      room={room} socket={socket} key={msg.id} amAdmin={amAdmin} gameRoomName={gameRoomName} gameSettings={gameSettings} />)}
    </div>
  );
}

export default MessageList;