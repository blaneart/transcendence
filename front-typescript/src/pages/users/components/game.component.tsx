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
    <div className="flex flex-row py-3 items-center">
      <div className="px-1">
        <span className="text-gray-400 text-sm text-opacity-75 px-1">({game.winner_elo}) </span>
        <span>{game.winner}</span>
      </div>
      <span className="font-bold px-2">{10} — {game.loserScore}</span>
      <div className="px-1">
        <span>{game.loser}</span>
        <span className="text-sm text-gray-400 text-opacity-75 px-1"> ({game.loser_elo})</span>
      </div>
    </div>
    : <div></div>
  );
}
  
  export default GameComponent;