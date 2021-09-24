import React from 'react';
import { Link } from 'react-router-dom';
import OfflineGame from '../offline-game/offline-game.component';


interface I404 {
    authToken: string,
    difficultyLvl: any,
    map: any
}
const Custom404: React.FC<I404> = ({authToken, difficultyLvl, map}) => {
    return (
        <div>
            <div className="text-center">
        <h1>Sorry, we couldn't find that page. But you still can play pong!</h1>
        <h1>... or go back to the menu</h1>
        </div>
        <Link to="/">GO TO THE MENU</Link>
        <OfflineGame authToken={authToken} difficultyLvl={difficultyLvl} map={map}></OfflineGame>

        </div>
    )
}

export default Custom404;