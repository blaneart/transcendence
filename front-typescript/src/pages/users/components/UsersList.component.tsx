import React, { useCallback, useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { User } from '../users.types';

import './usersList.styles.scss';

interface UsersListProps {
  user_logged?: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null | undefined>>;
  authToken: string;
}

// Get all users from the backend
async function getUsers(authToken: string): Promise<User[]> {
  // Perform the request to backend
  const response = await fetch("http://127.0.0.1:3000/users", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });
  // Read response as JSON
  const jsonData = await response.json();
  // Cast response to an array of users
  return jsonData as User[];
}

const UsersList: React.FC<UsersListProps> = ({ user_logged, setUser,  authToken }) => {

  const [users, setUsers] = useState<User[]>([(user_logged as User)]);

  // useCallback to prevent infinite state updates
  const refreshUsers = useCallback(() => {
    // Get all users from the backend and add them to state
    getUsers(authToken).then(newUsers => {
      setUsers(newUsers);
    });
  }, [authToken]);

  useEffect(() => {
    // On setup, we update the users
    refreshUsers();
  }, [users, refreshUsers]); // We don't really reupdate.

  return (
    <div>
      <h2>Users: </h2>
      {users.map((user) => <div key={user.id}><Link to={`/users/${user.name}`}>{user.name}</Link></div>)}

    </div>
  );
}

export default UsersList;