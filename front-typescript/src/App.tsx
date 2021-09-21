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
import maps from './components/maps-chooser/maps.component'

import Chats from "./pages/chats/chats.component";
import GameSettings from "./pages/game-settings/game-settings.component";
import { User, Settings } from "./App.types";
import OfflineGame from "./pages/offline-game/offline-game.component";
import "./App.scss";
import Difficulty from "./components/difficulty-lvl/difficulty-lvl.component";
import Map from "./components/maps-chooser/maps-chooser.component";
import FakeUserCreator from "./pages/chats/components/fakeUserCreator.components";
import Watch from "./pages/watch/watch.component";
import Room from "./pages/watch/components/room.component";

import AdminPanel from "./pages/adminPanel/adminPanel";
import Watchdog from "./components/watchdog.component";
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
  // Save token in browser state
  localStorage.setItem("pongToken", authResponse.access_token);
}

async function getMe(authToken: string): Promise<User | null> {

  const response = await fetch('http://127.0.0.1:3000/profile/me', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      alert("You're banned.");
      return null;
    }
    alert("Couldn't authenticate");
    return null;
  }
  //   console.log(data);
  const jsonData = await response.json();
  return jsonData as User;
}

function logoutHandler() {
  return function () {
    localStorage.removeItem("pongToken");
  };
}

function App() {
  const [user, setUser] = useState<IState["user"]>();
  const [authToken, setAuthToken] = useState("");

  let history = useHistory();
  const { search } = useLocation();

  const completeLogOut = () => {
    localStorage.removeItem("pongToken");
    setUser(null);
    setAuthToken("");
  }

  const bannedHandler = () => {
    completeLogOut();
    history.replace("/");
  }

  useEffect(() => {
    var searchParams: URLSearchParams = new URLSearchParams(search);
    const localStoragePongToken: string | null = localStorage.getItem(
      "pongToken"
    );
    if (!user && authToken === "" && localStoragePongToken !== null) {
      setAuthToken(localStoragePongToken);
      getMe(localStoragePongToken).then((me: User | null) => me ? setUser(me) : completeLogOut());
    }
    else if (!user && authToken && authToken !== "") {
      getMe(authToken).then((me: User | null) => me ? setUser(me) : completeLogOut());
    }

    if (searchParams.get("code")) {
      // if we catch an auth redirect from 42 api
      let code: string | null = searchParams.get("code");
      if (code) {
        set42User(setUser, setAuthToken, code);
        history.replace("/");
      }
    }
  }, [authToken, user, history, search]);


  let difficulty = { number: 4 };

  var initSettings = {} as Settings;
  initSettings.ranked = false; initSettings.maps = 0; initSettings.powerUps = false;
  const [settings, setSettings] = useState<Settings>(initSettings);

  return (
    <div className="App">
      <Header authToken={authToken} user={user} logoutHandler={logoutHandler()} setUser={setUser} setAuthToken={setAuthToken} />
      <Switch>
        <Route exact path="/">
          <Menu user={user} />
        </Route>
        <Route path="/playbots">
          <Map history={history} />
        </Route>
        <Route exact path="/game-settings">
          <GameSettings settings={settings} setSettings={setSettings} />
        </Route>
        <Route path="/offline">
          <Difficulty difficultyLvl={difficulty} />
          <OfflineGame authToken={authToken} difficultyLvl={difficulty} map={maps} />
        </Route>
        <Route path="/cheats">
          <FakeUserCreator setAuthToken={setAuthToken} setUser={setUser} />
        </Route>
      </Switch>
      {authToken !== "" ?

        <Switch>
          <Route path="/play/:gameRoomName/:userId">
            <Watchdog authToken={authToken} bannedHandler={bannedHandler}>
              <Game user={user} setUser={setUser} authToken={authToken} gameSettings={settings} />
            </Watchdog>
          </Route>
          <Route path="/chats">
            <Watchdog authToken={authToken} bannedHandler={bannedHandler}>
              {user ? <Chats authToken={authToken} setAuthToken={setAuthToken} setUser={setUser} userId={user.id} gameSettings={settings} /> : <p>Please log in</p>}
            </Watchdog>
          </Route>
          <Route path="/users">
            <Watchdog authToken={authToken} bannedHandler={bannedHandler}>
              {user ? <Users user={user} setUser={setUser} authToken={authToken} setAuthToken={setAuthToken} /> : <p>Please log in</p>}
            </Watchdog>
          </Route>
          <Route path="/friends">
            <Watchdog authToken={authToken} bannedHandler={bannedHandler}>
              {user ? <Friends user={user} setUser={setUser} authToken={authToken} setAuthToken={setAuthToken} /> : <p>Please log in !</p>}
            </Watchdog>
          </Route>
          <Route path="/adminPanel">
            <Watchdog authToken={authToken} bannedHandler={bannedHandler}>
              {user ? <AdminPanel user={user} authToken={authToken}
              /> : <p>Please log in !</p>}
            </Watchdog>
          </Route>
          <Route exact path="/watch">
            <Watchdog authToken={authToken} bannedHandler={bannedHandler}>
              <Watch />
            </Watchdog>
          </Route>
          <Route
            exact
            path="/watch/:room"
          >
            <Watchdog authToken={authToken} bannedHandler={bannedHandler}>
              <Room />
            </Watchdog>
          </Route>

        </Switch>
        : <p></p>
      }
    </div >
  );
}

export default App;
