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
            <h1 className="text-6xl">{(result === 'won' || result === "gotAbandoned") ? "YOU WON!" : "YOU LOST!"}</h1>
            {result === 'gotAbandoned' ? <p className='text-xl'>Your opponent has disconnected (or abandoned the game)</p> : null}
            <button className='text-4xl' {...changeGameState}>RESTART</button>
            

            <div className='text-3xl'>
                  <Link  to="/"><span className="text-2xl">BACK TO THE MENU</span></Link>
            </div>

        </div>
    );
}

export default EndGameMenu;