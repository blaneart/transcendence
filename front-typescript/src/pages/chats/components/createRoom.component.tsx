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
}

interface CreateRoomProps {
  authToken: string
  onCreate: Function
}

const CreateRoom: React.FC<CreateRoomProps> = ({ authToken, onCreate }) => {
  const [roomName, setRoomName] = useState<string>("");

  const submitHandler = (event: any) => {
    event.preventDefault();
    if (roomName !== "")
    {
      createRoom(authToken, roomName);
      onCreate();
    }
  }

  return (
    <form onSubmit={submitHandler}>
      <label >
        Create a new room:
        <input type="text" onChange={(e) => {
          console.log(`Change to ${e.target.value}`);
          setRoomName(e.target.value)
          }} />
      </label>
      <input type="submit" value="Submit" />
    </form>
  );
}

export default CreateRoom;