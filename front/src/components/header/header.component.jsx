import React from 'react';
import { Link } from 'react-router-dom';
import  logo from '../../assets/trlogo.png';
import './header.styles.scss';

const Header = ({user}) => {
    console.log({user});

    return(
    <div className='header'>
        <Link to="/">
            <img src={logo} className='logo' />
        </Link>
        <div className='options'>
            <Link className='option' to='/play'>
                PLAY
            </Link>
            <Link className='option' to='/account'>
                ACCOUNT
            </Link>
        {
            user.id ? 
            <div className='option'>SIGN OUT</div>
            :
            <Link className='option-right' to='signin'>SIGN IN</Link>
        }    
        </div>
    </div>
)
    }
export default Header;