import React, { useEffect, useState } from "react";

import { User } from "../../../App.types";
import { Direct } from "../chats.types";

interface DirectLinkProps {
  authToken: string,
  userId: number,
  direct: Direct
}

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
function directId(direct: Direct, userId: number): number
{
  if (userId === direct.userA)
    return direct.userB;
  return direct.userA;
}

async function directName(authToken: string, direct: Direct, userId: number)
{
  const convoUserId = directId(direct, userId);
  const user = await getUser(authToken, convoUserId);
  return user.name;
}


const DirectLink: React.FC<DirectLinkProps> = ({authToken, userId, direct}) => {
  
  const [convoName, setConvoName] = useState<string>();

  useEffect(() => {
    console.log(`Rendering for direct bw ${direct.userA} and ${direct.userB}`);
    directName(authToken, direct, userId).then((name) => setConvoName(name));
  }, []);
  
  
  if (convoName)
  {
    return (
      <div>
        <a href={`/chats/dms/${convoName}`}>{convoName}</a>
      </div>
    );
  }
  else
  {
    return <p>Loading...</p>
  }
  
};

export default DirectLink