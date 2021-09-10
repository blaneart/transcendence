import { useState } from "react";
import { useHistory} from "react-router-dom";
import { User } from "../../../App.types";
  
  interface ICNBProps {
    user: User;
    setUser: React.Dispatch<React.SetStateAction<User | null | undefined>>;
    setProfileUser: React.Dispatch<React.SetStateAction<User | null | undefined>>;
    authToken: string;
}

async function updateName(
    setUser: Function,
    setProfileUser: Function,
    setLocation: Function,
    newName: string,
    authToken: string
  ) {
    const data = {
      value: newName,
    };
    const response = await fetch("http://127.0.0.1:3000/account/setName", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(data),
    });
    const jsonData = await response.json();
    const userUpdated = jsonData as User;
  
    setUser(userUpdated);
    setProfileUser(userUpdated);
    setLocation('/users/' + userUpdated.name);
    localStorage.setItem("pongUser", JSON.stringify(userUpdated));
}

const ChangeNameButton: React.FC<ICNBProps> = ({
    user,
    setUser,
    setProfileUser,
    authToken
}) => {
    let history = useHistory();
    const [location, setLocation] = useState(history.location);
    const HandleClick = () => {
      const username = user.name;
      updateName(
      setUser,
      setProfileUser,
      setLocation,
      (document.getElementById("name") as HTMLInputElement).value,
      authToken
      );
      history.push(location);
    }
    return (
    <button type="button" onClick={HandleClick}>
        {" "}
        Submit
        {" "}
    </button>
    );
};


export default ChangeNameButton;