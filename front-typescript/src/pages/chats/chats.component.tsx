import { Switch, Route } from "react-router";
import RoomList from "./components/roomList.component";
import RoomView from "./components/roomView.component";
import FakeUserCreator from "./components/fakeUserCreator.components";
import DirectView from "./direct/directView.component";

// We require to authenticate our chat sockets.
interface ChatsProps {
  authToken: string,
  setAuthToken: Function
  setUser: Function
  userId: number
}

const Chats: React.FC<ChatsProps> = ({ authToken, setAuthToken, setUser, userId }) => {

  return (
    <div>
      <FakeUserCreator setAuthToken={setAuthToken} setUser={setUser}/>
    <Switch>
      <Route path="/chats/dms/:target">
        {authToken === "" ? <p>Please log in.</p> : <DirectView userId={userId} authToken={authToken}/>}
      </Route>
      <Route path="/chats/:roomName">
        {authToken === "" ? <p>Please log in.</p> : <RoomView userId={userId} authToken={authToken}/>}
      </Route>
      <Route exact path="/chats/">
        {authToken === "" ? <p>Please log in.</p> : <RoomList userId={userId} authToken={authToken} />}
      </Route>
    </Switch>
    </div>
  );
};

export default Chats;