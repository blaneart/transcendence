import React, { useCallback, useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { User } from '../users.types';

interface IFriendProps {
  id1: number;
  friendUser: User;
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

    const response = await fetch(`http://127.0.0.1:3000/friends/${id1}/${id2}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });
}

async function removeFriend(id1: number, id2: number, authToken: string) {
    
    const response = await fetch(`http://127.0.0.1:3000/friends/${id1}/${id2}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });
}

const Friend: React.FC<IFriendProps> = ({ id1, friendUser, authToken }) => {

  const [friend, setFriend] = useState<boolean>(false);

  // useCallback to prevent infinite state updates
  const refreshUsers = useCallback(() => {
    // Get relationship
    getFriend(id1, friendUser.id, authToken).then(newRelationship => {
      setFriend(newRelationship);
    });
  }, [authToken]);

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
    <div>
      <Link to={`/users/${friendUser.name}`}>
        <div style={{display: 'inline-block'}}>
        {friendUser.name}
        <div className='image'
          style={{
          backgroundImage: (friendUser.realAvatar ? `url(http://127.0.0.1:3000/static/${friendUser.avatar})` : `url(https://source.boringavatars.com/beam/150/${friendUser.avatar})`)
        }}
        />
        </div>
      </Link>
      {friend ? (<button onClick={(e) => handleUnfriend(id1, friendUser.id, authToken)}>Unfriend</button>)
      : <button onClick={(e) => handleBefriend(id1, friendUser.id, authToken)} >Befriend</button>}
      <Link to={`/chats/dms/` + friendUser.name}>{"  "} DM {" "}</Link>
    </div>
  );
}

export default Friend;
