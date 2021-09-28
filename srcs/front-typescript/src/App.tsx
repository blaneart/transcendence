import { useState, useEffect } from "react";
import {
  Switch,
  Route,
  useLocation,
  useHistory,
  Router,
} from "react-router-dom";
import Menu from "./components/menu/menu.component";
import Header from "./components/header/header.component";
import Game from "./pages/game/game.component";
import Users from "./pages/users/users.component";
import Friends from "./pages/friends/friends.component";

import Chats from "./pages/chats/chats.component";
import GameSettings from "./pages/game-settings/game-settings.component";
import { User, Settings } from "./App.types";
import OfflineGame from "./pages/offline-game/offline-game.component";
import "./App.scss";
import Difficulty from "./components/difficulty-lvl/difficulty-lvl.component";
import FakeUserCreator from "./pages/cheats/fakeUserCreator.components";
import Watch from "./pages/watch/watch.component";
import Room from "./pages/watch/components/room.component";
import Ruleset from "./pages/ruleset/ruleset.component";

import AdminPanel from "./pages/adminPanel/adminPanel";
import Watchdog from "./components/watchdog.component";
import Custom404 from "./pages/error-pages/404.component";
import { io, Socket } from "socket.io-client";
import  { ReactComponent as Logo }  from "./assets/blob-haikei-20.svg"


interface IState {
  user: User | null;
}

interface AuthResponse {
  twofa: boolean,
  user: User | null;
  access_token: string;
}

async function process42ApiRedirect(code: string): Promise<AuthResponse | null> {
  const data = {
    code: code
  };
  const response = await fetch(process.env.REACT_APP_API_URL + "/auth/login", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok)
    return null;
  const jsonData = await response.json();
  return jsonData as AuthResponse;

}

async function updateStatus(
  setUser: Function,
  authToken: string,
  prevStatus: number
) {
  let newStatus = (prevStatus === 0) ? 1 : 0;
  const data = {
    value: newStatus,
  };
  if (authToken && authToken !== "") {
    const response = await fetch(process.env.REACT_APP_API_URL + "/account/setStatus", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok)
      return;

    const jsonData = await response.json();
    const userUpdated = jsonData as User;
    setUser(userUpdated);
  }
}

// Use a temporary grant and a 2fa code to obtain the permanent JWT
async function validate2fa(code: string, tempAuthCode: string): Promise<AuthResponse | null> {
  const data = {
    code: code
  };
  const response = await fetch(process.env.REACT_APP_API_URL + "/auth/check2fa", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tempAuthCode}`
    },
    body: JSON.stringify(data),
  });

  if (!response.ok)
    return null;
  const jsonData = await response.json();
  return jsonData as AuthResponse;
}


async function set42User(setUser: Function, setAuthToken: Function, code: string, socket: Socket) {
  let authResponse: AuthResponse | null = await process42ApiRedirect(code);
  // If user has 2fa, we need to confirm 2fa first
  if (authResponse?.twofa) {
    const twofaCode = window.prompt("Please enter your 2fa code");
    if (!twofaCode) {
      alert('Next time, enter the code.');
      return;
    }
    authResponse = await validate2fa(twofaCode, authResponse.access_token); // rewrite authResponse with the complete one
    if (!(authResponse?.user)) // if the backend didn't send us the user, the code wasn't OK
    {
      alert('Wrong or expired code. Try again.');
      return;
    }
  }

  if (authResponse) {
    socket.emit("setUserId", authResponse.user?.id)

    setUser(authResponse.user);
    setAuthToken(authResponse.access_token);
    updateStatus(setUser, authResponse.access_token, 0);
    // Save token in browser state
    sessionStorage.setItem("pongToken", authResponse.access_token);
  }
  
}

async function getMe(authToken: string): Promise<User | null> {

  const response = await fetch(process.env.REACT_APP_API_URL + "/profile/me", {
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
  const jsonData = await response.json();
  return jsonData as User;
}

function logoutHandler() {
  return function () {
    sessionStorage.removeItem("pongToken");
  };
}


interface IGuest {
  user: User | undefined | null,
  settings: Settings,
  difficulty: any,
  authToken: string,
  setAuthToken: React.Dispatch<React.SetStateAction<string>>,
  setUser: React.Dispatch<React.SetStateAction<User | null | undefined>>,
  setSettings: React.Dispatch<React.SetStateAction<Settings>>
  bannedHandler: Function
  history: any
  statusSocket: Socket
  blobColor: string;
  setBlobColor: React.Dispatch<React.SetStateAction<string>>
}

const RouteGuest: React.FC<IGuest> = ({ user, settings, difficulty, authToken,
  setAuthToken, setUser, setSettings, history, statusSocket ,blobColor, setBlobColor}) => {
  return (
    <><Header authToken={authToken} user={user} logoutHandler={logoutHandler()} setUser={setUser} setAuthToken={setAuthToken} /><Switch>
      <Route exact path="/">
        <Menu user={user} />
      </Route>
      <Route exact path="/game-settings">
        <GameSettings settings={settings} setSettings={setSettings}  blobColor={blobColor} setBlobColor={setBlobColor}/>
      </Route>
      <Route exact path="/playbots">
        <Difficulty difficultyLvl={difficulty} />
        <OfflineGame authToken={authToken} difficultyLvl={difficulty} map={settings} />
      </Route>
      <Route exact path="/ruleset">
        <Ruleset user={user} />
      </Route>
      <Route exact path="/cheats">
        <FakeUserCreator loggedIn={0} setAuthToken={setAuthToken} setUser={setUser} statusSocket={statusSocket} />
      </Route>
      <Route path="*"> <Custom404 authToken={authToken} difficultyLvl={difficulty} map={settings} /></Route>
    </Switch>  </>);
}



const RouteAuth: React.FC<IGuest> = ({ user, settings, difficulty, authToken,
  setAuthToken, setUser, setSettings, bannedHandler, history, statusSocket , blobColor, setBlobColor}) => {
  return (
    <><Header authToken={authToken} user={user} logoutHandler={logoutHandler()} setUser={setUser} setAuthToken={setAuthToken} /><Switch>
      <Route exact path="/">
        <Menu user={user} />
      </Route>
      <Route path="/game-settings">
        <Watchdog authToken={authToken} bannedHandler={bannedHandler}>
          <GameSettings settings={settings} setSettings={setSettings}  blobColor={blobColor} setBlobColor={setBlobColor}/>
        </Watchdog>
      </Route>
      <Route path="/playbots">
        <Difficulty difficultyLvl={difficulty} />
        <OfflineGame authToken={authToken} difficultyLvl={difficulty} map={settings} />
      </Route>
      <Route path="/cheats">
        <FakeUserCreator loggedIn={user?.id} setAuthToken={setAuthToken} setUser={setUser} statusSocket={statusSocket} />
      </Route>
      <Route exact path="/play">
        <Watchdog authToken={authToken} bannedHandler={bannedHandler}>
          <Game user={user} setUser={setUser} authToken={authToken} gameSettings={settings} />
        </Watchdog>
      </Route>
      <Route exact path="/play/:gameRoomName/:userId">
        <Watchdog authToken={authToken} bannedHandler={bannedHandler}>
          <Game user={user} setUser={setUser} authToken={authToken} gameSettings={settings} />
        </Watchdog>
      </Route>
      <Route path="/ruleset">
        <Watchdog authToken={authToken} bannedHandler={bannedHandler}>
          {user ? <Ruleset user={user} /> : <p>Please log in</p>}
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
          {user ? <AdminPanel user={user} authToken={authToken} /> : <p>Please log in !</p>}
        </Watchdog>
      </Route>
      <Route exact path="/watch">
        <Watchdog authToken={authToken} bannedHandler={bannedHandler}>
          <Watch authToken={authToken}/>
        </Watchdog>
      </Route>
      <Route
        exact path="/watch/:room"
      >
        <Watchdog authToken={authToken} bannedHandler={bannedHandler}>
          <Room authToken={authToken}/>
        </Watchdog>
      </Route>
      <Route path="*"> <Custom404 authToken={authToken} difficultyLvl={difficulty} map={settings} /></Route>
    </Switch></>);
}

const ENDPOINT = process.env.REACT_APP_SOCKET_BASE + ":" + process.env.REACT_APP_PORT_ONE + "/status";

function App() {
  const [user, setUser] = useState<IState["user"]>();
  const [authToken, setAuthToken] = useState("");
  let history = useHistory();
  const { search } = useLocation();
  const [blobColor, setBlobColor] = useState<string>("#233175");
  const [socket] = useState<Socket>(() => {
    const initialState = io(ENDPOINT,
        {
          // auth: {
          //   token: authToken
          // }
        });
    return initialState;
  });

  const completeLogOut = () => {
    sessionStorage.removeItem("pongToken");
    setUser(null);
    setAuthToken("");
  }

  const bannedHandler = () => {
    completeLogOut();
    history.replace("/");
  }

  // Retreive local user storage
  useEffect(() => {
    const sessionStoragePongToken: string | null = sessionStorage.getItem(
      "pongToken"
    );
    if (sessionStoragePongToken)
      setAuthToken(sessionStoragePongToken);
  }, []);

  // Add an effect on unload
  useEffect(() => {
    return () => {
        socket.disconnect();
    }
  }, [socket]);

  useEffect(() => {
    if (user)
      socket.emit('setOnline', user.id);
  })

  // On auth token change, re-retreive user state
  useEffect(() => {
    const emitAndSetUser = (me: User) => {
      socket.emit('setUserId', me.id);
      setUser(me);
    }
    // If getMe fails (we're banned), log out
    if (authToken && authToken !== "")
      getMe(authToken).then((me: User | null) => me ? emitAndSetUser(me) : completeLogOut());
  }, [authToken, socket]);

  // On redirect, perform 42 login if necessary
  useEffect(() => {
    var searchParams: URLSearchParams = new URLSearchParams(search);

    // if we catch an auth redirect from 42 api
    let code: string | null = searchParams.get("code");
    if (code) {
      set42User(setUser, setAuthToken, code, socket);
      history.replace("/");
    }

  }, [search, history, socket]);

  let difficulty = { number: 4 };

  var initSettings = {} as Settings;
  initSettings.ranked = false; initSettings.maps = 0; initSettings.powerUps = false; initSettings.sounds = false;
  const [settings, setSettings] = useState<Settings>(initSettings);
  return (
    <div className="App">
      <div className="w-full" >
      <Logo fill={blobColor} stroke={blobColor} className="bg-img" style={{width:"inherit"}}/>
      </div>
      <Router history={history}>

        {!user ? <RouteGuest authToken={authToken}
          user={user} setUser={setUser} setAuthToken={setAuthToken} settings={settings} difficulty={difficulty}
          setSettings={setSettings} bannedHandler={bannedHandler} history={history} statusSocket={socket} blobColor={blobColor} setBlobColor={setBlobColor}/>
          :
          <RouteAuth authToken={authToken}
            user={user} setUser={setUser} setAuthToken={setAuthToken} settings={settings} difficulty={difficulty}
            setSettings={setSettings} bannedHandler={bannedHandler} history={history} statusSocket={socket} blobColor={blobColor} setBlobColor={setBlobColor}/>
        }
      </Router>
    </div >
  );
}

export default App;
