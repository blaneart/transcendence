import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { User } from "../../App.types";
import DuelGame from './duel-game/duel-game.component';
import Game from './game.component';

interface IGameProps {
    user?: User | null,
    setUser: React.Dispatch<React.SetStateAction<User | null | undefined>>,
    authToken: string,
    ranked: boolean
  }

  
const ChooseGame: React.FC<IGameProps> = ({user, setUser, authToken, ranked}) => {
    return (
        <div>

        
        </div>
        
    );
}

export default ChooseGame;