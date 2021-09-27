import React, { useState } from "react";
import { Socket } from "socket.io-client";
import { User } from '../../App.types';


interface FakeUserCreatorProps {
  loggedIn: number | undefined
  setAuthToken: Function
  setUser: Function
  statusSocket: Socket
}


// Get the profile information
async function getMe(authToken: string): Promise<User | null> {

  // Make a request to backend
  const response = await fetch(process.env.REACT_APP_API_URL + "/profile/me", {
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


const FakeUserCreator: React.FC<FakeUserCreatorProps> = ({ loggedIn, setAuthToken, setUser, statusSocket}) => {
  const [newName, setNewName] = useState<string>("");

  const submitHandler = async (e: any) => {
    e.preventDefault();
    
    if (!newName)
      setNewName("");
    if (newName === "" || newName.length > 30)
    {
      newName === "" ? alert("No empty name please") : alert("Please write a name with less than 30 characters");
      return null;
    }
    const data = {
      id: loggedIn
    };
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/fakeUser/${newName}/`,
      {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
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
      statusSocket.emit('setUserId', me?.id);
      
      setUser(me);
    });
    // Save persistent token state
    sessionStorage.setItem("pongToken", json.access_token);
  }

  return <div className= "flex flex-col bg-">
    <p className="text-center font-xl">Fake user creator</p>
    <p className="text-center font-xl">Use with caution</p>
    <form className="text-center" onSubmit={submitHandler}>
      <input type="text" name="" id="" onChange={(e) => setNewName(e.target.value)} />
      <input className="cursor-pointer" type="submit" value="Send" />
    </form>
  </div>
};

export default FakeUserCreator;