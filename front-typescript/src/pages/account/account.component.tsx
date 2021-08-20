import React from 'react';
import Avatar from "boring-avatars";
import Scores from '../../components/account-info/account-info.component';

import "./account.styles.scss";
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

interface IAccountPageProps {
    user?: {
        id: string,
        name: string,
        avatar: string,
        games: number,
        wins: number
      } | null
    
}

const AccountPage: React.FC<IAccountPageProps> = ({user}) => {
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
        </div>
        :
        <h1>
        kek
        </h1>
        }
    </div>)

    }
export default AccountPage;