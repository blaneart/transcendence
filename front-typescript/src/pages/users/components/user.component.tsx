import React, { useCallback, useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { User } from '../users.types';

interface IUserProps {
  id1: number;
  user: User;
  authToken: string;
}

async function getFriend(id1: number, id2: number, authToken: string) {

    const response = await fetch(`http://127.0.0.1:3000/friends/exist/${id1}/${id2}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });
    const jsonData = await response.json();

    return jsonData as boolean;
}

async function addFriend(id1: number, id2: number, authToken: string) {

    await fetch(`http://127.0.0.1:3000/friends/${id1}/${id2}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });
}

async function removeFriend(id1: number, id2: number, authToken: string) {
    
    await fetch(`http://127.0.0.1:3000/friends/${id1}/${id2}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });
}

const UserComponent: React.FC<IUserProps> = ({
  id1,
  user,
  authToken,
  }) => {

  const [friend, setFriend] = useState<boolean>(false);

  const refreshUsers = useCallback(() => {
    getFriend(id1, user.id, authToken).then(newRelationship => {
      setFriend(newRelationship);
    });
  }, [authToken, id1, user.id]);

  const handleBefriend = async (id1: number, id2: number, authToken: string) => {
    await addFriend(id1, id2, authToken);
    refreshUsers();
  };

  const handleUnfriend = async (id1: number, id2: number, authToken: string) => {
    await removeFriend(id1, id2, authToken);
    refreshUsers();
  };

  useEffect(() => {
    // On setup, we update the friend
    refreshUsers();
  }, [friend, refreshUsers]);

  return (
    id1 !== user.id ?
    <div>
      <Link to={`/users/${user.name}`}>
        <div style={{display: 'inline-block'}}>
        {user.name}
        <div className='image'
          style={{
          backgroundImage: (user.realAvatar ? `url(http://127.0.0.1:3000/static/${user.avatar})` : `url(https://source.boringavatars.com/beam/150/${user.avatar})`)
        }}
        />
        </div>
      </Link>
      {friend ? (<button onClick={(e) => handleUnfriend(id1, user.id, authToken)}>Unfriend</button>)
      : <button onClick={(e) => handleBefriend(id1, user.id, authToken)} >Befriend</button>}
      <Link to={`/chats/dms/` + user.name}>{"  "} DM {" "}</Link>
    </div>
    : <p></p>
  );
}

export default UserComponent;
