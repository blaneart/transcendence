import { useHistory, withRouter, RouteComponentProps } from "react-router-dom";
import { User } from "../../../App.types";
  
  interface ICNBProps {
    setUser: React.Dispatch<React.SetStateAction<User | null | undefined>>;
    setProfileUser: React.Dispatch<React.SetStateAction<User | null | undefined>>;
    authToken: string;
}

async function updateName(
    setUser: Function,
    setProfileUser: Function,
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
    console.log(jsonData);
    const userUpdate = jsonData as User;
  
    setUser(userUpdate);
    setProfileUser(userUpdate);
    localStorage.setItem("pongUser", JSON.stringify(userUpdate));
}

const ChangeNameButton: React.FC<ICNBProps> = ({
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
        authToken
        );
        history.push(
            '/users/' + (document.getElementById("name") as HTMLInputElement).value
            );
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