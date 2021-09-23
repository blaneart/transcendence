import { useHistory} from "react-router-dom";
import { User } from "../../../App.types";
import { History } from 'history';

  interface ICNBProps {
    user: User;
    setUser: React.Dispatch<React.SetStateAction<User | null | undefined>>;
    setProfileUser: React.Dispatch<React.SetStateAction<User | null>>;
    authToken: string;
}

async function updateName(
    setUser: Function,
    setProfileUser: Function,
    newName: string,
    authToken: string,
    history: History
  ) {

    const data = {
      value: newName,
    };

    const response = await fetch(process.env.REACT_APP_API_URL + "/account/setName", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok)
      return null;

    const jsonData = await response.json();
    const userUpdated = jsonData as User;

    setUser(userUpdated);
    setProfileUser(userUpdated);

    history.push('/users/' + userUpdated.name);
    localStorage.setItem("pongUser", JSON.stringify(userUpdated));
}

const ChangeNameButton: React.FC<ICNBProps> = ({
    user,
    setUser,
    setProfileUser,
    authToken
}) => {

    let history = useHistory();
    const HandleClick = () => {
      updateName(
      setUser,
      setProfileUser,
      (document.getElementById("name") as HTMLInputElement).value,
      authToken,
      history
      );
    }
    
    return (
    <button type="button" className="py-2 mx-1 hover:bg-opacity-100 px-4 rounded-lg bg-white bg-opacity-75 text-black font-bold border-0 shadow-lg" onClick={HandleClick}>Submit</button>
    );
};


export default ChangeNameButton;