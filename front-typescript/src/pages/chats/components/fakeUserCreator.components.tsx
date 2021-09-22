import React, { useCallback, useState } from "react";
import { User } from '../../../App.types';


interface FakeUserCreatorProps {
  setAuthToken: Function
  setUser: Function
}


// Get the profile information
async function getMe(authToken: string): Promise<User | null> {

  // Make a request to backend
  const response = await fetch('http://127.0.0.1:3000/profile/me', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
  });

  if (!response.ok)
    return null;
  // Return the user info
  const jsonData = await response.json();
  return jsonData as User;
}


const FakeUserCreator: React.FC<FakeUserCreatorProps> = ({ setAuthToken, setUser }) => {
  const [newName, setNewName] = useState<string>();

  const submitHandler = async (e: any) => {
    e.preventDefault();
    // Make a response to backend
    const response = await fetch(
      `http://127.0.0.1:3000/fakeUser/${newName}/`,
      {
        method: "POST"
      });

    if (!response.ok) {
      if (response.status === 409) {
        return alert("Sorry, this user already exists. Please pick another name.");
      }
      return alert("Error creating fake user.");
    }

    const json = await response.json();

    // Set auth token state
    setAuthToken(json.access_token);
    getMe(json.access_token).then((me) => {
      // Set user state
      setUser(me);
      // Save persistent user state
      localStorage.setItem("pongUser", JSON.stringify(me));
    });
    // Save persistent token state
    localStorage.setItem("pongToken", json.access_token);
  }

  return <div>
    <p>Fake user creator. Use with caution</p>
    <form onSubmit={submitHandler}>
      <input type="text" name="" id="" onChange={(e) => setNewName(e.target.value)} />
      <input type="submit" value="Send" />
    </form>
  </div>
};

export default FakeUserCreator;