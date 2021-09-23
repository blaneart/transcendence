import React, { useEffect } from "react";

import { Settings } from "../../App.types";
import ChangeSettingsButton from "./settingsButton.component";

interface ISettingsProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

function preclick (settings: Settings)
{
    if (settings.ranked === true)
    {
        let elem = document.getElementById("setting0");
        if (elem != null)
            elem.classList.add("chosen-settings");
    }
    else
    {
        let elem = document.getElementById("setting1");
        if (elem != null)
            elem.classList.add("chosen-settings");
    }
    if (settings.maps === 0)
    {
        let elem = document.getElementById("setting2");
        if (elem != null)
            elem.classList.add("chosen-settings");
    }
    else if (settings.maps === 1)
    {
        let elem = document.getElementById("setting3");
        if (elem != null)
            elem.classList.add("chosen-settings");
    }
    else
    {
        let elem = document.getElementById("setting4");
        if (elem != null)
            elem.classList.add("chosen-settings");
    }
    if (settings.powerUps === true)
    {
        let elem = document.getElementById("setting5");
        if (elem != null)
            elem.classList.add("chosen-settings");
    }
    else
    {
        let elem = document.getElementById("setting6");
        if (elem != null)
            elem.classList.add("chosen-settings");
    }
}

const GameSettings: React.FC<ISettingsProps> = ({settings, setSettings}) => {

    useEffect (() =>
    {
        preclick(settings);
    }, [settings]);

    return (
        <div>
            <div>
                <div>Ranked</div>
                <div className="game-board-settings">
                    <ChangeSettingsButton id={'setting0'} name={'On'} ranked={true}  maps={settings.maps} powerUps={settings.powerUps}  setSettings={setSettings} />
                    <ChangeSettingsButton id={'setting1'} name={'Off'} ranked={false}  maps={settings.maps} powerUps={settings.powerUps}  setSettings={setSettings} />
                </div>
            </div>
            <div>
                <div>Maps</div>
                <div className="game-board-settings">
                    <ChangeSettingsButton id={'setting2'} name={'Map1'} ranked={settings.ranked}  maps={0} powerUps={settings.powerUps}  setSettings={setSettings} />
                    <ChangeSettingsButton id={'setting3'} name={'Map2'} ranked={settings.ranked}  maps={1} powerUps={settings.powerUps}  setSettings={setSettings} />
                    <ChangeSettingsButton id={'setting4'} name={'Map3'} ranked={settings.ranked}  maps={2} powerUps={settings.powerUps}  setSettings={setSettings} />
                </div>
            </div>
            <div>
                <div>Power-ups</div>
                <div className="game-board-settings">
                    <ChangeSettingsButton id={'setting5'} name={'On'} ranked={settings.ranked}  maps={settings.maps} powerUps={true}  setSettings={setSettings} />
                    <ChangeSettingsButton id={'setting6'} name={'Off'} ranked={settings.ranked}  maps={settings.maps} powerUps={false}  setSettings={setSettings} />
                </div>
            </div>
        </div>
    );
};

export default GameSettings;
