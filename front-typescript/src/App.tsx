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

interface User {
  id: string;
  name: string;
  avatar: string;
  games: number;
  wins: number;
}

interface IState {
  user: User | null;
}

interface AuthResponse {
  user: User;
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



async function set42User(setUser: Function, setAuthToken: Function, code: string) {
  const authResponse: AuthResponse = await process42ApiRedirect(code);
  setUser(authResponse.user);
  setAuthToken(authResponse.access_token)
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

function App() {
  const [user, setUser] = useState<IState["user"]>();
  const [authToken, setAuthToken] = useState("");
  const [isSigned, setIsSigned] = useState(false);

  let history = useHistory();

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
      <Header user={user} logoutHandler={logoutHandler(setUser, setAuthToken)} />
      <Switch>
        <Route exact path="/" component={HomePage} />
        <Route path="/play" component={Game} />
        <Route path="/account">
          <AccountPage user={user} />
        </Route>
        {/* <Route path='/signin'><SignInRegister loadUser={this.loadUser} user={this.state.user}/></Route> */}
        {/* <Route path='/sign-in' component={SignInAndSignUpPage} /> */}
      </Switch>
    </div>
  );
}

export default App;
