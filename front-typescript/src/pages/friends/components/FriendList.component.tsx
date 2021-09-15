import React, { useCallback, useEffect, useState } from "react";
import { User } from '../users.types';
import Friend from './friend.component';

import './FriendList.styles.scss';
import './friend.styles.scss';

interface IFriendsListProps {
  user_logged: User;
  authToken: string;
  setAuthToken: React.Dispatch<React.SetStateAction<string>>;
}

async function getFriends(id1: number, authToken: string): Promise<number[]>  {

  const response = await fetch(`http://127.0.0.1:3000/friends/of/${id1}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });
  const jsonData = await response.json();

  return jsonData as number[];
}

const FriendList: React.FC<IFriendsListProps> = ({
  user_logged,
  authToken }) => {

  const [friends, setFriends] = useState<number[]>([user_logged.id, ]);

  const refreshFriends = useCallback(() => {
    getFriends(user_logged.id, authToken).then(newFriends => {
      setFriends(newFriends);
    });
  }, [authToken, user_logged.id]);

  useEffect(() => {
    refreshFriends();
  }, [refreshFriends]);

  return ( authToken !== "" && user_logged ? (
    <div>
      <h2>Friends: </h2>
      {friends && friends.length ? friends.map((friend) =>
        <div className='friend' key={friend}>
          <Friend id1={user_logged.id} id2={friend} authToken={authToken} />
        </div>) : <p>NON</p>}

    </div>)
    :
    <div>Please Log !</div>
  );
}

export default FriendList;