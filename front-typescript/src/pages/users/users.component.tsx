import { Switch, Route } from "react-router";
import Profile from "./components/Profile.component";
import UsersList from "./components/UsersList.component";
import { User } from "../../App.types";


interface IUsersProps {
  user?: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null | undefined>>;
  authToken: string;
  setAuthToken: React.Dispatch<React.SetStateAction<string>>;
}

const Users: React.FC<IUsersProps> = ({
  user,
  setUser,
  authToken,
  setAuthToken,
}) => {

  return (
    <div>
      <Switch>
        <Route exact path="/users/">
          {authToken === "" ? <p>Please log in.</p> : <UsersList user_logged={user} setUser={setUser} authToken={authToken} setAuthToken={setAuthToken} />}
        </Route>
        <Route path="/users/:paramName">
          {authToken === "" ? <p>Please log in.</p> : <Profile user={user} setUser={setUser} authToken={authToken} setAuthToken={setAuthToken} />}
        </Route>
      </Switch>
    </div>
  );
};

export default Users;