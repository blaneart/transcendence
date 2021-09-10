import React, { useState, useEffect, useCallback } from "react";
import type { FormEvent } from "react";
import { useParams } from "react-router";

import Scores from "../../../components/account-info/account-info.component";
import Modal from "../../../components/modal/modal.component";
import AvatarUpload from "./avatarUpload.component";
import UserAvatar from "./UserAvatar.component";
import Achievements from "./achievements.component";
import ChangeNameForm from "./changeNameForm.component";

import "./usersList.styles.scss";
import { User } from "../../../App.types";
import FakeUserCreator from "../../chats/components/fakeUserCreator.components";

interface NameRouteParams {
  paramName?: string
}

interface IProfilePageProps {
  user?: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null | undefined>>;
  authToken: string;
  setAuthToken: React.Dispatch<React.SetStateAction<string>>;
}

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
  const jsonData = await response.json();

  return jsonData as User;
}

const Profile: React.FC<IProfilePageProps> = ({
  user,
  setUser,
  authToken,
  setAuthToken
}) => {
  
  const { paramName } = useParams<NameRouteParams>();
  const [profile_user, setProfileUser] = useState(user);
  const [qrModal, setQrModal] = useState(false);

  // useCallback to prevent infinite state updates
  const refreshUsers = useCallback(() => {
    // Get all users from the backend and add them to state
    getUserByName(authToken, (paramName as string)).then(user_ => {
      setProfileUser(user_);
    });
  }, [authToken]);

  useEffect(() => {
    // On setup, we update the users
    refreshUsers();
  }, [profile_user, refreshUsers]); // We don't really reupdate.

  return (
    <div className="account-page">
      {user ? (
        <div>
          <UserAvatar user={(profile_user as User)} />
          <Scores
            wins={(profile_user as User).wins}
            games={(profile_user as User).games}
            loses={(profile_user as User).games - (profile_user as User).wins}
          />
          <h1>{paramName}</h1>
          {user.name == paramName ? (
          <div>
            <div>
              Change name :
              <ChangeNameForm user={user} setUser={setUser} setProfileUser={setProfileUser} authToken={authToken}/>
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
            <AvatarUpload user={(profile_user as User)} authToken={authToken} setUser={setUser} />
          </div>)
          : (<h1>You can't modify this user</h1>)}
          <Achievements user={(profile_user as User)} authToken={authToken} setUser={setUser}/>
        </div>
      ) : (
        <h1>You are not connected ...</h1>
      )}
    </div>
  );
};

export default Profile;
