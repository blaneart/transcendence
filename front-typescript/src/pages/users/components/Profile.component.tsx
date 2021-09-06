import React, { useState, useEffect, useCallback } from "react";
import type { FormEvent } from "react";
import { useParams } from "react-router";

import Scores from "../../../components/account-info/account-info.component";
import Modal from "../../../components/modal/modal.component";
import AvatarUpload from "./avatarUpload.component";
import UserAvatar from "./UserAvatar.component";
import Achievements from "./achievements.component";

import "./usersList.styles.scss";

interface NameRouteParams {
  paramName?: string
}

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

interface IProfilePageProps {
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

const SendForm = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();
};

async function toggleTwofa(
  user: User,
  setUser: Function,
  authToken: string,
  setQrModal: Function
) {
  const data = {
    value: user.twofa ? false : true, // toggle to the inverse of the actual value
  };
  const response = await fetch("http://127.0.0.1:3000/auth/set2fa", {
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
  if (data.value === true) {
    setQrModal(true);
  }
}

async function updateName(
  user: User,
  setUser: Function,
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
  localStorage.setItem("pongUser", JSON.stringify(userUpdate));
}

async function getUserByName( authToken: string, name: string)
{
  const data = {
    value: name,
  };
  const response = await fetch("http://127.0.0.1:3000/userByName", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify(data),
  });
  return response 

}

const Profile: React.FC<IProfilePageProps> = ({
  user,
  setUser,
  authToken,
}) => {
  
  const { paramName } = useParams<NameRouteParams>();
  const [profile_user, setProfileUser] = useState(user);
  const [qrModal, setQrModal] = useState(false);

  // // useCallback to prevent infinite state updates
  // const refreshUsers = useCallback(() => {
  //   // Get all users from the backend and add them to state
  //   getUserByName(authToken, (paramName as string)).then(user_ => {
  //     setProfileUser(user_);
  //   });
  // }, [authToken]);

  // useEffect(() => {
  //   // On setup, we update the users
  //   refreshUsers();
  // }, [users, refreshUsers]); // We don't really reupdate.

  return (
    <div className="account-page">
      {user ? (
        <div>
          <UserAvatar user={user} />
          <Scores
            wins={user.wins}
            games={user.games}
            loses={user.games - user.wins}
          />
          <h1>{user.name}</h1>
          <h2>{"paramName = " + paramName + " hahah"}</h2>
          {user.name == paramName ? (
          <div>
            <div>
              Change name :
              <form onSubmit={SendForm}>
                <input type="text" id="name" />
                <button
                  type="button"
                  onClick={(e) => {
                    updateName(
                      user,
                      setUser,
                      (document.getElementById("name") as HTMLInputElement).value,
                      authToken
                    );
                  }}
                >
                  {" "}
                  Submit{" "}
                </button>
              </form>
            </div>
            <p>2FA enabled: {user.twofa === true ? "Yes" : "No"}</p>
            <button
              onClick={(e) => toggleTwofa(user, setUser, authToken, setQrModal)}
            >
              {user.twofa ? "Disable 2FA" : "Enable 2FA"}
            </button>
            <Modal show={qrModal} handleClose={() => setQrModal(false)}>
              <p className="twofa-text">Save this qr-code in your auth app: </p>
              <div className="twofa-code">
                <img
                  src={`https://chart.googleapis.com/chart?chs=166x166&chld=L|0&cht=qr&chl=otpauth://totp/Transcendence:${user.name}%3Fsecret=${user.twofaSecret}%26issuer=Transcendence`}
                ></img>
              </div>
              <div className="twofa-secret">
                <p>Secret (backup in your password manager)</p>
                <p>{user.twofaSecret}</p>
              </div>
            </Modal>
            <AvatarUpload user={user} authToken={authToken} setUser={setUser} />
          </div>)
          : (<h3>You can't modify this user</h3>)}
          <Achievements user={user} authToken={authToken} setUser={setUser}/>
        </div>
      ) : (
        <h1>kek</h1>
      )}
    </div>
  );
};

export default Profile;
