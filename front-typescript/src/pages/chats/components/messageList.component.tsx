import React from "react";
import { MessageType, Room } from "../chats.types";
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

const MessageList: React.FC<MessageListParams> = ({ messages, authToken, userId, room, socket, amAdmin }) => {
  const [blockList, setBlockList] = useState<Map<number, boolean>>(new Map<number, boolean>());

  useEffect(() => {
    updateBlockList();
  }, []);

  const updateBlockList = () => {
    // Get all the blocked users
    getBlockList(authToken).then((users) => {

      // Mutate the block list
      setBlockList((oldBlockList) => {
        const newBlockList = new Map<number, boolean>(oldBlockList)
        // For each user, add their ID to the map
        users.map((user) => {
          newBlockList.set(user.blockedID, true);
        });
        // Replace the old blocklist state
        return newBlockList;
      });
    });
  }


  return (
    <div className=" px-4 py-4 border border-b-0 border-white border-solid h-full">
      <h5 className="text-xl mt-2 mb-4">Messages</h5>
      {messages?.map((msg) => <Message message={msg} blockList={blockList} onBlock={updateBlockList} authToken={authToken} userId={userId} room={room} socket={socket} key={msg.id} amAdmin={amAdmin} />)}
    </div>
  );
}

export default MessageList;