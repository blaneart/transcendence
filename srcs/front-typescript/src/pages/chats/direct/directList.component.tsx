import React, { useEffect, useState, useCallback } from "react";
import { User } from "../../../App.types";

import { Direct } from "../chats.types";
import MessageAvatar from "../components/messageAvatar.component";
import StyledButton from "../components/styledButton.component";
import StyledSubmit from "../components/styledSubmit.component";
import DirectLink from "./directLink.component";

interface DirectListProps {
  authToken: string
  userId: number
};

// Get all direct conversations we already have
async function getDirects(authToken: string): Promise<Direct[] | null> {
  const response = await fetch(process.env.REACT_APP_API_URL + "/chat/directs/me/", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });
  if (!response.ok)
    return null;
  // Read response as JSON
  const jsonData = await response.json();
  // Cast response to an array of rooms
  return jsonData as Direct[];
}

// Get all existing users
async function getUsers(authToken: string): Promise<User[] | null> {
  const response = await fetch(
    `${process.env.REACT_APP_API_URL}/users/`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });
  if (!response.ok)
    return null;
  return await response.json() as User[];
}

// Start a new direct conversation with a user
async function createDirect(authToken: string, userB: number) {
  const response = await fetch(
    `${process.env.REACT_APP_API_URL}/chat/directs/${userB}/`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });
  if (!response.ok)
  {
    if (response.status === 409)
      return alert("A direct conversation already exists with this person.");
    else
      return alert("Error creating a direct conversation");
  }
  return await response.json();
}

  // Block a user
  async function handleUnblock(authToken: string, userID: number, onBlock: Function) {
    // Send a response to the backend
    await fetch(
      `${process.env.REACT_APP_API_URL}/chat/block/${userID}/`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });
    onBlock();
  }

// Return true if a user with a given id is already present in the directs array.
function inDirects(directs: Direct[], id: number)
{
  return directs.some((direct) => direct.userA === id || direct.userB === id);
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

function otherInDirect(d: Direct, myId: number)
{
  if (d.userA === myId)
    return d.userB;
  return d.userA;
}

// The data we get in the blocklist
interface BlockedUserEntry {
  blockedID: number
}


const DirectList: React.FC<DirectListProps> = ({ authToken, userId }) => {
  const [directs, setDirects] = useState<Direct[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>();
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



  useEffect(() => {
    // Get all the directs we already have
    getDirects(authToken).then(newDirects => newDirects !== null ? setDirects(newDirects) : null);

    // Get all users that we can talk to in the future
    getUsers(authToken).then(update => update !== null ? setUsers(update) : null);
  }, [authToken]);

  // Save changed user ID
  const handleChange = (event: any) => {
    setSelectedUserId(event.target.value);
  }

  const handleSubmit = async (event: any) => {

    // Prevent default form action
    event.preventDefault();

    if (!selectedUserId)
      return alert("Please select a user in order to start a direct conversation");

    // Bake a backend call
    await createDirect(authToken, parseInt(selectedUserId));
    setSelectedUserId("-1");
    // Update the list direct conversations
    getDirects(authToken).then((newDirects) => newDirects !== null ? setDirects(newDirects) : null);
  }

  return (<div>
    {directs.map((direct) => blockList.has(otherInDirect(direct, userId)) ? null : <DirectLink key={direct.id} authToken={authToken} userId={userId} direct={direct}/>)}
    <h5 className="text-xl mb-2 mt-4">Start a direct conversation with:</h5>
    <form className="flex flex-row" onSubmit={handleSubmit}>
       <select className="py-2 px-2 bg-gray-900 text-gray-300 border-gray-600 flex-1 rounded-lg" onChange={handleChange} value={selectedUserId} defaultValue={-1} required>
        <option disabled value={-1} label="Select a user"></option>
        {users.map((user) => (user.id === userId || inDirects(directs, user.id) || blockList.has(user.id))? null : <option key={user.id} value={user.id}>{user.name}</option>)}
      </select>
      <StyledSubmit value="Start conversation" />
    </form>
    {blockList.size ? <h5 className="text-xl mb-3 mt-4">Your block list</h5> : null}
    {users && users.map(user => blockList.has(user.id)
        && <div key={user.id} className="flex flex-row items-center">
            <MessageAvatar user={user}/><span className="px-2 mr-5">{user.name}</span><StyledButton onClick={() => handleUnblock(authToken, user.id, updateBlockList)}>Unblock</StyledButton>
          </div>)}
  </div>);
}

export default DirectList;