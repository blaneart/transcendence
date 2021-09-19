import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { User } from "../../App.types";
import DuelGame from './duel-game/duel-game.component';
import Game from './game.component';

interface IGameProps {
    user?: User | null,
    setUser: React.Dispatch<React.SetStateAction<User | null | undefined>>,
    authToken: string
  }

  
const ChooseGame: React.FC<IGameProps> = ({user, setUser, authToken}) => {
    return (
        <div>
        <Switch>
        <Route exact path="/play">
            <Game user={user} setUser={setUser} authToken={authToken} ranked={true}/>

                </Route>
        <Route exact path="/play/duels/:room">
            <DuelGame />
                </Route>
    </Switch>
        
        </div>
        
    );
}