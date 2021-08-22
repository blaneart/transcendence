import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { History } from 'history';

import './menu-item.styles.scss';

interface MenuItemProps extends RouteComponentProps {
    title: string,
    history: History,
    linkUrl: string,

}

const MenuItem: React.FC<MenuItemProps> = ({title, history, linkUrl, match}) => {
    return (
    <div
    className='menu-item'
    onClick={() => history.push(`${match.url}${linkUrl}`)}>
        <h1>{title}</h1>
    </div>
    );
}

export default withRouter(MenuItem);