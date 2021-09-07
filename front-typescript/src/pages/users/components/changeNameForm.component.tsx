import React, { FormEvent } from "react";
import { useHistory, withRouter, RouteComponentProps } from "react-router-dom";
import ChangeNameButton from "./changeNameButton.component";
import { User } from "../../../App.types";

  interface ICNFProps {
    setUser: React.Dispatch<React.SetStateAction<User | null | undefined>>;
    setProfileUser: React.Dispatch<React.SetStateAction<User | null | undefined>>;
    authToken: string;
}

const SendForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

const ChangeNameForm: React.FC<ICNFProps> = ({
    setUser,
    setProfileUser,
    authToken
}) => {
    return (
    <form onSubmit={SendForm}>
        <input type="text" id="name" />
        <ChangeNameButton setUser={setUser} setProfileUser={setProfileUser}  authToken={authToken}/>
    </form>
);
};

export default ChangeNameForm;
