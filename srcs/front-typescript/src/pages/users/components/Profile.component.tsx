import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router";

import Scores from "../../../components/account-info/account-info.component";
import Modal from "../../../components/modal/modal.component";
import AvatarUpload from "./avatarUpload.component";
import UserAvatar from "./UserAvatar.component";
import Achievements from "./achievements.component";
import ChangeNameForm from "./changeNameForm.component";
import GameHistory from "./gameHistory.component";

import "./usersList.styles.scss";
import { User } from "../../../App.types";

import { useHistory } from "react-router-dom";

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
  authToken: string,
  setQrModal: Function,
  setAuthToken: Function,
  twofa: boolean,
  setTwofa: Function,
  setTwofaSecret: Function,
  onBan: Function
) {
  const data = {
    value: twofa ? false : true, // toggle to the inverse of the actual value
  };
  const response = await fetch(process.env.REACT_APP_API_URL + "/auth/set2fa", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok)
  {
    if (response.status === 401)
      onBan();
    return null;
  }

  const resp = await response.json();

  if (data.value === true) {
    setAuthToken(resp.resp.access_token);
    sessionStorage.setItem("pongToken", resp.resp.access_token);
    setTwofa(true);
    setTwofaSecret(resp.secret);
    setQrModal(true);
  }
  else {
    setTwofa(false);
  }
}

async function getUserByName(authToken: string, name: string, onBan: Function): Promise<User | null> {
  const data = {
    value: name,
  };
  const response = await fetch(process.env.REACT_APP_API_URL + "/userByName", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify(data),
  });
  if (!response.ok)
  {
    if (response.status === 401)
      onBan();
    return null;
  }
  const jsonData = await response.json();

  return jsonData as User;
}

async function getGameNumbers(authToken: string, id: number, onBan: Function): Promise<number[]> {
  const data = {
    id: id,
  };
  const response = await fetch(process.env.REACT_APP_API_URL + "/gameNumbers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok)
  {
    if (response.status === 401)
      onBan();
    return [0, 0, 0];
  }

  const jsonData = await response.json();

  return jsonData as number[];
}

async function getMyTwofa(authToken: string, onBan: Function): Promise<boolean | null>
{
  const response = await fetch(process.env.REACT_APP_API_URL + "/auth/my2fa", {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
  });
  if (!response.ok)
  {
    if (response.status === 401)
      onBan();
    return null;
  }
  const jsonData = await response.json();

  return jsonData as boolean;
}

const Profile: React.FC<IProfilePageProps> = ({
  user,
  setUser,
  authToken,
  setAuthToken
}) => {

  const { paramName } = useParams<NameRouteParams>();
  const [profile_user, setProfileUser] = useState<User | null>(null as User | null);
  const [gameNumbers, setGameNumbers] = useState<number[]>([0, 0, 0]);
  const [qrModal, setQrModal] = useState(false);
  const [twofa, setTwofa] = useState<boolean>(false);
  const [twofaSecret, setTwofaSecret] = useState<string>("");

  const history = useHistory();

  const bannedHanlder = useCallback(() => {
    alert("You're banned.");
    history.replace('/');
  }, [history]);

  // useCallback to prevent infinite state updates
  const refreshUsers = useCallback(() => {
    // Get all users from the backend and add them to state
    getUserByName(authToken, (paramName as string), bannedHanlder).then(user_ => {
      setProfileUser(user_);
    });
  }, [authToken, paramName, bannedHanlder]);

  useEffect(() => {
    // On setup, we update the users
    refreshUsers();
  }, [refreshUsers]); // We don't really reupdate.

  const refreshTwofa = useCallback(() => {
    getMyTwofa(authToken, bannedHanlder).then(response => response !== null && setTwofa(response));
  }, [authToken, bannedHanlder]);

  useEffect(() => {
    refreshTwofa();
  }, [refreshTwofa]);

  // useCallback to prevent infinite state updates
  const refreshGameNumbers = useCallback(() => {
    // Get all users from the backend and add them to state
    if (profile_user)
      getGameNumbers(authToken, profile_user.id, bannedHanlder).then(newGameNumbers => {
        setGameNumbers(newGameNumbers);
      });
  }, [authToken, profile_user, bannedHanlder]);

  useEffect(() => {
    // On setup, we update the users
    refreshGameNumbers();
  }, [refreshGameNumbers]); // We don't really reupdate.

  let green: boolean = user && twofa ? false : true;
  let buttonClass = `cursor-pointer px-6 py-2 rounded-lg border-1 border-solid ${green? 'border-green-500' : 'border-red-500'} ${green ? 'bg-green-300' : 'bg-red-300' } ${green? 'text-green-900':'text-red-900'} font-bold ${green ? 'hover:bg-green-500' : 'hover:bg-red-500'} hover:text-white ${green? 'border-green-500' : 'border-red-500'}`;

  return (
    <div className="account-page py-10">
      {user ?
        (profile_user ? (
          <div className="flex justify-center flex-col sm:flex-row items-stretch w-full">
            <div className="bg-black bg-opacity-50 shadow mr-10 rounded-xl py-10 px-10 shadow-lg">
              <UserAvatar user={(profile_user as User)} />
              <h1>{paramName} ({(profile_user as User).elo})</h1>
              {user.name === paramName ? (
                <div>
                  <div>
                    <span className="text-gray-200 text-opacity-75">Change name :</span>
                    <ChangeNameForm user={user} setUser={setUser} setProfileUser={setProfileUser} authToken={authToken} />
                  </div>
                  <div className="flex flex-row items-center justify-center">
                    <p className="items-center text-gray-200 text-opacity-50 ">2FA enabled: </p>{twofa === true ? <span className="px-2 py-1 ml-1 bg-green-500 rounded px-3 text-white text-xs">Yes</span> : <span className="px-2 py-1 ml-1 bg-red-500 rounded px-3 text-white text-xs">NO</span>}
                  </div>
                  <button className={buttonClass}
                    onClick={(e) => toggleTwofa(authToken, setQrModal, setAuthToken, twofa, setTwofa, setTwofaSecret, bannedHanlder)}
                  >
                    {twofa ? "Disable 2FA" : "Enable 2FA"}
                  </button>
                  <Modal show={qrModal} handleClose={() => setQrModal(false)}>
                    <div className="px-5 py-3">
                    <p className="twofa-text">Save this qr-code in your auth app: </p>
                    <div className="twofa-code">
                      <img
                        alt='twofa-img' src={`https://chart.googleapis.com/chart?chs=166x166&chld=L|0&cht=qr&chl=otpauth://totp/Transcendence:${user.name}%3Fsecret=${twofaSecret}%26issuer=Transcendence`}
                      ></img>
                    </div>
                    <div className="twofa-secret">
                      <p>Secret (backup in your password manager)</p>
                      <p>{twofaSecret}</p>
                    </div>
                    </div>
                  </Modal>
                  <AvatarUpload user={user} authToken={authToken} setUser={setUser} onSet={refreshUsers}/>
                </div>)
                : (<h1>You can't modify this user</h1>)}
            </div>
            <div className="bg-black bg-opacity-50 rounded-xl py-10 px-10 shadow-lg">
              <Scores
                wins={gameNumbers[0]}
                games={gameNumbers[1]}
                losses={gameNumbers[2]}
              />
              <GameHistory user={(profile_user as User)} authToken={authToken} />
              <Achievements user={(profile_user as User)} authToken={authToken} setUser={setUser} />
            </div>
          </div>
        ) :
          (<h1>This user does not exist</h1>)
        )
        :
        <h1>You are not connected ...</h1>}
    </div>
  );
};

export default Profile;
