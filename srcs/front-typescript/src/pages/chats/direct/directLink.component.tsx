import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { User } from "../../../App.types";
import { Direct } from "../chats.types";
import MessageAvatar from "../components/messageAvatar.component";

interface DirectLinkProps {
  authToken: string,
  userId: number,
  direct: Direct
}

// Get the user instance for a given userId
async function getUser(authToken: string, userId: number): Promise<User | null> {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/profile/${userId}/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });
  if (!response.ok)
    return null;
  // Read response as JSON
  const jsonData = await response.json();
  // Cast response to an array of rooms
  return jsonData as User;
}

// The id of the person you're talking to in a given direct
function directId(direct: Direct, userId: number): number {
  // If we are user A, we're talking to user B
  if (userId === direct.userA)
    return direct.userB;
  return direct.userA;
}

// The name of the person you're talking to
async function directName(authToken: string, direct: Direct, userId: number) {
  // Their id
  const convoUserId = directId(direct, userId);
  // Get their info from the backend
  const user = await getUser(authToken, convoUserId);
  return user as User;
}

const DirectLink: React.FC<DirectLinkProps> = ({ authToken, userId, direct }) => {

  const [interlocutor, setInterlocutor] = useState<User>();

  useEffect(() => {
    directName(authToken, direct, userId).then((user) => setInterlocutor(user));
  }, [authToken, direct, userId]);

  if (interlocutor) {
    return (
      <div className="flex flex-row items-center py-2">
        <MessageAvatar user={interlocutor} />
        <Link className="px-2" to={`/chats/dms/${interlocutor.name}`}>{interlocutor.name}</Link>
      </div>
    );
  }
  else {
    return <p>Loading...</p>
  }

};

export default DirectLink