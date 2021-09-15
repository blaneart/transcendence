import React, { useEffect, useState } from "react";
import { User } from "../../../App.types";
import UserAvatar from "../../users/components/UserAvatar.component";

import { Direct } from "../chats.types";
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
  return await response.json();
}

const DirectList: React.FC<DirectListProps> = ({ authToken, userId }) => {
  const [directs, setDirects] = useState<Direct[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number>();

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
    await createDirect(authToken, selectedUserId);

    // Update the list direct conversations
    getDirects(authToken).then((newDirects) => setDirects(newDirects));
  }

  return (<div>
    {directs.map((direct) =><div><DirectLink key={direct.id} authToken={authToken} userId={userId} direct={direct}/></div>)}
    <h5 className="text-xl mb-2 mt-4">Start a direct conversation with:</h5>
    <form className="" onSubmit={handleSubmit}>
      <select onChange={handleChange} defaultValue="DEFAULT" required>
        <option disabled value="DEFAULT" label="Select a user"></option>
        {users.map((user) => user.id === userId ? null : <option key={user.id} value={user.id}>{user.name}</option>)}
      </select>
      <input type="submit" value="Submit" />
    </form>
  </div>);
}

export default DirectList;