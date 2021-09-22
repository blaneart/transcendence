import React from "react";
import { User, Game } from "../users.types";

interface IGameProps {
  game?: Game | null;
  user?: User | null;
    authToken: string;
  }

const GameComponent: React.FC<IGameProps> = ({
  game,
  user,
  authToken,
  }) => {
  return (game ?
    <div>
      <td>{game.winner} ({game.winner_elo})</td>
      <td>{10} - </td>
      <td>{game.loserScore} ({game.loser_elo})</td>
      <td>{game.loser}</td>
    </div>
    : <div></div>
  );
}
  
  export default GameComponent;