import React, { useState } from "react";

import Scores from '../../components/account-info/account-info.component';
import type { FormEvent} from 'react';

import "./account.styles.scss";
import EventEmitter from 'events';
import { setupMaster } from 'cluster';
import Modal from '../../components/modal/modal.component';
import AvatarUpload from './avatarUpload.component';
import UserAvatar from './UserAvatar.component';

function makeid(length: number): string {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i <  length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
  charactersLength));
   }
   return result;
  }

interface User {
    id: string;
    name: string;
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

interface IAccountPageProps {
    user?: {
        id: string,
        name: string,
        avatar: string,
        games: number,
        wins: number,
        twofa: boolean,
        twofaSecret: string,
        realAvatar: boolean,
      } | null,
      setUser: React.Dispatch<React.SetStateAction<User | null | undefined>>,
      authToken: string
      
}

const SendForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
}

async function toggleTwofa(user: User, setUser: Function, authToken: string, setQrModal: Function)
{
  const data = {
    value: user.twofa ? false : true, // toggle to the inverse of the actual value
  };
  const response = await fetch('http://127.0.0.1:3000/auth/set2fa', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify(data),
  });
  const jsonData = await response.json();
  console.log(jsonData);
  const userUpdate = jsonData as User;
  setUser(userUpdate);
  if (data.value === true)
  {
    setQrModal(true);
  }
}

async function updateName(user: User, setUser: Function, newName: string, authToken: string)
{
  const data = {
    value: newName
  };
  const response = await fetch('http://127.0.0.1:3000/account/setName', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify(data),
  });
  const jsonData = await response.json();
  console.log(jsonData);
  const userUpdate = jsonData as User;

  setUser(userUpdate);
}

const AccountPage: React.FC<IAccountPageProps> = ({user, setUser, authToken}) => {
    const [qrModal, setQrModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    return(
    <div className='account-page'>
        {
        user ?
        <div>

        <UserAvatar user={user}/>
        <Scores wins={user.wins} games={user.games} loses={user.games - user.wins}/>
        <h1>{user.name}</h1>
        <div>
            Change name :
            <form onSubmit={SendForm}>
                <input type="text" id="name"/>
                <button type="button" onClick={(e) => {updateName(user, setUser, (document.getElementById("name") as HTMLInputElement).value, authToken)}}> Submit </button>
            </form>
        </div>
        <p>2FA enabled: {user.twofa === true ? "Yes" : "No"}</p>
        <button onClick={(e) => toggleTwofa(user, setUser, authToken, setQrModal)}>{user.twofa ? "Disable 2FA" : "Enable 2FA"}</button>
        <Modal show={qrModal} handleClose={()=>setQrModal(false)}>
          <p className="twofa-text">Save this qr-code in your auth app: </p>
          <div className="twofa-code">
            <img src={`https://chart.googleapis.com/chart?chs=166x166&chld=L|0&cht=qr&chl=otpauth://totp/Transcendence:${user.name}%3Fsecret=${user.twofaSecret}%26issuer=Transcendence`}></img>
          </div>
          <div className="twofa-secret">
            <p>Secret (backup in your password manager)</p>
            <p>{user.twofaSecret}</p>
          </div>
        </Modal>
          <AvatarUpload user={user} authToken={authToken} setUser={setUser}/>
        </div>
        :
        <h1>
        kek
        </h1>
        }
    </div>)
}

export default AccountPage;