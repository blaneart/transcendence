import React, { useCallback, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { DirectMessageUpdate } from "../chats.types";
import DirectMessageComponent from "./directMessage.component";
import { Settings } from "../../../App.types";

interface DirectMessageListProps {
  messages: DirectMessageUpdate[]
  userId: number
  authToken: string
  socket: Socket
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

const DirectMessageList: React.FC<DirectMessageListProps> = ({ messages, userId, authToken, socket, gameRoomName, gameSettings }) => {
  const [blockList, setBlockList] = useState<Map<number, boolean>>(new Map<number, boolean>());



  const updateBlockList = useCallback(() => {
    // Get all the blocked users
    getBlockList(authToken).then((users) => {

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
    // Update the block list
    updateBlockList();
  }, [updateBlockList]);

  return (
    <div className="border bg-gray-900 text-gray-300 border-gray-600 rounded-t-lg border-solid px-4 py-4">
      <h5 className="text-xl mt-0 mb-4">Messages</h5>
      {messages.map((msg) => <DirectMessageComponent key={msg.id} message={msg} socket={socket}
        userId={userId} blockList={blockList} authToken={authToken} onBlock={updateBlockList}
        gameRoomName={gameRoomName} gameSettings={gameSettings} />)}
    </div>
  );
};

export default DirectMessageList