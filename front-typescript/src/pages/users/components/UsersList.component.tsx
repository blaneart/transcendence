import React, { useCallback, useEffect, useState } from "react";
import { User } from '../users.types';
import UserComponent from './user.component';

import './usersList.styles.scss';
import './friend.styles.scss';

interface IUsersListProps {
  user_logged?: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null | undefined>>;
  authToken: string;
  setAuthToken: React.Dispatch<React.SetStateAction<string>>;
}

async function getUsers(authToken: string): Promise<User[] | null> {

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

const UsersList: React.FC<IUsersListProps> = ({
  user_logged,
  setUser,
  authToken,
  }) => {

  const [users, setUsers] = useState<User[]>([(user_logged as User),]);

  const refreshUsers = useCallback(() => {
    getUsers(authToken).then(newUsers => {
      if (newUsers === null)
        return;
      setUsers(newUsers);
    });
  }, [authToken]);

  useEffect(() => {
    // On setup, we update the users
    refreshUsers();
  }, [users, refreshUsers]); // We don't really reupdate.

  return ( authToken !== "" && user_logged ? (
    <div>
      <h2>Users: </h2>
      {users.map((user) =>
      <div className='friend' key={user.id}>
        <UserComponent id1={user_logged.id} user={user} authToken={authToken} />
      </div>)}

    </div>) : <div>Please Log !</div>
  );
}

export default UsersList;