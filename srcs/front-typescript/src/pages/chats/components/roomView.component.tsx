import React, { useCallback, useEffect, useState } from "react";
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
    `${process.env.REACT_APP_API_URL}/chat/rooms/${roomName}/`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });
  if (!response.ok)
  {
    if (response.status === 404)
    {
      alert('Room not found :(');
    }
    return null;
  }
  return await response.json() as Room;
}

// Check if we're muted in this chat
async function getMuted(authToken: string, roomName: string): Promise<boolean | null> {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/chat/muted/${roomName}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });
  if (!response.ok)
    return null;
  return await response.json();
}

// Check until when we're muted in this chat
async function getMutedUntil(authToken: string, roomName: string) {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/chat/muted/${roomName}/until/`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });
  if (!response.ok)
    return null;
  return await response.json();
}

async function getAmAdmin(authToken: string, roomName: string): Promise<boolean | null> {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/chat/admins/${roomName}/me/`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });
  if (!response.ok)
    return null;
  return await response.json();
}


const RoomView: React.FC<RoomParams> = ({ authToken, userId, gameSettings }) => {

  const { roomName } = useParams<RoomRouteParams>();
  const [socket, setSocket] = useState<Socket>(() => io(process.env.REACT_APP_SOCKET_BASE + ":" + process.env.REACT_APP_PORT_TWO, {
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


  const updateRoom = useCallback(() => {
    getRoom(authToken, roomName).then((update) => update !== null ? setRoom(update) : history.replace('/chats'));
  }, [authToken, roomName, history]);

  useEffect(() => {
    // Get the current room instance
    updateRoom();

    // Find out if we're muted
    getMuted(authToken, roomName).then(async (isMuted) => {
      // Set the state
      if (isMuted === null)
        return;

      setMuted(isMuted);

      // Setup the re-check once (if) we get un-muted
      if (isMuted) {
        // Get the time when we're going to be unmuted
        const mutedUntil = new Date(await getMutedUntil(authToken, roomName));
        if (mutedUntil) {
          // Calculate how many ms it is going to take
          const now = new Date();
          const msToWait = mutedUntil.getTime() - now.getTime();
          // Schedule to re-check at that moment
          setTimeout(() => {
            getMuted(authToken, roomName).then(isMuted => isMuted !== null ? setMuted(isMuted) : null);
          }, msToWait);
        }

      }
    });

    getAmAdmin(authToken, roomName).then((amAdminUpdate) => amAdminUpdate !== null ? setAmAdmin(amAdminUpdate) : null);

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
        if (userId === newMessage.receiverId || userId === newMessage.senderID) {
          if (newMessage.roomName)
            setGameRoomName(newMessage.roomName);
        }
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

    // When the room gets deleted, we get kicked out
    socket.on("roomDeleted", () => {
      alert("This room has been deleted");
      socket.disconnect();
      history.replace("/chats/");
    })

    // When the password is wrong, you get kicked out
    socket.on("wrongPassword", () => {
      alert("The password is wrong, sorry :( Please try again");
      socket.disconnect();
      history.replace("/chats/");
    })

    // When we get banned from the room, we have to return to the chat screen.
    socket.on("banned", () => {
      alert("You are banned from this room");
      socket.disconnect();
      history.replace("/chats/");
    })

    // When we get kicked out of the website, we get back to the main page and 
    // log out
    socket.on("unauthorized", () => {
      socket.disconnect();
      history.replace("/");
    })

    // When the backend asks us for password
    socket.on("loginRequest", () => {

      // Get the password from the user
      let pass = undefined;
      while (pass !== null && !pass) {
        pass = window.prompt("Please type in your password", undefined);
      }
      if (pass === null)
        history.replace('/chats');
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
        getMuted(authToken, roomName).then((isMuted) => isMuted !== null && setMuted(isMuted));
      }, minutes * 60 * 1000);
    })

    // If we've been promoted, we instantly get the rights
    socket.on("promoted", (id) => {
      if (id === userId)
        setAmAdmin(true);
    })

    // If we get an error, show it
    socket.on("error", (msg) => alert(msg));

    // Game invitation stuff by ablanar and thervieu

    socket.on("challengeAccepted", (sentGameRoomName) => {
      history.replace(`/play/${sentGameRoomName}/${userId}`);
    })

    socket.on("updateRoomStatus", (update: boolean) => {
      updateRoom();
    });

    socket.on("disconnect", (reason) => {
      // If our socket has disconnected not because we wanted it to
      if (reason !== "io client disconnect") {
        // Reconnect
        setSocket(io(process.env.REACT_APP_SOCKET_BASE + ":" + process.env.REACT_APP_PORT_TWO, {
          auth: {
            token: authToken
          }
        }));
      }
    })

    // On component unmount, disconnect socket
    return function cleanup() {
      socket.disconnect();
    };

  }, [roomName, socket, authToken, history, userId, updateRoom]); // We only re-run setup if room name or socket change
  // (In other words, we don't.)

  let amOwner = false;
  if (room)
    amOwner = room.ownerID === userId;

  const mainClasses = "flex-1 px-4 py-4 border border-b-0 bg-gray-900 text-gray-300 border-gray-600 rounded-tr-lg border-solid" + ( amOwner ? "" : " rounded-tl-lg");
  return (
    <div>

      <h2 className="text-center">Room: {roomName}</h2>
      <div className="md:flex md:flex-row">
        {room && (room.ownerID === userId) ? <RoomAdminPanel authToken={authToken} room={room}
          userId={userId} socket={socket} /> : null}
        <div className="flex-1 flex flex-col">
          <div className={mainClasses}>
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