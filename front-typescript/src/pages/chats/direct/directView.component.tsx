import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { DirectMessageUpdate } from "../chats.types";
import DirectMessageList from "./directMessageList.component";
import DirectMessageComposer from "./directMessageComposer.component";
import { Settings } from "../../../App.types";
// var uuid = require('uuid');

interface DirectViewProps {
  authToken: string,
  userId: number
  gameSettings: Settings
}

// The parameters we expect in the URL.
interface DirectRouteParams {
  target: string
}

const DirectView: React.FC<DirectViewProps> = ({ authToken, userId, gameSettings }) => {

  const { target } = useParams<DirectRouteParams>();
  const [socket, setSocket] = useState<Socket>(() => io(process.env.REACT_APP_SOCKET_BASE + ":" + process.env.REACT_APP_PORT_TWO, {
    auth: {
      token: authToken
    }
  }));
  const [messages, setMessages] = useState<DirectMessageUpdate[]>([]);
  const [gameRoomName, setGameRoomName] = useState<string>('no game room');

  useEffect(() => {

    // Handle the messages that were sent before we joined
    socket.on("initialDirectMessages", (msg) => {
      // Receive an array of messages
      const newMessages = msg as DirectMessageUpdate[];
      // Right now, we sort them on front, maybe we should also sort them on back
      newMessages.sort((a, b) => a.id - b.id);
      // Set the state directly
      setMessages(newMessages);
    });

    // Once someone sends a message, we receive this event
    socket.on("newDirectMessage", (msg) => {
      const newMessage = msg as DirectMessageUpdate; // we receive a single update
      setMessages((oldMessages) => {
        if (oldMessages) {
          // Add the new one to the end
          return [...oldMessages, newMessage];
        }
        // If this is the first message, we have to set the state to an array
        return [newMessage];
      });
    });

    // Once someone sends a message, we receive this event
    socket.on("newDirectInvite", (msg, gameRoomName) => {
      const newMessage = msg as DirectMessageUpdate; // we receive a single update
      setMessages((oldMessages) => {
        setGameRoomName(gameRoomName);
        if (oldMessages) {
          // Add the new one to the end
          return [...oldMessages, newMessage];
        }
        // If this is the first message, we have to set the state to an array
        return [newMessage];
      });
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

    // Ask to add us to this room and send us the initial messages.
    socket.emit("requestJoinDm", target);

    // On window/tab close, disconnect socket
    window.addEventListener('beforeunload', () => {
      socket.disconnect();
    }, false);

    // On component unmount, disconnect socket
    return function cleanup() {
      // socket.disconnect();
    };

  }, [socket, target, authToken]); // We only re-run setup if room name or socket change
  // (In other words, we don't.)

  return (
    <div>

      <h2>Direct conversaton with: {target}</h2>
        <DirectMessageList messages={messages} userId={userId} authToken={authToken}
                            socket={socket} gameRoomName={gameRoomName} gameSettings={gameSettings} />
        <DirectMessageComposer socket={socket} interlocutor={target} />
    </div>
  );
}


export default DirectView;