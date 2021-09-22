import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { io, Socket } from "socket.io-client";
import Composer from "./composer.component";
import { useHistory } from 'react-router-dom';
import RoomAdminPanel from "./roomAdminPanel.component";
import { Room, MessageType } from "../chats.types";
import MessageList from "./messageList.component";
import { Settings } from "../../../App.types";
// import { settings } from "cluster";
// var uuid = require('uuid');

// We require a token passed as parameter
interface RoomParams {
  authToken: string
  userId: number
  gameSettings: Settings,
};

// The parameters we expect in the URL.
interface RoomRouteParams {
  roomName: string
}

// Get the current room instance
async function getRoom(authToken: string, roomName: string): Promise<Room | null> {
  // Send the request to the backend
  const response = await fetch(
    `http://127.0.0.1:3000/chat/rooms/${roomName}/`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });
  if (!response.ok)
    return null;
  return await response.json() as Room;
}

// Check if we're muted in this chat
async function getMuted(authToken: string, roomName: string): Promise<boolean | null> {
  const response = await fetch(`http://127.0.0.1:3000/chat/muted/${roomName}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });
  return await response.json();
}

// Check until when we're muted in this chat
async function getMutedUntil(authToken: string, roomName: string) {
  const response = await fetch(`http://127.0.0.1:3000/chat/muted/${roomName}/until/`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });
  return await response.json();
}

async function getAmAdmin(authToken: string, roomName: string) {
  const response = await fetch(`http://127.0.0.1:3000/chat/admins/${roomName}/me/`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });
  return await response.json();
}


const RoomView: React.FC<RoomParams> = ({ authToken, userId, gameSettings }) => {

  const { roomName } = useParams<RoomRouteParams>();
  const [socket] = useState<Socket>(() => io("ws://127.0.0.1:8080", {
    auth: {
      token: authToken
    }
  }));
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [muted, setMuted] = useState<boolean>(false);
  const [amAdmin, setAmAdmin] = useState<boolean>(false);

  const [room, setRoom] = useState<Room>();
  let history = useHistory();

  const [gameRoomName, setGameRoomName] = useState<string>('no room');


  useEffect(() => {
    // Get the current room instance
    getRoom(authToken, roomName).then((room) => setRoom(room));

    // Find out if we're muted
    getMuted(authToken, roomName).then(async (isMuted) => {
      // Set the state
      setMuted(isMuted);

      // Setup the re-check once (if) we get un-muted
      if (isMuted) {
        // Get the time when we're going to be unmuted
        const mutedUntil = new Date(await getMutedUntil(authToken, roomName));
        console.log(typeof mutedUntil);
        if (mutedUntil) {
          // Calculate how many ms it is going to take
          const now = new Date();
          const msToWait = mutedUntil.getTime() - now.getTime();
          // Schedule to re-check at that moment
          setTimeout(() => {
            getMuted(authToken, roomName).then((isMuted) => setMuted(isMuted));
          }, msToWait);
        }

      }
    });

    getAmAdmin(authToken, roomName).then((amAdminUpdate) => setAmAdmin(amAdminUpdate));

    // Handle the messages that were sent before we joined
    socket.on("initialMessages", (msg) => {
      // Receive an array of messages
      const newMessages = msg as MessageType[];
      // Right now, we sort them on front, maybe we should also sort them on back
      newMessages.sort((a, b) => a.id - b.id);
      // Set the state directly
      setMessages(newMessages);
    });

    // Once someone sends a message, we receive this event
    socket.on("newMessage", (msg) => {
      const newMessage = msg as MessageType; // we receive a single update
      setMessages((oldMessages) => {
        if (oldMessages) {
          // Add the new one to the end
          return [...oldMessages, newMessage];
        }
        // If this is the first message, we have to set the state to an array
        return [newMessage];
      });
    });

    socket.on("newInvite", (msg, gameRoomName) => {
      const newMessage = msg as MessageType; // we receive a single update
      setMessages((oldMessages) => {
        if (userId === newMessage.receiverId || userId === newMessage.senderID)
        {
          console.log('gameRoomName', gameRoomName)
          setGameRoomName(gameRoomName);
        }
        console.log('no new room name');
        if (oldMessages) {
          // Add the new one to the end
          return [...oldMessages, newMessage];
        }
        // If this is the first message, we have to set the state to an array
        
        return [newMessage];
      });
    });

    // When we get kicked out of the room, we have to return to the chat screen.
    socket.on("kickedOut", () => {
      alert("You were kicked out of this room");
      socket.disconnect();
      history.replace("/chats/");
    })

    // When we get banned from the room, we have to return to the chat screen.
    socket.on("banned", () => {
      alert("You are banned from this room");
      socket.disconnect();
      history.replace("/chats/");
    })

    // When the backend asks us for password
    socket.on("loginRequest", () => {

      // Get the password from the user
      let pass = undefined;
      while (!pass) {
        pass = window.prompt("Please type in your password", undefined);
      }
      // Send the event to backend
      socket.emit("login", { roomName: roomName, password: pass });
    })

    // Ask to add us to this room and send us the initial messages.
    socket.emit("requestJoin", roomName);

    // On window/tab close, disconnect socket
    window.addEventListener('beforeunload', () => {
      socket.disconnect();
    }, false);

    // If we get muted
    socket.on("muted", (minutes: number) => {

      // Update state
      setMuted(true);

      // Let the user know
      alert(`You're muted for ${minutes} minutes`);

      // Re-check if we're unmuted after minutes pass
      setTimeout(() => {
        getMuted(authToken, roomName).then((isMuted) => setMuted(isMuted));
      }, minutes * 60 * 1000);
    })

    // If we've been promoted, we instantly get the rights
    socket.on("promoted", (id) => {
      if (id === userId)
        setAmAdmin(true);
    })

    // Game invitation stuff by ablanar and thervieu
    
    socket.on("challengeAccepted", (gameRoomName) => {
      history.replace(`/play/${gameRoomName}/${userId}`);
    })


    // On component unmount, disconnect socket
    return function cleanup() {
      socket.disconnect();
    };

  }, [roomName, socket, authToken, history, userId]); // We only re-run setup if room name or socket change
  // (In other words, we don't.)

  let amOwner = false;
  if (room)
    amOwner = room.ownerID === userId;

    return (
    <div>

      <h2 className="text-center">Room: {roomName}</h2>
      <div className="md:flex md:flex-row">
          {room && (room.ownerID === userId) ? <RoomAdminPanel authToken={authToken} room={room}
                                                   userId={userId} socket={socket} /> : null}
        <div className="flex-1 flex flex-col">
          <div className="flex-1">
            {room ? <MessageList messages={messages} userId={userId} authToken={authToken} room={room}
                      socket={socket} amAdmin={amAdmin} amOwner={amOwner}
                      gameRoomName={gameRoomName} gameSettings={gameSettings} /> : null}
          </div>
          <div>
            <Composer socket={socket} roomName={roomName} muted={muted} amOwner={amOwner} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomView;