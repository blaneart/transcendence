import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/trlogo.png';
import Login from '../login/login.component';
import CustomButton from '../custom-button/custom-button.component';
import './header.styles.scss';
import { User } from "../../App.types";
import { setupMaster } from 'cluster';

interface IHeaderProps {
    authToken: string;
    user?: User | null;
    setUser: Function;
    setAuthToken: Function;
} 
async function Click(authToken: string, user: User, setUser: Function, setAuthToken: Function)
{
    let newStatus = !user.status;
    const data = {
      value: newStatus,
    };

    const response = await fetch("http://127.0.0.1:3000/account/setStatus", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(data),
    });
    setUser(null);
    setAuthToken(null);
}

const Header: React.FC<IHeaderProps> = ({authToken, user, setUser, setAuthToken}) => {
    return(
    <div className='header'>
        <Link to="/">
            <img src={logo} className='logo' />
        </Link>
        <div className='options'>
        {
            user ? 
            <div className='option-right'>
            <CustomButton isLogged={1} onClick={() => (Click(authToken, user, setUser, setAuthToken))} avatar_name={user.avatar} realAvatar={user.realAvatar}>SIGN OUT</CustomButton>
            </div>
            :
            <div className='option-right'><Login/></div>
        }    
        </div>
    </div>
)}

export default Header;