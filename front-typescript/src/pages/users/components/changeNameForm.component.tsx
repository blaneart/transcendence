import React, { FormEvent, useState } from "react";
import ChangeNameButton from "./changeNameButton.component";
import { User } from "../../../App.types";
import { History } from 'history';
import { useHistory } from "react-router-dom";

  interface ICNFProps {
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
}

const ChangeNameForm: React.FC<ICNFProps> = ({
    user,
    setUser,
    setProfileUser,
    authToken
}) => {

  let history = useHistory();
  const [newName, setNewName] = useState<string>("");

  const submitHandler = async (e: any) => {
    e.preventDefault();
    console.log("newName", newName)
    if (!newName)
      setNewName("");
    if (newName === "")
    {
      alert("No empty name please");
      return null;
    }
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
  }


  return (
    <form className="text-center" onSubmit={submitHandler}>
    <input type="text" name="" id="" onChange={(e) => setNewName(e.target.value)} />
    <input className="cursor-pointer" type="submit" value="Send" />
  </form>
);
};

export default ChangeNameForm;
