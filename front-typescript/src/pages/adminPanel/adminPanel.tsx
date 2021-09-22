import React, { useEffect, useState } from 'react';
import { User } from '../../pages/users/users.types';
import MessageAvatar from '../chats/components/messageAvatar.component';
// import UserAvatar from '../friends/components/UserAvatar.component';

interface AdminPanelProps {
  authToken: string,
  user: User
}

async function getUsers(authToken: string): Promise<User[]> {

  const response = await fetch("http://127.0.0.1:3000/users", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });
  const jsonData = await response.json();

  return jsonData as User[];
}

async function banUser(authToken: string, userId: number): Promise<User[]> {

  const response = await fetch(`http://127.0.0.1:3000/profile/ban/${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });
  const jsonData = await response.json();

  return jsonData as User[];
}

async function forgiveUser(authToken: string, userId: number): Promise<User[]> {

  const response = await fetch(`http://127.0.0.1:3000/profile/forgive/${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });
  const jsonData = await response.json();

  return jsonData as User[];
}

async function promoteUser(authToken: string, userId: number): Promise<User[]> {

  const response = await fetch(`http://127.0.0.1:3000/profile/makeAdmin/${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });
  const jsonData = await response.json();

  return jsonData as User[];
}

async function demoteUser(authToken: string, userId: number): Promise<User[]> {

  const response = await fetch(`http://127.0.0.1:3000/profile/demote/${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });
  const jsonData = await response.json();

  return jsonData as User[];
}


const AdminPanel: React.FC<AdminPanelProps> = ({ authToken, user }) => {
  const [users, setUsers] = useState<User[]>([]);

  const updateUsers = (authToken: string) => {
    getUsers(authToken).then(update => setUsers(update));
  }

  useEffect(() => {
    updateUsers(authToken);
  }, [authToken])

  const handleBan = (userId: number) => {
    banUser(authToken, userId).then(() => updateUsers(authToken));
  }

  const handlePromote = (userId: number) => {
    promoteUser(authToken, userId).then(() => updateUsers(authToken));
  }

  const handleForgive = (userId: number) => {
    forgiveUser(authToken, userId).then(() => updateUsers(authToken));
  }

  const handleDemote = (userId: number) => {
    demoteUser(authToken, userId).then(() => updateUsers(authToken));
  }

  return (
    <>
    {(user && (user.admin || user.owner)) ? 
    <div>
      <h2 className="text-center text-xxl">Banhammer 9000</h2>


      <h2 className="text-center">Parliament</h2>

      <div className="flex flex-col justify-items-center">
        {users.map(member => member.owner || member.admin ? <div key={member.id} className="py-4 shadow-lg border border-gray-400 bg-green-200 bg-opacity-25 border-solid mt-3 rounded-lg">
          <div className="px-4 flex flex-row items-center ">
            <div className="flex-1 flex flex-row items-center">
            <MessageAvatar user={member} /><p className="px-4 text-xl">{member.name}</p>
            </div>
            {
              member.owner ? <p>Proud owner</p> : member.id === user.id ? <p>Your Honour</p> : <button onClick={() => handleDemote(member.id)} className="py-4 px-10 text-xl bg-white rounded-lg bg-red-300 font-bold border-solid border-red-400 hover:bg-red-400 border-3 text-red-600 shadow-lg">Demote</button>
            }
            
          </div>
        </div> : null)}
      </div>

      <h2 className="text-center">Players</h2>
      <p className="text-center">Select a user to ban or promote</p>

      <div className="flex flex-col justify-items-center">
        {users.map(user => user.owner || user.admin || user.banned ? null : <div key={user.id} className="py-4 shadow-lg border border-gray-400 bg-gray-400 bg-opacity-25 border-solid mt-3 rounded-lg">
          <div className="px-4 flex flex-row items-center ">
            <div className="flex-1 flex flex-row items-center">
            <MessageAvatar user={user} /><p className="px-4 text-xl">{user.name}</p>
            </div>
            <button onClick={() => handleBan(user.id)} className="py-4 px-10 text-xl bg-white rounded-lg bg-red-300 font-bold border-solid border-red-400 hover:bg-red-400 border-3 text-red-600 shadow-lg">Ban</button>
            <button onClick={() => handlePromote(user.id)} className="py-4 px-10 text-xl bg-white rounded-lg bg-green-300 font-bold border-solid border-green-500 hover:bg-green-500 border-3 text-green-600 shadow-lg">Promote</button>
          </div>
        </div>)}
      </div>
      
      <h2 className="text-center">Prison</h2>
      <div>
      {users.map(user => user.banned ? <div key={user.id} className="py-4 bg-black bg-opacity-25 hover:shadow-lg border hover:bg-blue-200 hover:bg-opacity-25 hover:text-black border-gray-800 border-solid mt-3 rounded-lg">
          <div className="flex flex-row px-4">
          <div className="px-4 flex flex-1 flex-row items-center ">
            <MessageAvatar user={user} /><p className="px-4 text-xl">{user.name}</p>
          </div>
          <button onClick={() => handleForgive(user.id)} className="py-4 px-10 text-xl bg-white rounded-lg bg-green-300 font-bold border-solid border-green-500 hover:bg-green-500 border-3 text-green-600 shadow-lg">Forgive</button>
        </div></div> : null)}
      </div>
    </div>: <p>Restricted area.</p>}</>
  )
};

export default AdminPanel