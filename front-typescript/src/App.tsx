import React, { useState } from 'react';
import logo from './logo.svg';
import { Switch, Route } from 'react-router-dom';
import HomePage from './pages/homepage/homepage.component';
import Header from './components/header/header.component';
import Game from './pages/game/game.component';

import './App.css';

interface IState {
  user: {
    id: string,
    name: string,
    avatar: string,
    games: number,
    wins: number
  } | null

}

function App() {
  const [user, setUser] = useState<IState["user"]>();
  const [isSigned, setIsSigned] = useState(false);

  return (
    <div className="App">
      <Header user={user}/>
      <Switch>
      <Route exact path='/' component={HomePage} />
        <Route path='/play' component={Game} />
        {/* <Route path='/account'><AccountPage user={this.state.user}/></Route> */}
        {/* <Route path='/signin'><SignInRegister loadUser={this.loadUser} user={this.state.user}/></Route> */}
        {/* <Route path='/sign-in' component={SignInAndSignUpPage} /> */}
        </Switch>
  </div>
  );
}

export default App;
