import { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import AccountPage from './pages/account/account.component';
import  Game  from './components/game/game.component';
import './App.css';
import HomePage from './pages/homepage/homepage.component';
import Header from './components/header/header.component';
import Signin from './pages/sign-in/sign-in.component';
import SignInRegister from './pages/sign-in-register/sign-in-register.component';
class App extends Component
{
  constructor()  {
      super();
      {
        this.state = {
          isSignedIn: false,
          user: {
            id: '',
            name: '',
            email: '',
            
          }
        }
      }
  }
  componentDidMount() {
    fetch('http://localhost:3000/')
    .then(console.log);
  }
  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      games: data.games,
      joined: data.joined
    }})
  }
  render(){

    return (
    <div className="App">
      <Header user={this.state.user}/>
      <Switch>
      <Route exact path='/' component={HomePage} />
        <Route path='/play' component={Game} />
        <Route path='/account'><AccountPage user={this.state.user}/></Route>
        <Route path='/signin'><SignInRegister loadUser={this.loadUser} user={this.state.user}/></Route>
        {/* <Route path='/sign-in' component={SignInAndSignUpPage} /> */}
        </Switch>
  </div>
  );
  }
}



export default App;
