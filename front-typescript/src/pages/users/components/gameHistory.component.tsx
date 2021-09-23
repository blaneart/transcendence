import React, { useCallback, useEffect, useState } from "react";
import { User, Game } from '../users.types';
import GameComponent from './game.component';

import './usersList.styles.scss';
import './friend.styles.scss';

interface IGameHistoryProps {
  user: User;
  authToken: string;
}

async function getGames(authToken: string, id: number): Promise<Game[] | null> {
    const data = {
      id: id
    };
    const response = await fetch(process.env.REACT_APP_API_URL + "/games", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok)
    return null;
  const jsonData = await response.json();

  return jsonData as Game[];
}

const GameHistory: React.FC<IGameHistoryProps> = ({
  user,
  authToken,
  }) => {
    const [games, setGames] = useState<Game[]>([]);

  const refreshGames = useCallback(() => {

    getGames(authToken, user.id).then(newGames => {
      if (newGames === null)
        return;
      setGames(newGames);
      });
  }, [authToken, user.id]);

    useEffect(() => {
    // On setup, we update the games
    refreshGames();
  }, [user, refreshGames]); // We don't really reupdate.
  
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