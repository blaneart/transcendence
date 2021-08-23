import React from 'react';
import { Link } from 'react-router-dom';
import  logo from '../../assets/trlogo.png';
import Login from '../login/login.component';

import './header.styles.scss';


interface IHeaderProps {
    user?: {
        id: string,
        name: string,
        avatar: string,
        games: number,
        wins: number
       } | null,
    logoutHandler: React.MouseEventHandler<HTMLDivElement>
}

const Header: React.FC<IHeaderProps> = ({user, logoutHandler}) => {
    console.log({user});

    return(
    <div className='header'>
        <Link to="/">
            <img src={logo} className='logo' />
        </Link>
        <div className='options'>
        {
            user ? 
            <div className='option' onClick={logoutHandler}>SIGN OUT</div>
            :
            <div className='option-right'><Login/></div>

        }    
        </div>
    </div>
)
    }
export default Header;