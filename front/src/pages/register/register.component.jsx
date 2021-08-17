import React from 'react';
import { withRouter } from 'react-router-dom';
import FormInput from '../../components/form-input/form-input.component';
import CustomButton from '../../components/custom-button/custom-button.component';
class Register extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        name:'',
        email: '',
        password: ''
      }
    }
  
  
    handleSubmit = event => {
      event.preventDefault();
      this.setState({ email:'', password:''});
  }
  
  handleChange = event => {
      const { value, name } = event.target;
      this.setState({ [name]: value })
  }
    // onEmailChange = (event) => {
    //   this.setState({signInEmail: event.target.value})
    // }
  
    // onPasswordChange = (event) => {
    //   this.setState({signInPassword: event.target.value})
    // }
  
    onSubmitSignIn = () => {
      console.log(this.props.user);
      fetch('http://localhost:3000/register', {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          email: this.state.email,
          password: this.state.password,
          name: this.state.name
        })
          })
        .then(response => response.json())
        .then(user => {
          if (user.id) {
            this.props.loadUser(user)
            console.log('ll');
          }
        })
  
        console.log(this.props.user);
  
    }
  
    render() {
      return (
        <div className='register'>
        <h2>I want to create an account</h2>
        <span>Fill the forms to create new account</span>
        <form onSubmit={this.handleSubmit}>
            <FormInput name="name" type="text"
            value={this.state.name} handleChange={this.handleChange}
            label='name' required/>
            <FormInput name="email" type="email"
            value={this.state.email} handleChange={this.handleChange}
            label='email' required/>
            <FormInput name="password" type="password"
            value={this.state.password} handleChange={this.handleChange}
             label='password' required/>
            
            <CustomButton onClick={this.onSubmitSignIn} type="submit"
             value='Submit Form'>Sign In</CustomButton>
                            </form>
    </div>
      );
    }
  }

  export default withRouter(Register);