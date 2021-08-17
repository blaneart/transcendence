import React from 'react';
import Signin from '../sign-in/sign-in.component';
import Register from '../register/register.component';
import './sign-in-register.styles.scss';
const SignInRegister = (props) =>  (
        <div className='sign-in-register'>
            <Signin loadUser={props.loadUser} user={props.user}/>
            <Register loadUser={props.loadUser} user={props.user}/>
        </div>
    
);

export default SignInRegister;