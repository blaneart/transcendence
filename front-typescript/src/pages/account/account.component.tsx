import React, { useState } from "react";
import Avatar from "boring-avatars";
import Scores from '../../components/account-info/account-info.component';
import type { FormEvent} from 'react';

import "./account.styles.scss";
import EventEmitter from 'events';
import { setupMaster } from 'cluster';

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
        twofa: boolean
      } | null,
      setUser: React.Dispatch<React.SetStateAction<User | null | undefined>>,
      authToken: string
      
}

const SendForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
}

async function toggleTwofa(user: User, setUser: Function, authToken: string)
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
    return(
    <div className='account-page'>
        {
        user ?
        <div>
        <Avatar
        size={150}
        name={
            user.avatar
        }
        variant="beam"/>
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
        <button onClick={(e) => toggleTwofa(user, setUser, authToken)}>{user.twofa ? "Disable 2FA" : "Enable 2FA"}</button>
        </div>
        :
        <h1>
        kek
        </h1>
        }
    </div>)
}

export default AccountPage;