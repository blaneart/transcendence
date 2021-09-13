import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/trlogo.png';
import Login from '../login/login.component';
import CustomButton from '../custom-button/custom-button.component';
import './header.styles.scss';
import { User } from "../../App.types";

interface IHeaderProps {
    user?: User | null,
    logoutHandler: React.MouseEventHandler<HTMLButtonElement>
} 

const Header: React.FC<IHeaderProps> = ({user, logoutHandler}) => {
    return(
    <div className='header'>
        <Link to="/">
            <img src={logo} className='logo' />
        </Link>
        <div className='options'>
        {
            user ? 
            <div className='option-right'>
            <CustomButton isLogged={1} onClick={logoutHandler} avatar_name={user.avatar} realAvatar={user.realAvatar}>SIGN OUT</CustomButton>
            </div>
            :
            <div className='option-right'><Login/></div>

        }    
        </div>
    </div>
)}

export default Header;