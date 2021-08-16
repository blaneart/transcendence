import React from 'react';
import { withRouter } from 'react-router-dom';


import './menu-item.styles.scss';
const MenuItem = ({title, history, linkUrl, match}) => {
    return (
    <div
    className='menu-item'
    onClick={() => history.push(`${match.url}${linkUrl}`)}>
        <h1>{title}</h1>
    </div>
    );
}

export default withRouter(MenuItem);