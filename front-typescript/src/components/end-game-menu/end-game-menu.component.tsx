import React from 'react';
import { Link } from 'react-router-dom';


interface IButtonProps {
    result: string,
    onClick: React.MouseEventHandler<HTMLButtonElement>

}


const EndGameMenu: React.FC<IButtonProps> = ({result, ...changeGameState}) => {

    return (

        // <div className='end-game-menu'>
        <div className='game end'>
            <h1 style={{fontSize: 72}}>{(result === 'won' || result === "gotAbandoned") ? "YOU WON!" : "YOU LOST!"}</h1>
            {result === 'gotAbandoned' ? <p>Your opponent has disconnected (or abandoned the game)</p> : null}
            <button className='element' {...changeGameState}>RESTART</button>
            

            <div className='element'>
                  <Link  to="/">BACK TO THE MENU</Link>
            </div>

        </div>
    );
}

export default EndGameMenu;