import React, { useCallback, useEffect, useState } from "react";
import { User, Game } from '../users.types';
import GameComponent from './game.component';

import './usersList.styles.scss';
import './friend.styles.scss';

interface IGameHistoryProps {
  user?: User | null;
  authToken: string;
}

async function getGames(authToken: string): Promise<Game[]> {

  const response = await fetch("http://127.0.0.1:3000/games", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });
  const jsonData = await response.json();

  return jsonData as Game[];
}

const GameHistory: React.FC<IGameHistoryProps> = ({
  user,
  authToken,
  }) => {

  const [games, setGames] = useState<Game[]>([]);

  const refreshGames = useCallback(() => {
    getGames(authToken).then(newGames => {
      setGames(newGames);
    });
  }, [authToken]);

  useEffect(() => {
    // On setup, we update the games
    refreshGames();
  }, [refreshGames]); // We don't really reupdate.
  
  return ( games.length ?
    (<div>
      <h2>Games: </h2>
      {games.map((game) =>
      <div className='friend' key={game.id}>
        <table>
        <GameComponent game={game} user={user} authToken={authToken} />
        </table>
      </div>)}
    </div>)
    :
    (<div></div>)
  );
};

export default GameHistory;