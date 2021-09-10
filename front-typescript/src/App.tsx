import React, { useState, useEffect } from "react";
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

import Chats from "./pages/chats/chats.component";
import { io, Socket } from 'socket.io-client';
import { User } from './App.types';
import Offline_Game from "./pages/offline-game/offline-game.component";
import "./App.scss";
import Difficulty from "./components/difficulty-lvl/difficulty-lvl.component";


const ENDPOINT = "http://127.0.0.1:3002";


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



function receiveMessage(msg: string)
{
  console.log(msg);
}



function App() {
  const [user, setUser] = useState<IState["user"]>();
  const [authToken, setAuthToken] = useState("");
  const [isSigned, setIsSigned] = useState(false);
  const [response, setResponse] = useState("");


 

  // const socket = (io(ENDPOINT));

  // useEffect(() => {
    // socket?.on('msgToClient', (msg: string) => {
      // receiveMessage(msg);
    // });
    // socket?.emit("msgToServer", "lel");
  // }, []);
 // const  sendMessage = (event: any) => {
    //   console.log('front')
    //   event.preventDefault();
    //   socket?.emit("msgToServer", event.target.value );
    // }
  let history = useHistory();
   

  useEffect(() => {
    
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
  }, []);

  const { search } = useLocation();
  let difficulty = {number: 4};
  var searchParams: URLSearchParams = new URLSearchParams(search);

 
  return (
    <div className="App">
      {/* <input type="text" onChange={ sendMessage } /> */}
      <Header user={user} logoutHandler={logoutHandler(setUser, setAuthToken)} />
      <Switch>
        <Route exact path="/">
          <Menu user={user}/>
        </Route>
		<Route path="/playbots">
			<Difficulty difficultyLvl={difficulty}/>
			<Offline_Game user={user} setUser={setUser} authToken={authToken} difficultyLvl={difficulty}/>
		</Route>
        <Route path="/play">
          <Game user={user} setUser={setUser} authToken={authToken} />
        </Route>
        <Route path="/chats">
          {user ? <Chats authToken={authToken} setAuthToken={setAuthToken} setUser={setUser} userId={user.id} /> : <p>Please log in</p> }
        </Route>
        <Route path="/users">
          <Users user={user} setUser={setUser} authToken={authToken} />
        </Route>
        {/* <Route path='/signin'><SignInRegister loadUser={this.loadUser} user={this.state.user}/></Route> */}
        {/* <Route path='/sign-in' component={SignInAndSignUpPage} /> */}
      </Switch>
      {/* We should add this: */}
      {/* <div>Icons made by <a href="https://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div> */}
 </div>
  );
}

export default App;
