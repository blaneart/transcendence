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
  status: number;
  user: User;
}

async function process42ApiRedirect(code: string): Promise<User> {
  const response = await fetch(
    `http://127.0.0.1:3000/auth/signUp?code=${code}`
  );
  //   console.log(data);
  const jsonData = await response.json();
  const typedResponse: AuthResponse = jsonData as AuthResponse;
  if (typedResponse.status !== 1) {
    alert("42 auth failed.");
  }
  const loggedUser: User = {
    id: typedResponse.user.id,
    name: typedResponse.user.name,
    avatar: typedResponse.user.avatar,
    games: typedResponse.user.games,
    wins: typedResponse.user.wins,
  };
  return loggedUser;
}

// Ask the backend to forget us
async function backendSignOut() {
  const response = await fetch(`http://127.0.0.1:3000/auth/signOut`);

  const jsonData = await response.json();
  const typedResponse: AuthResponse = jsonData as AuthResponse;
  if (typedResponse.status !== 1) {
    alert("Couldn't sign out :(");
  }
}

async function set42User(setUser: Function, code: string) {
  const loggedUser: User = await process42ApiRedirect(code);
  setUser(loggedUser);
  // Save user in browser state
  localStorage.setItem("pongUser", JSON.stringify(loggedUser));
}

function logoutHandler(setUser: Function) {
  return function () {
    backendSignOut();
    localStorage.removeItem("pongUser");
    setUser(null);
  };
}

function App() {
  const [user, setUser] = useState<IState["user"]>();
  const [isSigned, setIsSigned] = useState(false);

  let history = useHistory();

    useEffect(() => {
    const localStoragePongUser: string | null = localStorage.getItem(
      "pongUser"
    );
    if (!user && localStoragePongUser) {
      const localStorageUser = JSON.parse(localStoragePongUser) as User;
      setUser(localStorageUser);
    }

    if (searchParams.get("code")) {
      // if we catch an auth redirect from 42 api
      let code: string | null = searchParams.get("code");
      if (code) {
        set42User(setUser, code);
        history.replace("/");
      }
    }
  }, []);

  const { search } = useLocation();
  var searchParams: URLSearchParams = new URLSearchParams(search);

  return (
    <div className="App">
      <Header user={user} logoutHandler={logoutHandler(setUser)} />
      <Switch>
        <Route exact path="/" component={HomePage} />
        <Route path="/play" component={Game} />
        <Route path="/account">
          <AccountPage user={user} setUser={setUser}/>
        </Route>
        {/* <Route path='/signin'><SignInRegister loadUser={this.loadUser} user={this.state.user}/></Route> */}
        {/* <Route path='/sign-in' component={SignInAndSignUpPage} /> */}
      </Switch>
    </div>
  );
}

export default App;
