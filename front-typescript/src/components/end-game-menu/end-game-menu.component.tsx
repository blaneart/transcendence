import React from 'react';
import { Link } from 'react-router-dom';

interface IButtonProps {
    onClick: React.MouseEventHandler<HTMLButtonElement>
}

const EndGameMenu: React.FC<IButtonProps> = ({...changeGameState}) => {

    return (

        // <div className='end-game-menu'>
        <div className='game end'>
            <h1>GAME ENDED</h1>

            <button {...changeGameState}>RESTART</button>

            <Link to="/">Back to the menu</Link>

        </div>
    );
}

export default EndGameMenu;