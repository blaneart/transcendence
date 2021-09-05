import { Switch, Route } from "react-router";
import RoomList from "./components/roomList.component";
import RoomView from "./components/roomView.component";

// We require to authenticate our chat sockets.
interface ChatsProps {
  authToken: string
}

const Chats: React.FC<ChatsProps> = ({ authToken }) => {

  return (
    <div>
    <Switch>
      <Route path="/chats/:roomName">
        {authToken === "" ? <p>Please log in.</p> : <RoomView authToken={authToken}/>}
      </Route>
      <Route exact path="/chats/">
        {authToken === "" ? <p>Please log in.</p> : <RoomList authToken={authToken} />}
      </Route>
    </Switch>
    </div>
  );
};

export default Chats;