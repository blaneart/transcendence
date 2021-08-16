import React from 'react';

import './account-info.styles.scss';


const Tables = ({name, score}) => (
    <div className='tables'>
    <span className='name'>{name}</span>
    <span className='score'>{score}</span>
    </div>
)
const Scores = ({wins, loses, games}) => (
    <div className="scores">
        <Tables name="GAMES" score={games}/>
        <Tables name="WINS" score={wins}/>
        <Tables name="LOSES" score={loses}/>
    </div>
)

export default Scores;