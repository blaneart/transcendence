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
      setUser: React.Dispatch<React.SetStateAction<User | null | undefined>>
      
}

const SendForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
}

const AccountPage: React.FC<IAccountPageProps> = ({user, setUser}) => {
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
                <button type="button" onClick={(e) => {
                var val = (document.getElementById("name") as HTMLInputElement).value;
                if (val != "" /* && UnusedName()*/)
                    setUser({id: user.id, avatar: user.avatar, games: user.games , wins: user.wins, name: val, twofa: user.twofa})
            }}> Submit </button>
            </form>
        </div>
        <p>2FA enabled: {user.twofa === true ? "Yes" : "No"}</p>
        </div>
        :
        <h1>
        kek
        </h1>
        }
    </div>)
}

export default AccountPage;