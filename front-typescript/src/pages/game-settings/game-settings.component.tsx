import React from "react";

import { Settings } from "../../App.types";
import ChangeSettingsButton from "./settingsButton.component";

interface ISettingsProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

const GameSettings: React.FC<ISettingsProps> = ({
  settings,
  setSettings
}) => {
    return (
        <div>
            <div>
                <div>Ranked</div>
                <div className="game-board-settings">
                    <ChangeSettingsButton name={'On'} ranked={true}  maps={settings.maps} powerUps={settings.powerUps}  setSettings={setSettings} />
                    <ChangeSettingsButton name={'Off'} ranked={false}  maps={settings.maps} powerUps={settings.powerUps}  setSettings={setSettings} />
                </div>
            </div>
            <div>
                <div>Maps</div>
                <div className="game-board-settings">
                    <ChangeSettingsButton name={'Map1'} ranked={settings.ranked}  maps={0} powerUps={settings.powerUps}  setSettings={setSettings} />
                    <ChangeSettingsButton name={'Map2'} ranked={settings.ranked}  maps={1} powerUps={settings.powerUps}  setSettings={setSettings} />
                    <ChangeSettingsButton name={'Map3'} ranked={settings.ranked}  maps={2} powerUps={settings.powerUps}  setSettings={setSettings} />
                </div>
            </div>
            <div>
                <div>Power-ups</div>
                <div className="game-board-settings">
                    <ChangeSettingsButton name={'On'} ranked={settings.ranked}  maps={settings.maps} powerUps={true}  setSettings={setSettings} />
                    <ChangeSettingsButton name={'Off'} ranked={settings.ranked}  maps={settings.maps} powerUps={false}  setSettings={setSettings} />
                </div>
            </div>
        </div>
    );
};

export default GameSettings;
