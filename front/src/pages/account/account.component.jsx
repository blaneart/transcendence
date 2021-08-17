import React from 'react';
import Avatar from "boring-avatars";
import Scores from '../../components/account-info/account-info.component';

import "./account.styles.scss";
function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
  charactersLength));
   }
   return result;
  }


const AccountPage = ({user}) => {
    // const {user} = props;
    console.log(user);
    return(
    <div className='account-page'>
        <Avatar
        size={150}
        name={
            user ?
            user.avatar
            :
            makeid(10)
        }
        variant="beam"/>
        <Scores wins={user.wins} games={user.games} loses={user.games - user.wins}/>
        {
        user ?
        <h1>{user.name}</h1>
        :
        <h1>
        kek
        </h1>
}
    </div>)

    }
export default AccountPage;