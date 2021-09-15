import { useState, useEffect } from "react";
import {
  Switch,
  Route,
  useLocation,
  useHistory,
} from "react-router-dom";
import Menu from "./components/menu/menu.component";
import Header from "./components/header/header.component";
import Game from "./pages/game/game.component";
import Users from "./pages/users/users.component";
import Friends from "./pages/friends/friends.component";

import Chats from "./pages/chats/chats.component";
import { User } from './App.types';
import OfflineGame from "./pages/offline-game/offline-game.component";
import "./App.scss";
import Difficulty from "./components/difficulty-lvl/difficulty-lvl.component";
import Map from "./components/maps-chooser/maps-chooser.component";
import FakeUserCreator from "./pages/chats/components/fakeUserCreator.components";
import Watch from "./pages/watch/watch.component";
import Room from "./pages/watch/components/room.component";
const ENDPOINT = "http://127.0.0.1:3003";



interface IState {
  user: User | null;
}

interface AuthResponse {
  twofa: boolean,
  user: User | null;
  access_token: string;
}

async function process42ApiRedirect(code: string): Promise<AuthResponse> {
  const data = {
    code: code
  };
  const response = await fetch('http://127.0.0.1:3000/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  //   console.log(data);
  const jsonData = await response.json();
  return jsonData as AuthResponse;
}

async function updateStatus(
  setUser: Function,
  authToken: string,
) {
  let newStatus = 1;
  const data = {
    value: newStatus,
  };

  const response = await fetch("http://127.0.0.1:3000/account/setStatus", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(data),
  });

  const jsonData = await response.json();
  const userUpdated = jsonData as User;

  setUser(userUpdated);
}

// Use a temporary grant and a 2fa code to obtain the permanent JWT
async function validate2fa(code: string, tempAuthCode: string): Promise<any> {
  const data = {
    code: code
  };
  const response = await fetch('http://127.0.0.1:3000/auth/check2fa', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tempAuthCode}`
    },
    body: JSON.stringify(data),
  });
  //   console.log(data);
  const jsonData = await response.json();
  return jsonData as AuthResponse;
}


async function set42User(setUser: Function, setAuthToken: Function, code: string) {
  let authResponse: AuthResponse = await process42ApiRedirect(code);
  // If user has 2fa, we need to confirm 2fa first
  if (authResponse.twofa) {
    const twofaCode = window.prompt("Please enter your 2fa code");
    if (!twofaCode) {
      alert('Next time, enter the code.');
      return;
    }
    authResponse = await validate2fa(twofaCode, authResponse.access_token); // rewrite authResponse with the complete one
    if (!authResponse.user) // if the backend didn't send us the user, the code wasn't OK
    {
      alert('Wrong or expired code. Try again.');
      return;
    }
  }

  setUser(authResponse.user);
  setAuthToken(authResponse.access_token);
  updateStatus(setUser, authResponse.access_token);
  // Save user in browser state
  localStorage.setItem("pongUser", JSON.stringify(authResponse.user));
  localStorage.setItem("pongToken", authResponse.access_token);
}

async function getMe(authToken: string): Promise<User> {

  const response = await fetch('http://127.0.0.1:3000/profile/me', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
  });
  //   console.log(data);
  const jsonData = await response.json();
  return jsonData as User;
}

function logoutHandler()
{
  return function () {
    localStorage.removeItem("pongUser");
    localStorage.removeItem("pongToken");
  };
}

function App() {
  const [user, setUser] = useState<IState["user"]>();
  const [authToken, setAuthToken] = useState("");

  let history = useHistory();
  const { search } = useLocation();
  

  useEffect(() => {
    
    var searchParams: URLSearchParams = new URLSearchParams(search);
    const localStoragePongToken: string | null = localStorage.getItem(
      "pongToken"
    );
    if (authToken === "" && localStoragePongToken !== null) {
      setAuthToken(localStoragePongToken);
    }
    if (!user && localStoragePongToken !== null) {
      getMe(localStoragePongToken).then((me: User) => setUser(me));
    }

    if (searchParams.get("code")) {
      // if we catch an auth redirect from 42 api
      let code: string | null = searchParams.get("code");
      if (code) {
        set42User(setUser, setAuthToken, code);
        history.replace("/");
      }
    }
  }, [authToken, history, user, search]);

  
  let difficulty = {number: 4};
  var map = {map: 0, powerup: false};

 
  return (
    <div className="App">
      <Header authToken={authToken} user={user} logoutHandler={logoutHandler()} setUser={setUser} setAuthToken={setAuthToken} />
      <Switch>
        <Route exact path="/">
          <Menu user={user}/>
        </Route>
        <Route path="/playbots">
          <Map history={history} map={map}/>
        </Route>
        <Route path="/offline-game">
          <OfflineGame user={user} setUser={setUser} authToken={authToken} difficultyLvl={difficulty} map={map}/>
          <Difficulty difficultyLvl={difficulty}/>
        </Route>
        <Route path="/cheats">
          <FakeUserCreator setAuthToken={setAuthToken} setUser={setUser}/>
        </Route>
      </Switch>
      {authToken !== "" ?
      <Switch>
        <Route path="/play">
          <Game user={user} setUser={setUser} authToken={authToken} />
        </Route>
        <Route path="/chats">
          {user ? <Chats authToken={authToken} setAuthToken={setAuthToken} setUser={setUser} userId={user.id} /> : <p>Please log in</p> }
        </Route>
        <Route path="/users">
          {user ? <Users user={user} setUser={setUser} authToken={authToken} setAuthToken={setAuthToken} /> : <p>Please log in</p>}
        </Route>
        <Route path="/friends">
          {user ? <Friends user={user} setUser={setUser} authToken={authToken} setAuthToken={setAuthToken} /> : <p>Please log in !</p>}
        </Route>
        <Route exact path="/watch">
          <Watch />
        </Route>
        <Route
        exact
        path="/watch/:room"
        component={Room}/>

      </Switch>
      : <p></p>}
    </div>
  );
}

export default App;
