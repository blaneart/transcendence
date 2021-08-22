import React, { useState } from 'react';
import CustomButton from '../custom-button/custom-button.component';
import Form from '../form/form.component';
import Modal from '../modal/modal.component';

const uuid = require("uuid");


const REDIRECT_URL : string = "http://127.0.0.1:3001"; // 42 api will send the user back here
let API_UID : string;
if (process.env.REACT_APP_API_UID) {
  API_UID = process.env.REACT_APP_API_UID;
} else {
  throw new Error("REACT_APP_API_UID environment variable is not set");
}


// Redirect to 42, and 42 will send the user back to us
function signUpButtonClicked() {
    let STATE = uuid.v4();
    window.location.href = `https://api.intra.42.fr/oauth/authorize?client_id=${API_UID}&redirect_uri=${REDIRECT_URL}&scope=public&state=${STATE}&response_type=code`;
}

const Login = () => {

    const [show, setShow] = useState(false);
    const showModal = () => {
        setShow(true);
    }
    const hideModal = () => {
        setShow(false);
    }
    const onSubmitSignIn = () => {
        alert('Signup button clicked');
        // fetch('http://localhost:3000/register', {
        //   method: 'post',
        //   headers: {'Content-Type': 'application/json'},
        // //   body: JSON.stringify({
        // //     email: this.state.email,
        // //     password: this.state.password,
        // //     name: this.state.name
        // //   })
        //     })
        //   .then(response => response.json())
        //   .then(user => {
            // if (user.id) {
            //   this.props.loadUser(user)
            //   console.log('ll');
            // }
        //   })
    
        //   console.log(this.props.user);
    }


    return (
    <div className="login">
        {/* <Form></Form> */}
        {/* <Modal show={show} handleClose={hideModal}> */}
        {/* </Modal> */}
        <CustomButton onClick={signUpButtonClicked}>SIGN IN</CustomButton>
    </div>
    );
}


export default Login;