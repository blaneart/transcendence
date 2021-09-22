import React from 'react';
import { Settings } from "../../App.types";

interface IButtonProps {
    name: string,
    ranked: Boolean;
    maps: number;
    powerUps: Boolean;
    setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}


const ChangeSettingsButton: React.FC<IButtonProps> = ({
    name,
    ranked,
    maps,
    powerUps,
    setSettings,
}) => {

    const HandleClick = () => {
        var set = {} as Settings;
        set.ranked = ranked;
        set.maps = maps;
        set.powerUps = powerUps;
      setSettings(set);
    }
    
    return (
    <button type="button" onClick={HandleClick}>
        {name}
    </button>
    );
};

export default ChangeSettingsButton;