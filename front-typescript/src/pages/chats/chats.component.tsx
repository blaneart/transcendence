import { io } from "socket.io-client";
import React, { useEffect } from "react";
import { useParams, Switch, Route } from "react-router";
import RoomList from "./components/roomList.component";
import RoomView from "./components/roomView.component";

// // handle the event sent with socket.send()
// socket.on("message", data => {
//   console.log(data);
// });

// // handle the event sent with socket.emit()
// socket.on("greetings", (elem1, elem2, elem3) => {
//   console.log(elem1, elem2, elem3);
// });
const socket = io("ws://127.0.0.1:8080");

socket.on("connect", () => {
  socket.emit("message", "here is some text");
});

socket.on("response", (msg) => {
  console.log(msg);
});

// Create an interface to pass to React Router
// so that it can safely give us the room nanme
interface ChatURLParams {
  roomName: string
}

interface ChatsProps {
  authToken: string
}

const Chats: React.FC<ChatsProps> = ({ authToken }) => {

  return (
    <div>
    <Switch>
      <Route path="/chats/:roomName">
        <RoomView authToken={authToken}/>
      </Route>
      <Route exact path="/chats/">
        <RoomList authToken={authToken} />
      </Route>
    </Switch>
    </div>
  );
};

export default Chats;