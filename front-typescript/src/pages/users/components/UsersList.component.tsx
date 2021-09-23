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

  const response = await fetch(process.env.REACT_APP_API_URL + "/users", {
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
  }, [refreshUsers]); // We don't really reupdate.

  return ( authToken !== "" && user_logged ? (
  <div className="bg-black bg-opacity-75 py-10 px-10 rounded-xl shadow-lg">
      <h2 className="text-center font-xl">Users </h2>
      <div className="flex flex-col">
      {users.map((user) =>
        <UserComponent id1={user_logged.id} key={user.id} user={user} authToken={authToken} />)}
      </div>

    </div>) : <div>Please Log !</div>
  );
}

export default UsersList;