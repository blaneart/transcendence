import React, { useEffect, useState } from "react";
import { User } from "../../../App.types";
import { Direct } from "../chats.types";

interface DirectLinkProps {
  authToken: string,
  userId: number,
  direct: Direct
}

// Get the user instance for a given userId
async function getUser(authToken: string, userId: number): Promise<User> {
  const response = await fetch(`http://127.0.0.1:3000/profile/${userId}/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });
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
  return user.name;
}

const DirectLink: React.FC<DirectLinkProps> = ({ authToken, userId, direct }) => {

  const [convoName, setConvoName] = useState<string>();

  useEffect(() => {
    directName(authToken, direct, userId).then((name) => setConvoName(name));
  }, [authToken, direct, userId]);

  if (convoName) {
    return (
      <div>
        <a href={`/chats/dms/${convoName}`}>{convoName}</a>
      </div>
    );
  }
  else {
    return <p>Loading...</p>
  }

};

export default DirectLink