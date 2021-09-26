import React from 'react';
import MenuItem from '../menu-item/menu-item.component';
import { User } from "../../App.types";

import './menu.styles.scss';

interface IMenuProps {
    user?: User | null;
}

const Menu: React.FC<IMenuProps> = ({ user }) => {

    if (user)
    {
      return (
        <div className="menu">
          <MenuItem title="PLAY ONLINE" linkUrl='play' key="1" />
          <MenuItem title="PLAY BOTS" linkUrl='playbots' key="2" />
          <MenuItem title="WATCH" linkUrl='watch' key="9" />
          <MenuItem title="GAME SETTINGS" linkUrl='game-settings' key="3" />
          <MenuItem title="CHATS" linkUrl='chats' key="4" />
          <MenuItem title="ACCOUNT" linkUrl={`users/${user.name}`} key="5" />
          <MenuItem title="USERS" linkUrl='users' key="6" />
          <MenuItem title="FRIENDS" linkUrl='friends' key="7" />
          <MenuItem title="RULESET" linkUrl='ruleset' key="10" />
          <MenuItem title="CHEATS" linkUrl='cheats' key="8" />
          {
            user.owner || user.admin
            ? <MenuItem title="ADMIN PANEL" linkUrl='adminPanel' key="11" />
            : null
          }
        </div>
      );
    }
    else
    {
      return (
        <div className="menu">
          <MenuItem key="2" title="PLAY BOTS" linkUrl='playbots'/>
          <MenuItem key="3" title="GAME SETTINGS" linkUrl='game-settings'/>
          <MenuItem key="10" title="RULESET" linkUrl='ruleset'/>
          <MenuItem key="8" title="CHEATS" linkUrl='cheats'/>
        </div>
      )
    }
}

export default Menu;