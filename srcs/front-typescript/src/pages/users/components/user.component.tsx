import React, { useCallback, useEffect, useState } from "react";
import { User } from '../users.types';
import MessageAvatar from "../../chats/components/messageAvatar.component";
import { useHistory } from "react-router-dom";

interface IUserProps {
  id1: number;
  user: User;
  authToken: string;
}

async function getFriend(id1: number, id2: number, authToken: string, onBan: Function): Promise<boolean | null> {

  const response = await fetch(`${process.env.REACT_APP_API_URL}/friends/exist/${id1}/${id2}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });
  if (!response.ok)
  {
    if (response.status === 401)
    {
      onBan();
    }
    return null;
  }
  const jsonData = await response.json();

  return jsonData as boolean;
}

async function addFriend(id1: number, id2: number, authToken: string, onBan: Function) {

  const response = await fetch(`${process.env.REACT_APP_API_URL}/friends/${id1}/${id2}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });
  if (!response.ok && response.status === 401)
    onBan();
}

async function removeFriend(id1: number, id2: number, authToken: string, onBan: Function) {

  const response = await fetch(`${process.env.REACT_APP_API_URL}/friends/${id1}/${id2}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });
  if (!response.ok && response.status === 401)
    onBan();
}

const UserComponent: React.FC<IUserProps> = ({
  id1,
  user,
  authToken,
}) => {

  let history = useHistory();

  const bannedHandler = useCallback(() => {
    alert("You're banned");
    history.replace('/');
  }, [history]);

  const [friend, setFriend] = useState<boolean>(false);

  const refreshFriend = useCallback(() => {
    getFriend(id1, user.id, authToken, bannedHandler).then(newRelationship => {
      if (newRelationship === null)
        return;
      setFriend(newRelationship);
    });
  }, [authToken, id1, user.id, bannedHandler]);

  const handleBefriend = async (id1: number, id2: number, authToken: string) => {
    await addFriend(id1, id2, authToken, bannedHandler);
    refreshFriend();
  };

  const handleUnfriend = async (id1: number, id2: number, authToken: string) => {
    await removeFriend(id1, id2, authToken, bannedHandler);
    refreshFriend();
  };

  useEffect(() => {
    // On setup, we update the friend
    refreshFriend();
  }, [friend, refreshFriend]);

  const linkHandler = (e: Event | undefined, link: string) => {
    if (!e) e = window.event;
    e!.cancelBubble = true;
    if (e?.stopPropagation) e!.stopPropagation();
    history.push(link);
  }

  // This is highly ironic. If you're reading this, please have a fantastic day.
  const handlerHandler = (e: Event | undefined, handlerFunction: Function) => {
    if (!e) e = window.event;
    e!.cancelBubble = true;
    if (e?.stopPropagation) e!.stopPropagation();
    handlerFunction();
  }

  return (
    id1 !== user.id ?
      <div className="cursor-pointer" onClick={(e) => linkHandler(e as unknown as Event, `/users/${user.name}`)}>
        <div className="flex flex-row bg-purple-900 bg-opacity-50 hover:bg-opacity-75 text-black px-4 shadow rounded-lg py-2 mb-2 items-center">
          <div className="flex flex-1 flex-row items-center">
            <MessageAvatar user={user} />
            <p className="px-4 text-white text-xl ">{user.name}</p>
          </div>
          {friend ? (<button className="cursor-pointer px-8 py-2 mr-2 bg-red-400 rounded-lg text-red-700 text-lg font-bold border-4 border-solid hover:bg-red-500 hover:text-red-800 border-red-600 hover:border-red-700" onClick={(e) => handlerHandler(e as unknown as Event, () => handleUnfriend(id1, user.id, authToken))}>Unfriend</button>)
            : <button className="cursor-pointer px-8 py-2 mr-2 bg-green-400 rounded-lg text-green-700 text-lg font-bold border-4 border-solid hover:bg-green-500 hover:text-green-800 border-green-600 hover:border-green-700" onClick={(e) => handlerHandler(e as unknown as Event, () => handleBefriend(id1, user.id, authToken))} >Befriend</button>}

          <div onClick={(e) => linkHandler(e as unknown as Event, `/chats/dms/` + user.name)}>
            <div className="font-ok px-8 bg-blue-400 rounded-lg text-blue-700 hover:bg-blue-500 hover:text-blue-800 py-2 font-bold text-lg border-4 border-solid border-blue-600 hover:border-blue-700">
              Direct message
            </div>
          </div>
        </div>
      </div>
      : null
  );
}

export default UserComponent;
