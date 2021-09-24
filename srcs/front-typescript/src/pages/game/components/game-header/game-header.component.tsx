import React from 'react';


interface IGameHeaderProps {
    playerId: number,
    userName: string,
    enemyName: string
}
const GameHeader: React.FC<IGameHeaderProps> = ({playerId, userName, enemyName}) => {

    const leftName = playerId ? enemyName : userName;
    const rightName = playerId ? userName : enemyName;

    return (
        <div>
            <div className="gameHeader">
        <span className="leftPlayerName">
          <h1>{leftName}</h1>
        </span>
        <span className="rightPlayerName">
          <h1>{rightName}</h1>
        </span>
        </div>
        </div>
    );
}

export default GameHeader;