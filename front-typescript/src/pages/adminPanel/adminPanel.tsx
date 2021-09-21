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

const AdminPanel: React.FC<AdminPanelProps> = ({ authToken }) => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    getUsers(authToken).then(update => setUsers(update));
  }, [authToken])

  return (
    <div>
      <h2 className="text-center text-xxl">Banhammer 9000</h2>
      <p className="text-center">Select a user to ban</p>
      <div className="flex flex-col justify-items-center">
        {users.map(user => user.owner ? null : <div className="py-4 hover:shadow-lg border hover:bg-white hover:text-black border-white border-solid mt-3 rounded-lg">
          <div className="px-4 flex flex-row items-center ">
            <MessageAvatar user={user} /><p className="px-4 text-xl">{user.name}</p>
          </div>
        </div>)}
      </div>
    </div>
  )
};

export default AdminPanel