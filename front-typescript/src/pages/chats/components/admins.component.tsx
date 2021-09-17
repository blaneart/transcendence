import React, { useEffect, useState } from "react";
import { Room } from "../chats.types";
import { User } from "../../../App.types";
import { Socket } from "socket.io-client";
import StyledSubmit from "./styledSubmit.component";

interface AdminsProps {
  authToken: string,
  room: Room,
  socket: Socket
}

interface AdminEntry {
  id: number,
  name: string,
  userID: number
}

async function getAdmins(authToken: string, roomName: string): Promise<AdminEntry[]>
{
  const response = await fetch(
    `http://127.0.0.1:3000/chat/admins/${roomName}/`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });
  return await response.json() as AdminEntry[];
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

interface MakeAdminRequest {
  roomName: string,
  userId: number
}

function userInAdmins(admins: AdminEntry[], userId: number) : boolean
{
  return admins.some((admin) => admin.userID === userId);
}

const Admins: React.FC<AdminsProps> = ({authToken, socket, room}) => {
    
  const [admins, setAdmins] = useState<AdminEntry[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number>();

  useEffect(() => {
    getUsers(authToken).then((newUsers) => setUsers(newUsers));
    getAdmins(authToken, room.name).then((newAdmins) => setAdmins(newAdmins));
  }, [authToken, room.name]);

  const handleChange = (event: any) => {
    setSelectedUserId(event.target.value);
  }

  const handleSubmit = (event: any) => {
    event.preventDefault();
    if (!selectedUserId)
      return alert("Please select a user to make admin");
    const request: MakeAdminRequest = {
      userId: selectedUserId,
      roomName: room.name
    }
    socket.emit("makeAdmin", request);
    getAdmins(authToken, room.name).then((newAdmins) => setAdmins(newAdmins));
  }

  return (<div>
    <h5 className="text-xl mb-3">Admins:</h5>
    {admins.map((admin)=> <p key={admin.id}>{admin.name}</p>)}
    <h5 className="text-xl mb-3 mt-3">Make admin: </h5>
    <form onSubmit={handleSubmit}>
      <select className="px-2 py-2 bg-gray-900 text-gray-300 border-gray-600 rounded-lg" onChange={handleChange} required>
        <option label=" "></option>
        {users.map((user) => user.id !== room.ownerID && !userInAdmins(admins, user.id) ? <option key={user.id} value={user.id}>{user.name}</option> : null)}
      </select>
      {/* <input type="submit" value="Submit"/> */}
      <StyledSubmit value="Make admin" />
    </form>
  </div>);
};

export default Admins