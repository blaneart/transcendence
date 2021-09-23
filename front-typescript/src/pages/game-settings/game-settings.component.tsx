import React, { useEffect, useState } from 'react';
import { Settings } from "../../App.types";



interface ISettingsProps {
    settings: Settings;
    setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  }

const GameSettings: React.FC<ISettingsProps> = ({settings, setSettings}) => {
    const [colorRank, setColorRank] = useState({
        yes: "red",
        no: "red"
    });
    const [colorMap, setColorMap] = useState({
        map1: "red",
        map2: "red",
        map3: "red"
    })
    const [colorPower, setColorPower] = useState({
        yes: "red",
        no: "red"

    })
    const [colorSound, setColorSound] = useState({
        yes: "red",
        no: "red"

    })
    useEffect(() => {
        if (settings.ranked)
            setColorRank({
                yes: "green",
                no: "red"
            })
        else
            setColorRank({
                yes: "red",
                no: "green"}
                )

    }, [settings.ranked])
    useEffect(() => {
        if (settings.sounds)
            setColorSound({
                yes: "green",
                no: "red"
            })
        else
            setColorSound({
                yes: "red",
                no: "green"}
                )

    }, [settings.sounds])
    useEffect(() => {
        if (settings.powerUps)
            setColorPower({
                yes: "green",
                no: "red"
            })
        else
            setColorPower({
                yes: "red",
                no: "green"}
                )

    }, [settings.powerUps])
    
    useEffect(() => {
        if (settings.maps === 0)
            setColorMap({
            map1: "green",
            map2: "red",
            map3: "red"
        })
        else if (settings.maps === 1)
            setColorMap({
            map1: "red",
            map2: "green",
            map3: "red"
        })       
        else
            setColorMap({
                map1: "red",
                map2: "red",
                map3: "green"
            })
    }, [settings.maps])
    let buttonRankClassYes = `px-6 py-2 rounded-lg border-1 border-solid border-${colorRank.yes}-500 bg-${colorRank.yes}-300 text-${colorRank.yes}-900 font-bold`;
    let buttonRankClassNo = `px-6 py-2 rounded-lg border-1 border-solid border-${colorRank.no}-500 bg-${colorRank.no}-300 text-${colorRank.no}-900 font-bold`;
    let buttonSoundClassYes = `px-6 py-2 rounded-lg border-1 border-solid border-${colorSound.yes}-500 bg-${colorSound.yes}-300 text-${colorSound.yes}-900 font-bold`;
    let buttonSoundClassNo = `px-6 py-2 rounded-lg border-1 border-solid border-${colorSound.no}-500 bg-${colorSound.no}-300 text-${colorSound.no}-900 font-bold`;
    let buttonPowerClassYes = `px-6 py-2 rounded-lg border-1 border-solid border-${colorPower.yes}-500 bg-${colorPower.yes}-300 text-${colorPower.yes}-900 font-bold`;
    let buttonPowerClassNo = `px-6 py-2 rounded-lg border-1 border-solid border-${colorPower.no}-500 bg-${colorPower.no}-300 text-${colorPower.no}-900 font-bold`;
    let buttonMapClass1 = `px-6 py-2 rounded-lg border-1 border-solid border-${colorMap.map1}-500 bg-${colorMap.map1}-300 text-${colorMap.map1}-900 font-bold`;
    let buttonMapClass2 = `px-6 py-2 rounded-lg border-1 border-solid border-${colorMap.map2}-500 bg-${colorMap.map2}-300 text-${colorMap.map2}-900 font-bold`;
    let buttonMapClass3 = `px-6 py-2 rounded-lg border-1 border-solid border-${colorMap.map3}-500 bg-${colorMap.map3}-300 text-${colorMap.map3}-900 font-bold`;

    return (
        <div>
            <p>Ranked</p>
            <div className="flex flex-row">
                  <button className={buttonRankClassYes} onClick={()=>setSettings({
                        ranked: true,
                        maps: settings.maps,
                        powerUps: settings.powerUps,
                        sounds: settings.sounds
                  })}>YES</button>
                  <button className={buttonRankClassNo} onClick={()=>setSettings({
                        ranked: false,
                        maps: settings.maps,
                        powerUps: settings.powerUps,
                        sounds: settings.sounds
                  })}>NO</button>
            </div>

            <p>Maps</p>
            <div className="flex flex-row">
                  <button className={buttonMapClass1} onClick={()=>setSettings({
                        ranked: settings.ranked,
                        maps: 0,
                        powerUps: settings.powerUps,
                        sounds: settings.sounds
                  })}>1</button>
                  <button className={buttonMapClass2} onClick={()=>setSettings({
                        ranked: settings.ranked,
                        maps: 1,
                        powerUps: settings.powerUps,
                        sounds: settings.sounds
                  })}>2</button>
                    <button className={buttonMapClass3} onClick={()=>setSettings({
                        ranked: settings.ranked,
                        maps: 2,
                        powerUps: settings.powerUps,
                        sounds: settings.sounds
                  })}>3</button>
            </div>

            <p>powerUps</p>
            <div className="flex flex-row">
                  <button className={buttonPowerClassYes} onClick={()=>setSettings({
                        ranked: settings.ranked,
                        maps: settings.maps,
                        powerUps: true,
                        sounds: settings.sounds
                  })}>YES</button>
                  <button className={buttonPowerClassNo} onClick={()=>setSettings({
                        ranked: settings.ranked,
                        maps: settings.maps,
                        powerUps: false,
                        sounds: settings.sounds
                  })}>NO</button>
            </div>

            <p>Sounds</p>
            <div className="flex flex-row">
                  <button className={buttonSoundClassYes} onClick={()=>setSettings({
                        ranked: settings.ranked,
                        maps: settings.maps,
                        powerUps: settings.powerUps,
                        sounds: true
                  })}>ON</button>
                  <button className={buttonSoundClassNo} onClick={()=>setSettings({
                        ranked: settings.ranked,
                        maps: settings.maps,
                        powerUps: settings.powerUps,
                        sounds: false
                  })}>OFF</button>
            </div>
        </div>
    )
};

export default GameSettings;