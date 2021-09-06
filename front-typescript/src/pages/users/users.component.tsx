import { useState } from "react";
import { Switch, Route } from "react-router";
import Profile from "./components/Profile.component";
import UsersList from "./components/UsersList.component";

interface User {
  id: string;
  name: string;
  id42: number;
  avatar: string;
  games: number;
  wins: number;
  twofa: boolean;
  twofaSecret: string;
  realAvatar: boolean;
}

interface IState {
  user: User | null;
}

interface UsersProps {
  user?: {
    id: string;
    name: string;
    id42: number;
    avatar: string;
    games: number;
    wins: number;
    twofa: boolean;
    twofaSecret: string;
    realAvatar: boolean;
  } | null;
  setUser: React.Dispatch<React.SetStateAction<User | null | undefined>>;
  authToken: string;
}

const Users: React.FC<UsersProps> = ({
  user,
  setUser,
  authToken
}) => {

  return (
    <div>
    <Switch>
      <Route path="/users/:paramName">
        {authToken === "" ? <p>Please log in.</p> : <Profile user={user} setUser={setUser} authToken={authToken} />}
      </Route>
      <Route exact path="/users/">
        {authToken === "" ? <p>Please log in.</p> : <UsersList user_logged={user} setUser={setUser} authToken={authToken} />}
      </Route>
    </Switch>
    </div>
  );
};

export default Users;