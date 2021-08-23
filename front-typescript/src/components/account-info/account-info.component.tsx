import React from 'react';

import './account-info.styles.scss';


interface ITableProps {
    name: string,
    score: number
}


interface IScoresProps {
    wins: number,
    loses: number,
    games: number
}
const Tables: React.FC<ITableProps> = ({name, score}) => (
    <div className='tables'>
    <span >{name}</span>
    <span >{score}</span>
    </div>
)
const Scores: React.FC<IScoresProps> = ({wins, loses, games}) => (
    <div className="scores">
        <Tables name="GAMES" score={games}/>
        <Tables name="WINS" score={wins}/>
        <Tables name="LOSES" score={loses}/>
    </div>
)

export default Scores;