import React, { FormEvent } from "react";
import ChangeNameButton from "./changeNameButton.component";
import { User } from "../../../App.types";

  interface ICNFProps {
    user: User;
    setUser: React.Dispatch<React.SetStateAction<User | null | undefined>>;
    setProfileUser: React.Dispatch<React.SetStateAction<User | null>>;
    authToken: string;
}

const SendForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

const ChangeNameForm: React.FC<ICNFProps> = ({
    user,
    setUser,
    setProfileUser,
    authToken
}) => {
    return (
    <form onSubmit={SendForm} className="py-2">
        <input type="text" id="name" className="py-2 pl-3 bg-white rounded-lg text-black border-1 border-solid border-gray-400 hover:bg-opacity-100 focus:bg-opacity-100 " />
        <ChangeNameButton user={user} setUser={setUser} setProfileUser={setProfileUser}  authToken={authToken}/>
    </form>
);
};

export default ChangeNameForm;
