import React from 'react';
import { Settings } from "../../App.types";
import './settingsButton.scss'

interface IButtonProps {
    id: string;
    name: string,
    ranked: Boolean;
    maps: number;
    powerUps: Boolean;
    setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}


const ChangeSettingsButton: React.FC<IButtonProps> = ({
    id,
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
        let elem = document.getElementById(id);
        if (elem != null)
            elem.classList.add("chosen-settings");
        if (id === "setting0")
        {
            elem = document.getElementById("setting1");
            if (elem != null)
                elem.classList.remove("chosen-settings");
        }
        else if (id === "setting1")
        {
            elem = document.getElementById("setting0");
            if (elem != null)
                elem.classList.remove("chosen-settings");
        }
        else if (id === "setting6")
        {
            elem = document.getElementById("setting5");
            if (elem != null)
                elem.classList.remove("chosen-settings");
        }
        else if (id === "setting5")
        {
            elem = document.getElementById("setting6");
            if (elem != null)
                elem.classList.remove("chosen-settings");
        }
        else if (id === "setting2")
        {
            elem = document.getElementById("setting3");
            if (elem != null)
                elem.classList.remove("chosen-settings");
            elem = document.getElementById("setting4");
            if (elem != null)
                elem.classList.remove("chosen-settings");
        }
        else if (id === "setting3")
        {
            elem = document.getElementById("setting2");
            if (elem != null)
                elem.classList.remove("chosen-settings");
            elem = document.getElementById("setting4");
            if (elem != null)
                elem.classList.remove("chosen-settings");
        }
        else if (id === "setting4")
        {
            elem = document.getElementById("setting3");
            if (elem != null)
                elem.classList.remove("chosen-settings");
            elem = document.getElementById("setting2");
            if (elem != null)
                elem.classList.remove("chosen-settings");
        }
    }

    return (
    <button id={id} className="square-settings" onClick={HandleClick}>
        {name}
    </button>
    );
};

export default ChangeSettingsButton;