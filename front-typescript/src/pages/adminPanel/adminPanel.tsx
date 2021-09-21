import React, { useEffect, useState } from 'react';
import { User } from '../../pages/users/users.types';
import MessageAvatar from '../chats/components/messageAvatar.component';
import UserAvatar from '../friends/components/UserAvatar.component';

interface AdminPanelProps {
  authToken: string
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


const AdminPanel: React.FC<AdminPanelProps> = ({ authToken }) => {
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

  return (
    <div>
      <h2 className="text-center text-xxl">Banhammer 9000</h2>

      <p className="text-center">Select a user to ban or promote</p>

      <h2 className="text-center">Parliament</h2>

      <div className="flex flex-col justify-items-center">
        {users.map(user => user.owner || user.admin ? <div className="py-4 shadow-lg border border-gray-400 bg-gray-400 bg-opacity-25 border-solid mt-3 rounded-lg">
          <div className="px-4 flex flex-row items-center ">
            <div className="flex-1 flex flex-row items-center">
            <MessageAvatar user={user} /><p className="px-4 text-xl">{user.name}</p>
            </div>
            <button onClick={() => handleBan(user.id)} className="py-4 px-10 text-xl bg-white rounded-lg bg-red-300 font-bold border-solid border-red-400 hover:bg-red-400 border-3 text-red-600 shadow-lg">Ban</button>
          </div>
        </div> : null)}
      </div>

      <div className="flex flex-col justify-items-center">
        {users.map(user => user.owner || user.banned ? null : <div  className="py-4 shadow-lg border border-gray-400 bg-gray-400 bg-opacity-25 border-solid mt-3 rounded-lg">
          <div className="px-4 flex flex-row items-center ">
            <div className="flex-1 flex flex-row items-center">
            <MessageAvatar user={user} /><p className="px-4 text-xl">{user.name}</p>
            </div>
            <button onClick={() => handleBan(user.id)} className="py-4 px-10 text-xl bg-white rounded-lg bg-red-300 font-bold border-solid border-red-400 hover:bg-red-400 border-3 text-red-600 shadow-lg">Ban</button>
            <button className="py-4 px-10 text-xl bg-white rounded-lg bg-green-300 font-bold border-solid border-green-500 hover:bg-green-500 border-3 text-green-600 shadow-lg">Promote</button>
          </div>
        </div>)}
      </div>
      
      <h2 className="text-center">Prison</h2>
      <div>
      {users.map(user => user.banned ? <div className="py-4 bg-black bg-opacity-25 hover:shadow-lg border hover:bg-blue-200 hover:bg-opacity-25 hover:text-black border-gray-800 border-solid mt-3 rounded-lg">
          <div className="px-4 flex flex-row items-center ">
            <MessageAvatar user={user} /><p className="px-4 text-xl">{user.name}</p>
          </div>
        </div> : null)}
      </div>
    </div>
  )
};

export default AdminPanel