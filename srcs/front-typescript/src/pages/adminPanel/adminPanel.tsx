import React, { useCallback, useEffect, useState } from 'react';
import { User } from '../../pages/users/users.types';
import MessageAvatar from '../chats/components/messageAvatar.component';
// import UserAvatar from '../friends/components/UserAvatar.component';
import { useHistory } from 'react-router-dom';

interface AdminPanelProps {
  authToken: string,
  user: User
}

async function getUsers(authToken: string, demotedHandler: Function): Promise<User[] | null> {

  const response = await fetch(process.env.REACT_APP_API_URL + "/users", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });
  if (!response.ok) {
    if (response.status === 403)
      return demotedHandler();
    return null;
  }
  const jsonData = await response.json();

  return jsonData as User[];
}

async function banUser(authToken: string, userId: number, demotedHandler: Function) {

  const response = await fetch(`${process.env.REACT_APP_API_URL}/profile/ban/${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });
  if (response.status === 403) {
    return demotedHandler();
  }
}

async function forgiveUser(authToken: string, userId: number, demotedHandler: Function) {

  const response = await fetch(`${process.env.REACT_APP_API_URL}/profile/forgive/${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });
  if (response.status === 403) {
    return demotedHandler();
  }
}

async function promoteUser(authToken: string, userId: number, demotedHandler: Function) {

  const response = await fetch(`${process.env.REACT_APP_API_URL}/profile/makeAdmin/${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });
  if (response.status === 403) {
    return demotedHandler();
  }
}

async function demoteUser(authToken: string, userId: number, demotedHandler: Function) {

  const response = await fetch(`${process.env.REACT_APP_API_URL}/profile/demote/${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });
  if (response.status === 403) {
    return demotedHandler();
  }
}


const AdminPanel: React.FC<AdminPanelProps> = ({ authToken, user }) => {
  const [users, setUsers] = useState<User[]>([]);

  const history = useHistory();

  const demotedChecker = useCallback(() => {
    alert("You've been demoted from admins.");
    history.replace('/');
  }, [history]);

  const updateUsers = useCallback((authToken: string) => {
    getUsers(authToken, demotedChecker).then(update => update === null ? null : setUsers(update));
  }, [demotedChecker]);

  useEffect(() => {
    updateUsers(authToken);
  }, [authToken, updateUsers])



  const handleBan = (userId: number) => {
    banUser(authToken, userId, demotedChecker).then(() => updateUsers(authToken));
  }

  const handlePromote = (userId: number) => {
    promoteUser(authToken, userId, demotedChecker).then(() => updateUsers(authToken));
  }

  const handleForgive = (userId: number) => {
    forgiveUser(authToken, userId, demotedChecker).then(() => updateUsers(authToken));
  }

  const handleDemote = (userId: number) => {
    demoteUser(authToken, userId, demotedChecker).then(() => updateUsers(authToken));
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
                  member.owner ? <p>Proud owner</p> : member.id === user.id ? <p>Your Honour</p> : <button onClick={() => handleDemote(member.id)}
                    className="cursor-pointer py-4 px-10 text-xl bg-white rounded-lg bg-red-400 font-bold border-solid border-red-500 hover:bg-red-500 border-3 text-red-600 hover:text-red-800 hover:border-red-600 shadow-lg">Demote</button>
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
                <button onClick={() => handleBan(user.id)} className="cursor-pointer py-4 px-10 text-xl bg-white rounded-lg bg-red-400 font-bold border-solid border-red-500 hover:bg-red-500 border-3 text-red-600 hover:text-red-800 hover:border-red-600 shadow-lg">Ban</button>
                <button onClick={() => handlePromote(user.id)} className="cursor-pointer py-4 px-10 text-xl bg-white rounded-lg bg-green-400 font-bold border-solid border-green-500 hover:bg-green-500 border-3 text-green-600 hover:text-green-800 hover:border-green-600 shadow-lg">Promote</button>
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
                <button onClick={() => handleForgive(user.id)} className="cursor-pointer py-4 px-10 text-xl bg-white rounded-lg bg-green-400 font-bold border-solid border-green-500 hover:bg-green-500 border-3 text-green-600 hover:text-green-800 hover:border-green-600 shadow-lg">Forgive</button>
              </div></div> : null)}
          </div>
        </div> : <p>Restricted area.</p>}</>
  )
};

export default AdminPanel