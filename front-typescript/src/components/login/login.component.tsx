import React, { useState } from 'react';
import CustomButton from '../custom-button/custom-button.component';
import Form from '../form/form.component';
import Modal from '../modal/modal.component';

const Login = () => {

    const [show, setShow] = useState(false);
    const showModal = () => {
        setShow(true);
    }
    const hideModal = () => {
        setShow(false);
    }
    const onSubmitSignIn = () => {

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
        <Modal show={show} handleClose={hideModal}>
        </Modal>
        <CustomButton onClick={showModal}>SIGN IN</CustomButton>
    </div>
    );
}


export default Login;