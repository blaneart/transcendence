import React from 'react';
import { Link } from 'react-router-dom';
import  logo from '../../assets/trlogo.png';
import Login from '../login/login.component';
import CustomButton from '../custom-button/custom-button.component';
import './header.styles.scss';


interface IHeaderProps {
    user?: {
        id: string,
        name: string,
        avatar: string,
        games: number,
        wins: number,
        twofa: boolean
        realAvatar: boolean
    } | null,
    // logoutHandler: React.MouseEventHandler<HTMLDivElement>
    logoutHandler: React.MouseEventHandler<HTMLButtonElement>
}

const Header: React.FC<IHeaderProps> = ({user, logoutHandler}) => {
    
    console.log("CUSTOM BUTTON");
    console.log({user});

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
            // <div className='option' onClick={logoutHandler}>SIGN OUT</div>
            :
            <div className='option-right'><Login/></div>

        }    
        </div>
    </div>
)
    }
export default Header;