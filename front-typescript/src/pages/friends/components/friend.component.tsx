import React, { useCallback, useEffect, useState } from "react";
import { User } from '../users.types';
import { useHistory } from "react-router-dom";
import MessageAvatar from "../../chats/components/messageAvatar.component";

interface IFriendProps {
  id1: number;
  id2: number;
  authToken: string;
}


async function getFriendById(id2: number, authToken: string): Promise<User | null> {
  const data = {
    value: id2,
  };
  const response = await fetch(process.env.REACT_APP_API_URL + "/userById", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify(data),
  });
  if (!response.ok)
    return null;
  const jsonData = await response.json();

  return jsonData as User;
}

async function addBackFriend(id1: number, id2: number, authToken: string, setBool: Function) {
  setBool(true);
  await fetch(`${process.env.REACT_APP_API_URL}/friends/${id1}/${id2}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });
}

async function removeFriend(id1: number, id2: number, authToken: string, setBool: Function) {
  setBool(false);
  await fetch(`${process.env.REACT_APP_API_URL}/friends/${id1}/${id2}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });
}

const Friend: React.FC<IFriendProps> = ({ id1, id2, authToken }) => {

  let history = useHistory();

  const [friendUser, setFriend] = useState<User>();
  const [bool, setBool] = useState<Boolean>(true);

  const refreshFriend = useCallback(() => {
    getFriendById(id2, authToken).then(newFriend => {
      if (newFriend === null)
        return null;
      setFriend(newFriend);
    });
  }, [authToken, id2]);

  const handleUnfriend = async (id1: number, id2: number, authToken: string, setBool: Function) => {
    await removeFriend(id1, id2, authToken, setBool);
    refreshFriend();
  };

  const handleAddBackFriend = async (id1: number, id2: number, authToken: string, setBool: Function) => {
    await addBackFriend(id1, id2, authToken, setBool);
    refreshFriend();
  };

  useEffect(() => {
    // On setup, we update the friend
    refreshFriend();
  }, [refreshFriend]);


  const linkHandler = (e: Event | undefined, link: string) => {
    if (!e) var e = window.event;
    e!.cancelBubble = true;
    if (e?.stopPropagation) e!.stopPropagation();
    history.push(link);
  }

  // This is highly ironic. If you're reading this, please have a fantastic day.
  const handlerHandler = (e: Event | undefined, handlerFunction: Function) => {
    if (!e) var e = window.event;
    e!.cancelBubble = true;
    if (e?.stopPropagation) e!.stopPropagation();
    handlerFunction();
  }
  let str = (friendUser && friendUser.status === 0) ? "Offline" : (friendUser && friendUser.status === 1) ? "Online" : "In a game"
  return (
    friendUser ?
      <div>
        <div className="cursor-pointer" onClick={(e) => linkHandler(e as unknown as Event, `/users/${friendUser.name}`)}>
          <div className="flex flex-row bg-purple-900 bg-opacity-50 hover:bg-opacity-75 text-black px-4 shadow rounded-lg py-2 mb-2 items-center">
            <div className="flex flex-1 flex-row items-center">
              <MessageAvatar user={friendUser} />
              <p className="text-white px-4 text-xl">{friendUser.name}</p>
            </div>
            {bool ? <button className="cursor-pointer px-8 py-2 mr-2 bg-red-400 rounded-lg text-red-800 text-lg font-bold border-4 border-red-500 border-solid hover:bg-red-500 hover:text-white" onClick={(e) => handlerHandler(e as unknown as Event, () => handleUnfriend(id1, friendUser.id, authToken, setBool))}>Unfriend</button> 
           : <button className="cursor-pointer px-8 py-2 mr-2 bg-green-400 rounded-lg text-green-800 text-lg font-bold border-4 border-green-500 border-solid hover:bg-green-500 hover:text-white" onClick={(e) => handlerHandler(e as unknown as Event, () => handleAddBackFriend(id1, friendUser.id, authToken, setBool))}>Add Back</button>}
            <div onClick={(e) => linkHandler(e as unknown as Event, `/chats/dms/${friendUser.name}`)}>
              <div className="font-ok font-bold px-8 py-2 bg-blue-400 text-lg text-blue-800 hover:bg-blue-500 hover:text-white rounded-lg border-4 border-solid border-blue-500">
              Direct message
              </div>
            </div>
            {friendUser.status == 0 ? 
            <p className="px-5 py-2 text-lg text-red-800 bg-red-400 rounded-lg border-4 border-solid border-red-600" >
                Offline
            </p> : friendUser.status == 1 ?
            <p className="px-5 py-2 text-lg text-yellow-800 bg-yellow-400 rounded-lg border-4 border-solid border-yellow-600" >
                In a game
            </p> :
            <p className="px-5 py-2 text-lg text-green-800 bg-green-400 rounded-lg border-4 border-solid border-green-600" >
                Online
            </p>}
          </div>

        </div>

      </div>
      : <p>Not Found</p>
  );
}

export default Friend;
