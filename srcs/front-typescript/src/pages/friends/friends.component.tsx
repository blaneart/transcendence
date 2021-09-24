import FriendList from "./components/FriendList.component";
import { User } from "../../App.types";


interface IFriendsProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User | null | undefined>>;
  authToken: string;
  setAuthToken: React.Dispatch<React.SetStateAction<string>>;
}

const Friends: React.FC<IFriendsProps> = ({
  user,
  setUser,
  authToken,
  setAuthToken
}) => {

  return (
    <div>
        {authToken === "" ? <p>Please log in.</p> : <FriendList user_logged={user} authToken={authToken} setAuthToken={setAuthToken} />}
    </div>
  );
};

export default Friends;