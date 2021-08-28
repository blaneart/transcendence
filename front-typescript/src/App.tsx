import React, { useState, useEffect } from "react";
import {
  Switch,
  Route,
  useLocation,
  useHistory,
} from "react-router-dom";
import HomePage from "./pages/homepage/homepage.component";
import Header from "./components/header/header.component";
import Game from "./pages/game/game.component";
import AccountPage from "./pages/account/account.component";
import "./App.css";
import { io, Socket } from 'socket.io-client';

const ENDPOINT = "http://127.0.0.1:3000";
interface User {
  id: string;
  name: string;
  avatar: string;
  games: number;
  wins: number;
  twofa: boolean;
  twofaSecret: string;
  realAvatar: boolean
}

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
  if (authResponse.twofa)
  {
    const twofaCode = window.prompt("Please enter your 2fa code");
    if (!twofaCode)
    {
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
  // Save user in browser state
  localStorage.setItem("pongUser", JSON.stringify(authResponse.user));
  localStorage.setItem("pongToken", authResponse.access_token);
}

function logoutHandler(setUser: Function, setAuthToken: Function) {
  return function () {
    localStorage.removeItem("pongUser");
    localStorage.removeItem("pongToken");
    setUser(null);
    setAuthToken(null);
  };
}


function receiveMessage(msg: string)
{
  console.log(msg);
}
function App() {
  const [user, setUser] = useState<IState["user"]>();
  const [authToken, setAuthToken] = useState("");
  const [isSigned, setIsSigned] = useState(false);
  const [response, setResponse] = useState("");

  const socket = (io(ENDPOINT));

  useEffect(() => {
    socket?.on('msgToClient', (msg: string) => {
      receiveMessage(msg);
    });
    socket?.emit("msgToServer", "lel");
  }, []);

  let history = useHistory();
    const  sendMessage = (event: any) => {
      console.log('front')
      event.preventDefault();
      socket?.emit("msgToServer", event.target.value );
    }

    useEffect(() => {
    const localStoragePongUser: string | null = localStorage.getItem(
      "pongUser"
    );
    const localStoragePongToken: string | null = localStorage.getItem(
      "pongToken"
    );
    if (!user && localStoragePongUser && localStoragePongToken) {
      const localStorageUser = JSON.parse(localStoragePongUser) as User;
      setUser(localStorageUser);
      setAuthToken(localStoragePongToken);
    }

    if (searchParams.get("code")) {
      // if we catch an auth redirect from 42 api
      let code: string | null = searchParams.get("code");
      if (code) {
        set42User(setUser, setAuthToken, code);
        history.replace("/");
      }
    }
  }, []);

  const { search } = useLocation();
  var searchParams: URLSearchParams = new URLSearchParams(search);


 
  return (
    <div className="App">
      <input type="text" onChange={ sendMessage } />
      <Header user={user} logoutHandler={logoutHandler(setUser, setAuthToken)} />
      <Switch>
        <Route exact path="/" component={HomePage} />
        <Route path="/play">
          <Game user={user} setUser={setUser} authToken={authToken}/>
        </Route>
        <Route path="/account">
          <AccountPage user={user} setUser={setUser} authToken={authToken}/>
        </Route>
        {/* <Route path='/signin'><SignInRegister loadUser={this.loadUser} user={this.state.user}/></Route> */}
        {/* <Route path='/sign-in' component={SignInAndSignUpPage} /> */}
      </Switch>
    </div>
  );
}

export default App;
