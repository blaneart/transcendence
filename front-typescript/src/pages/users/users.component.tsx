import { useState } from "react";
import { Switch, Route } from "react-router";
import Profile from "./components/Profile.component";
import UsersList from "./components/UsersList.component";
import { User } from "../../App.types";


interface IState {
  user: User | null;
}

interface UsersProps {
  user?: User | null;
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
      <Route exact path="/users/">
        {authToken === "" ? <p>Please log in.</p> : <UsersList user_logged={user} setUser={setUser} authToken={authToken} />}
      </Route>
      <Route path="/users/:paramName">
        {authToken === "" ? <p>Please log in.</p> : <Profile user={user} setUser={setUser} authToken={authToken} />}
      </Route>
    </Switch>
    </div>
  );
};

export default Users;