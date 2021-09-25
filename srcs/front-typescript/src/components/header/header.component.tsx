import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/trlogo.png';
import Login from '../login/login.component';
import CustomButton from '../custom-button/custom-button.component';
import './header.styles.scss';
import { User } from "../../App.types";

interface IHeaderProps {
    authToken: string;
    user?: User | null;
    logoutHandler: Function;
    setUser: Function;
    setAuthToken: Function;
}

async function Click(
  authToken: string,
  user: User,
  setUser: Function,
  setAuthToken: Function,
  logoutHandler: Function
  )
{
    let newStatus = user.status > 0 ? 0 : 1;
    const data = {
      value: newStatus,
    };

    fetch(process.env.REACT_APP_API_URL + "/account/setStatus", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(data),
    });
    logoutHandler();
    setAuthToken(null);
    setUser(null);
}


const Header: React.FC<IHeaderProps> = ({authToken, user, logoutHandler, setUser, setAuthToken}) => {
    return(
    <div className='header'>
        <Link to="/">
            <img src={logo} alt='logo' className='logo' />
        </Link>
        <div className='options'>
        {
            user ? 
            <div className='option-right'>
            <CustomButton isLogged={1} onClick={async () => {await Click(authToken, user, setUser, setAuthToken, logoutHandler);}}
             avatar_name={user.realAvatar ? user.avatar : (user.id42 + "")} realAvatar={user.realAvatar} >SIGN OUT</CustomButton>
            </div>
            :
            <div className='option-right'><Login/></div>
        }    
        </div>
    </div>
)}

export default Header;