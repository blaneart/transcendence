import React from 'react';
import { withRouter } from 'react-router-dom';
import FormInput from '../../components/form-input/form-input.component';
import CustomButton from '../../components/custom-button/custom-button.component';
import './sign-in.styles.scss';

class Signin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      password: ''
    }
  }


  handleSubmit = event => {
    event.preventDefault();
    this.setState({ name:'', password:''});
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
    fetch('http://localhost:3000/signin', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        name: this.state.name,
        password: this.state.password
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
      <div className='sign-in'>
      <h2>I already have an account</h2>
      <span>Sign in with your name and password</span>
      <form onSubmit={this.handleSubmit}>
          <FormInput name="name" type="name"
          value={this.state.name} handleChange={this.handleChange}
          label='name' required/>
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

export default withRouter(Signin);