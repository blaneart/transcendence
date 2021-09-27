import React, { useCallback, useEffect, useState } from "react";
import { User } from '../users.types';
import UserComponent from './user.component';
import { useHistory } from "react-router-dom";

import './usersList.styles.scss';
import './friend.styles.scss';

interface IUsersListProps {
  user_logged?: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null | undefined>>;
  authToken: string;
  setAuthToken: React.Dispatch<React.SetStateAction<string>>;
}

async function getUsers(authToken: string, userId: number, onBan: Function): Promise<User[] | null> {

  const response = await fetch(process.env.REACT_APP_API_URL + "/users", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });
  if (!response.ok)
  {
    if (response.status === 401)
      onBan();
    return null;
  }
  const jsonData = await response.json();

  return jsonData as User[];
}

const UsersList: React.FC<IUsersListProps> = ({
  user_logged,
  setUser,
  authToken,
  }) => {

  const [users, setUsers] = useState<User[]>([(user_logged as User),]);

  const history = useHistory();
  
  const bannedHandler = useCallback(() => {
    alert("You're banned");
    history.replace('/');
  }, [history]);

  const refreshUsers = useCallback(() => {
    if (user_logged) getUsers(authToken, user_logged.id, bannedHandler).then(newUsers => {
      if (newUsers === null)
        return;
      setUsers(newUsers);
    });
  }, [authToken, user_logged, bannedHandler]);

  useEffect(() => {
    // On setup, we update the users
    refreshUsers();
  }, [refreshUsers]); // We don't really reupdate.

  return ( authToken !== "" && user_logged ? (
  <div className="bg-black bg-opacity-75 px-10 py-10 rounded-xl shadow-lg">
      <h2 className="text-center font-xl">Users</h2>
      <div className="flex flex-col">
      {users.map((user) => <UserComponent id1={user_logged.id} key={user.id} user={user} authToken={authToken} />)}
      </div>

    </div>) : <div>Please Log !</div>
  );
}

export default UsersList;