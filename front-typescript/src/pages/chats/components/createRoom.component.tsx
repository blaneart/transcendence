import React, { useState } from 'react';

async function createRoom(authToken: string, name: string) {
  // Perform the request to backend
  const response = await fetch(`http://127.0.0.1:3000/chat/rooms/${name}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });
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
      <form onSubmit={submitHandler}>
        <input type="text" onChange={(e) => {
          setRoomName(e.target.value)
        }} />
        <input type="submit" value="Submit" />
      </form>
    </div>
  );
}

export default CreateRoom;