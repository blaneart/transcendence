import React from 'react';
import MenuItem from '../menu-item/menu-item.component';

import './menu.styles.scss';

interface User {
    id: number;
    name: string;
    id42: number;
    avatar: string;
    games: number;
    elo: number;
    wins: number;
    twofa: boolean;
    twofaSecret: string;
    realAvatar: boolean
    status: number;
}

interface IMenuProps {
    user?: User | null;
}

interface IMenuState{ 
        title: string,
        linkUrl: string,
        id: number
}

const Menu: React.FC<IMenuProps> = ({ user }) => {
    let sections: IMenuState[] = user ? [
        {
            title: "PLAY ONLINE",
            linkUrl: 'play',
            id: 1
        },
        {
            title: "PLAY BOTS",
            linkUrl: 'playbots',
            id: 2
        },
        {
            title: "WATCH",
            linkUrl: 'watch',
            id: 9
        },
        {
            title: "GAME SETTINGS",
            linkUrl: 'game-settings',
            id: 3
        },
        {
            title: "CHATS",
            linkUrl: 'chats',
            id: 4
        },
        {
            title: "ACCOUNT",
            linkUrl: 'users/' + user.name,
            id: 5
        },
        {
            title: "USERS",
            linkUrl: 'users',
            id: 6
        },
        {
            title: "Friends",
            linkUrl: 'friends',
            id: 7
        },
        {
          title: "CHEATS",
          linkUrl: 'cheats',
          id: 8
        },
    ] : [
        {
            title: "PLAY BOTS",
            linkUrl: 'playbots',
            id: 1
        },
        {
            title: "GAME SETTINGS",
            linkUrl: 'game-settings',
            id: 2
        },
        {
            title: "CHEATS",
            linkUrl: 'cheats',
            id: 3
        }
    ]

    const renderMenuList = (): JSX.Element[] => {
        return sections.map(({id, ...otherSectionsProps}) => {
            return(
            <MenuItem key={id} {...otherSectionsProps} />
        ) ;
    })
    }
    return (
         <div className='menu'>
                {renderMenuList()}
            </div>
        );
}

export default Menu;