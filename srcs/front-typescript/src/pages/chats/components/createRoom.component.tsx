import React, { useState } from 'react';
import StyledSubmit from './styledSubmit.component';
import StyledTextInput from './styledTextInput.component';

async function createRoom(authToken: string, name: string) {
  // Perform the request to backend
  const response = await fetch(`${process.env.REACT_APP_API_URL}/chat/rooms/${name}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });
  if (!response.ok)
  {
    if (response.status === 409)
      alert("Room with this name already exists. Please pick another name.");
    else
      alert("Error creating room.")
  }
  return response;
}

// We need a token to auth, and a way to return a created room.
interface CreateRoomProps {
  authToken: string
  onCreate: Function
}

const CreateRoom: React.FC<CreateRoomProps> = ({ authToken, onCreate }) => {
  const [roomName, setRoomName] = useState<string>("");

  // A handler for our form
  const submitHandler = (event: any) => {
    // Prevent the default submit action
    event.preventDefault();
    // Make sure the room name isn't empty
    if (roomName !== "") {
      // Make the backend call and propagate the change
      createRoom(authToken, roomName).then(() => onCreate());
    }
  }

  return (
    <div>
      <h5 className="text-xl mb-2 mt-4">Create a new room:</h5>
      <form onSubmit={submitHandler} className="flex flex-row">
        <StyledTextInput onChange={(e: any) => {
          setRoomName(e.target.value)
        }} />
        <StyledSubmit value="Create room"/>
      </form>
    </div>
  );
}

export default CreateRoom;