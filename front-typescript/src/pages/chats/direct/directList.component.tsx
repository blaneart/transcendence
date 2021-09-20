import React, { useEffect, useState } from "react";
import { User } from "../../../App.types";

import { Direct } from "../chats.types";
import StyledSubmit from "../components/styledSubmit.component";
import DirectLink from "./directLink.component";

interface DirectListProps {
  authToken: string
  userId: number
};

// Get all direct conversations we already have
async function getDirects(authToken: string): Promise<Direct[]> {
  const response = await fetch("http://127.0.0.1:3000/chat/directs/me/", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });
  // Read response as JSON
  const jsonData = await response.json();
  // Cast response to an array of rooms
  console.log(jsonData);
  return jsonData as Direct[];
}

// Get all existing users
async function getUsers(authToken: string): Promise<User[]> {
  const response = await fetch(
    `http://127.0.0.1:3000/users/`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });
  return await response.json() as User[];
}

// Start a new direct conversation with a user
async function createDirect(authToken: string, userB: number) {
  const response = await fetch(
    `http://127.0.0.1:3000/chat/directs/${userB}/`,
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
      alert("A direct conversation already exists with this person.");
    else
      alert("Error creating a direct conversation");
  }
  return await response.json();
}

// Return true if a user with a given id is already present in the directs array.
function inDirects(directs: Direct[], id: number)
{
  return directs.some((direct) => direct.userA === id || direct.userB === id);
}

const DirectList: React.FC<DirectListProps> = ({ authToken, userId }) => {
  const [directs, setDirects] = useState<Direct[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>();

  useEffect(() => {
    // Get all the directs we already have
    getDirects(authToken).then((newDirects) => setDirects(newDirects));

    // Get all users that we can talk to in the future
    getUsers(authToken).then((update) => setUsers(update));
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
    getDirects(authToken).then((newDirects) => setDirects(newDirects));
  }

  return (<div>
    {directs.map((direct) => <DirectLink key={direct.id} authToken={authToken} userId={userId} direct={direct}/>)}
    <h5 className="text-xl mb-2 mt-4">Start a direct conversation with:</h5>
    <form className="" onSubmit={handleSubmit}>
       <select className="py-2 px-2 bg-gray-900 text-gray-300 border-gray-600 rounded-lg" onChange={handleChange} value={selectedUserId} defaultValue={-1} required>
        <option disabled value={-1} label="Select a user"></option>
        {users.map((user) => (user.id === userId || inDirects(directs, user.id))? null : <option key={user.id} value={user.id}>{user.name}</option>)}
      </select>
      <StyledSubmit value="Start conversation" />
    </form>
  </div>);
}

export default DirectList;