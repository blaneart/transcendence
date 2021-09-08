import React, { useCallback, useEffect, useState } from "react";

interface IFriendProps {
  id1: number;
  id2: number;
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

    console.log('addFriend Friend Component');
    const response = await fetch(`http://127.0.0.1:3000/friends/${id1}/${id2}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });
}

async function deleteFriend(id1: number, id2: number, authToken: string) {
    
    const response = await fetch(`http://127.0.0.1:3000/friends/${id1}/${id2}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });
}

const Friend: React.FC<IFriendProps> = ({ id1, id2,  authToken }) => {

  const [friend, setFriend] = useState<boolean>(false);

  // useCallback to prevent infinite state updates
  const refreshUsers = useCallback(() => {
    // Get relationship
    getFriend(id1, id2, authToken).then(newRelationship => {
      setFriend(newRelationship);
    });
  }, [authToken]);

  useEffect(() => {
    // On setup, we update the friend
    refreshUsers();
  }, [refreshUsers]);

  return (
    <div>
      {friend ? (<button onClick={(e) => deleteFriend(id1, id2, authToken)}>Unfriend</button>)
      : <button onClick={(e) => addFriend(id1, id2, authToken)} >Befriend</button>}
    </div>
  );
}

export default Friend;
