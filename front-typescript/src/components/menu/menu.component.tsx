import React, { useState } from 'react';
import MenuItem from '../menu-item/menu-item.component';

import './menu.styles.scss';

interface IMenuState{ 
    sections: {
        title: string,
        linkUrl: string,
        id: number
    }[]
}

const Menu = () => {
    const [sections, setSections] = useState<IMenuState["sections"]>([
        {
            title: "PLAY",
            linkUrl: 'play',
            id: 1
        },
        {
            title: "SETTINGS",
            linkUrl: '',
            id: 2
        },
        {
          title: "CHATS",
          linkUrl: 'chats',
          id: 3
      },
      {
        title: "USERS",
        linkUrl: 'users',
        id: 4
    },
    ])

    
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