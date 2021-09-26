import { Switch, Route } from "react-router";
import RoomList from "./components/roomList.component";
import RoomView from "./components/roomView.component";
import DirectView from "./direct/directView.component";
import "./chats.scss";

import { Settings } from "../../App.types";

// We require to authenticate our chat sockets.
interface ChatsProps {
  authToken: string,
  setAuthToken: Function,
  setUser: Function,
  userId: number,
  gameSettings: Settings,
}

const Chats: React.FC<ChatsProps> = ({ authToken, setAuthToken, setUser, userId, gameSettings }) => {

  return (
    <div>
    <h2 className="text-xxl text-center">Chats</h2>
    <Switch>
      <Route path="/chats/dms/:target">
        {authToken === "" ? <p>Please log in.</p> : <DirectView userId={userId} authToken={authToken} gameSettings={gameSettings} />}
      </Route>
      <Route path="/chats/:roomName">
        {authToken === "" ? <p>Please log in.</p> : <RoomView userId={userId} authToken={authToken} gameSettings={gameSettings} />}
      </Route>
      <Route exact path="/chats/">
        {authToken === "" ? <p>Please log in.</p> : <RoomList userId={userId} authToken={authToken} gameSettings={gameSettings} />}
      </Route>
    </Switch>
    </div>
  );
};

export default Chats;