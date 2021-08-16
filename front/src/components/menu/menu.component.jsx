import React from 'react';
import MenuItem from '../menu-item/menu-item.component';

import './menu.styles.scss';

class Menu extends React.Component 
{
    constructor()
    {
        super();
        this.state = 
            {
            section: [
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
                title: "ACCOUNT",
                linkUrl: 'account',
                id: 3
            }
        ]
        }
    }

        
    render() {
        return (
            <div className='menu'>
                {this.state.section.map(({id, ...otherSectionProps }) => (
                    <MenuItem key={id} {...otherSectionProps} />
                ))}
            </div>
        );
    }
}

export default Menu;