import React, { useCallback, useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { User } from '../users.types';

interface IFriendProps {
  id1: number;
  id2: number;
  authToken: string;
}


async function getFriendById(id2: number, authToken: string)
{
  const data = {
    value: id2,
  };
  const response = await fetch("http://127.0.0.1:3000/userById", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify(data),
  });
  const jsonData = await response.json();

  return jsonData as User;
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

const Friend: React.FC<IFriendProps> = ({ id1, id2, authToken }) => {

  const [friendUser, setFriend] = useState<User>();

  const refreshUsers = useCallback(() => {
    getFriendById(id2, authToken).then(newFriend => {
      setFriend(newFriend);
    });
  }, [authToken]);

  const handleUnfriend = async (id1: number, id2: number, authToken: string) => {
    await removeFriend(id1, id2, authToken);
    refreshUsers();
  };

  useEffect(() => {
    // On setup, we update the friend
    refreshUsers();
  }, [friendUser, refreshUsers]);

  return (
    friendUser ?
    <div>
      <Link to={`/users/${id2}`}>
        <div style={{display: 'inline-block'}}>
        {friendUser.name}
        <div className='image'
          style={{
          backgroundImage: (friendUser.realAvatar ? `url(http://127.0.0.1:3000/static/${friendUser.avatar})` : `url(https://source.boringavatars.com/beam/150/${friendUser.avatar})`)
        }}
        />
        </div>
      </Link>
      <button onClick={(e) => handleUnfriend(id1, friendUser.id, authToken)}>Unfriend</button>
      <Link to={`/chats/dms/` + friendUser.name}>{"  "} DM {" "}</Link>
    </div>
      : <p>Not Found</p>
  );
}

export default Friend;