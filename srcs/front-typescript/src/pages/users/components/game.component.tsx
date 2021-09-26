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
  const cardGreen: boolean = game && user && game.winner === user.name ? true : false;
  const cardClass = `flex flex-col py-3 items-center ${cardGreen ? 'bg-green-800' : 'bg-red-800'} bg-opacity-75 mb-2 rounded-lg shadow-lg text-white px-4`;
  return (game ?
    <div className={cardClass}>
      
      <div className="flex flex-row">
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
      <div className="flex flex-row">
      <div className="text-xs text-opacity-50 text-gray-100 px-1 border-0 border-r-2 border-solid border-gray-500 border-opacity-50">{game.ranked ? "Ranked" : "Unranked"}</div>
      <div className="text-xs text-opacity-50 text-gray-100 px-1 border-0 border-r-2 border-solid border-gray-500 border-opacity-50">Map {game.maps + 1}</div>
      <div className="text-xs text-opacity-50 text-gray-100 px-1">PowerUps {game.powerUps ? "On" : "Off"}</div>
      </div>
      </div>
    : <div></div>
  );
}

export default GameComponent;