import { setupMaster } from "cluster";
import React, { useState } from "react";

interface FakeUserCreatorProps {
  setAuthToken: Function
  setUser: Function
}

interface User {
  id: string;
  name: string;
  id42: number;
  avatar: string;
  games: number;
  wins: number;
  twofa: boolean;
  twofaSecret: string;
  realAvatar: boolean
}

// Get the profile information
async function getMe(authToken: string): Promise<User> {

  // Make a request to backend
  const response = await fetch('http://127.0.0.1:3000/profile/me', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
  });
  // Return the user info
  const jsonData = await response.json();
  return jsonData as User;
}


const FakeUserCreator: React.FC<FakeUserCreatorProps> = ({ setAuthToken, setUser }) => {
  const [newName, setNewName] = useState<string>();

  const submitHandler = (e: any) => {
    e.preventDefault();
    // Make a response to backend
    const response = fetch(
      `http://127.0.0.1:3000/fakeUser/${newName}/`,
      {
        method: "POST"
      }
    ).then(
      (response) => response.json() // Parse as JSON
    ).then(
      (json) => {
        // Set auth token state
        setAuthToken(json.access_token);
        getMe(json.access_token).then((me)=>
        {
          // Set user state
          setUser(me);
          // Save persistent user state
          localStorage.setItem("pongUser", JSON.stringify(me));
        });
        // Save persistent token state
        localStorage.setItem("pongToken", json.access_token);
      }
    );
  }

  return <div>
    <p>Fake user creator. Use with caution</p>
    <form onSubmit={submitHandler}>
      <input type="text" name="" id="" onChange={(e) => setNewName(e.target.value)}/>
      <input type="submit" value="Send"/>
    </form>
  </div>
};

export default FakeUserCreator;