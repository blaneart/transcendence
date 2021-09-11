import React, { useEffect, useState } from "react";
import { User } from "../../../App.types";

import { Direct } from "../chats.types";
import DirectLink from "./directLink.component";

interface DirectListProps {
  authToken: string
  userId: number
};

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


async function getUsers(authToken: string): Promise<User[]>
{
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

async function createDirect(authToken: string, userB: number)
{
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

const DirectList: React.FC<DirectListProps> = ({authToken, userId}) => {
  const [directs, setDirects] = useState<Direct[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number>();
  
  useEffect(() => {
    getDirects(authToken).then((newDirects) => setDirects(newDirects));
    getUsers(authToken).then((update) => setUsers(update));
  }, []);

  const handleChange = (event: any) => {
    setSelectedUserId(event.target.value);
  }

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    if (!selectedUserId)
      return alert("Please select a user in order to start a direct conversation");
    await createDirect(authToken, selectedUserId);
    // getDirects(authToken).then((newDirects) => setDirects(newDirects));
  }

  return (<div>
    {directs.map((direct) => <DirectLink authToken={authToken} userId={userId} direct={direct}/>)}
    <h5>Start a direct conversation</h5>
    <form onSubmit={handleSubmit}>
      <select onChange={handleChange} required>
        <option disabled selected label="Select a user"></option>
        {users.map((user) => user.id === userId ? null : <option key={user.id} value={user.id}>{user.name}</option>)}
      </select>
      <input type="submit" value="Submit"/>
    </form>
  </div>);
}

export default DirectList;