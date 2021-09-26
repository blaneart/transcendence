import React, { useEffect, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Settings } from "../../App.types";
import {isSafari} from "react-device-detect";


interface ISettingsProps {
    settings: Settings;
    setSettings: React.Dispatch<React.SetStateAction<Settings>>;
    blobColor: string;
    setBlobColor: React.Dispatch<React.SetStateAction<string>>
  }

const GameSettings: React.FC<ISettingsProps> = ({settings, setSettings, blobColor, setBlobColor}) => {
    const [colorRank, setColorRank] = useState({
        on: "red",
        off: "red"
    });
    const [colorMap, setColorMap] = useState({
        map1: "red",
        map2: "red",
        map3: "red"
    })
    const [colorPower, setColorPower] = useState({
        on: "red",
        off: "red"

    })
    const [colorSound, setColorSound] = useState({
        on: "red",
        off: "red"

    })
    useEffect(() => {
        if (settings.ranked)
            setColorRank({
                on: "green",
                off: "red"
            })
        else
            setColorRank({
                on: "red",
                off: "green"}
                )

    }, [settings.ranked])
    useEffect(() => {
        if (settings.sounds)
            setColorSound({
                on: "green",
                off: "red"
            })
        else
            setColorSound({
                on: "red",
                off: "green"}
                )

    }, [settings.sounds])
    useEffect(() => {
        if (settings.powerUps)
            setColorPower({
                on: "green",
                off: "red"
            })
        else
            setColorPower({
                on: "red",
                off: "green"}
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
    
    const makeRandom= () => {
        setBlobColor("#" + Math.ceil((Math.random() * 9)).toString() + 
        Math.ceil((Math.random() * 9)).toString() + 
        Math.ceil((Math.random() * 9)).toString() + 
        Math.ceil((Math.random() * 9)).toString() + 
        Math.ceil((Math.random() * 9)).toString()+ 
        Math.ceil((Math.random() * 9)).toString());
    }

    let buttonRankClassOn = `cursor-pointer px-6 py-2 rounded-lg border-1  ml-0 border-solid border-${colorRank.on}-400 bg-${colorRank.on}-300 hover:border-${colorRank.on}-600 hover:bg-${colorRank.on}-400 text-${colorRank.on}-600 font-bold hover:text-${colorRank.on}-800 border-${colorRank.on}-500`;
    let buttonRankClassOff = `cursor-pointer px-6 py-2 rounded-lg border-1  border-solid border-${colorRank.off}-400 bg-${colorRank.off}-300 hover:border-${colorRank.off}-600 hover:bg-${colorRank.off}-400 text-${colorRank.off}-600 font-bold hover:text-${colorRank.off}-800 border-${colorRank.off}-500`;
    let buttonSoundClassOn = `cursor-pointer px-6 py-2 rounded-lg border-1 ml-0 border-solid border-${colorSound.on}-400 bg-${colorSound.on}-300 hover:border-${colorSound.on}-600 hover:bg-${colorSound.on}-400 text-${colorSound.on}-600 font-bold hover:text-${colorSound.on}-800 border-${colorSound.on}-500`;
    let buttonSoundClassOff = `cursor-pointer px-6 py-2 rounded-lg border-1  border-solid border-${colorSound.off}-400 bg-${colorSound.off}-300 hover:border-${colorSound.off}-600 hover:bg-${colorSound.off}-400 text-${colorSound.off}-600 font-bold hover:text-${colorSound.off}-800 border-${colorSound.off}-500`;
    let buttonPowerClassOn = `cursor-pointer px-6 py-2 rounded-lg border-1  ml-0 border-solid border-${colorPower.on}-400 bg-${colorPower.on}-300 hover:border-${colorPower.on}-600 hover:bg-${colorPower.on}-400 text-${colorPower.on}-600 font-bold hover:text-${colorPower.on}-800 border-${colorPower.on}-500`;
    let buttonPowerClassOff = `cursor-pointer px-6 py-2 rounded-lg border-1  border-solid border-${colorPower.off}-400 bg-${colorPower.off}-300 hover:border-${colorPower.off}-600 hover:bg-${colorPower.off}-400 text-${colorPower.off}-600 font-bold hover:text-${colorPower.off}-800 border-${colorPower.off}-500`;
    let buttonMapClass1 = `cursor-pointer px-6 py-2 rounded-lg border-1  ml-0 border-solid border-${colorMap.map1}-400 bg-${colorMap.map1}-300 hover:border-${colorMap.map1}-600 hover:bg-${colorMap.map1}-400 text-${colorMap.map1}-600 font-bold hover:text-${colorMap.map1}-800 border-${colorMap.map1}-500`;
    let buttonMapClass2 = `cursor-pointer px-6 py-2 rounded-lg border-1  border-solid border-${colorMap.map2}-400 bg-${colorMap.map2}-300 hover:border-${colorMap.map2}-600 hover:bg-${colorMap.map2}-400 text-${colorMap.map2}-600 font-bold hover:text-${colorMap.map2}-800 border-${colorMap.map2}-500`;
    let buttonMapClass3 = `cursor-pointer px-6 py-2 rounded-lg border-1  border-solid border-${colorMap.map3}-400 bg-${colorMap.map3}-300 hover:border-${colorMap.map3}-600 hover:bg-${colorMap.map3}-400 text-${colorMap.map3}-600 font-bold hover:text-${colorMap.map3}-800 border-${colorMap.map3}-500`;
    let buttonRandom= `cursor-pointer px-6 py-2 rounded-lg border-1 ml-0 border-solid border-white-400 bg-white-300 hover:border-white-600 hover:bg-white-400 text-white-600 font-bold hover:text-white-800 border-white-500`;
    let pClass = `text-center font-xl`;
    return (
        <div className="bg-black bg-opacity-75 px-100 py-10 rounded-xl shadow-lg content-center">
            <p className={pClass}>Ranked</p>
            <div className="flex flex-row justify-center">
                  <button className={buttonRankClassOn} onClick={()=>setSettings({
                        ranked: true,
                        maps: settings.maps,
                        powerUps: settings.powerUps,
                        sounds: settings.sounds
                  })}>ON</button>
                  <button className={buttonRankClassOff} onClick={()=>setSettings({
                        ranked: false,
                        maps: settings.maps,
                        powerUps: settings.powerUps,
                        sounds: settings.sounds
                  })}>OFF</button>
            </div>

            <p className={pClass}>Maps</p>
            <div className="flex flex-row justify-center">
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

            <p className={pClass}>powerUps</p>
            <div className="flex flex-row justify-center">
                  <button className={buttonPowerClassOn} onClick={()=>setSettings({
                        ranked: settings.ranked,
                        maps: settings.maps,
                        powerUps: true,
                        sounds: settings.sounds
                  })}>ON</button>
                  <button className={buttonPowerClassOff} onClick={()=>setSettings({
                        ranked: settings.ranked,
                        maps: settings.maps,
                        powerUps: false,
                        sounds: settings.sounds
                  })}>OFF</button>
            </div>

            <p className={pClass}>Sounds</p>
            <div className="flex flex-row justify-center">
                  <button className={buttonSoundClassOn} onClick={()=>
                  {
                      if (isSafari)
                        alert('Sounds do not work in your browser, sorry:(')
                      else
                        setSettings({
                        ranked: settings.ranked,
                        maps: settings.maps,
                        powerUps: settings.powerUps,
                        sounds: true
                  })}}>ON</button>
                  <button className={buttonSoundClassOff} onClick={()=>setSettings({
                        ranked: settings.ranked,
                        maps: settings.maps,
                        powerUps: settings.powerUps,
                        sounds: false
                  })}>OFF</button>
            </div>
            <div className="flex flex-row justify-center mt-10 ">
      <HexColorPicker color={blobColor} onChange={setBlobColor} />
    </div>
    <div className="flex flex-row justify-center mt-2">

    <button className={buttonRandom} style={{backgroundColor:blobColor , color:'white'} } onClick={makeRandom} >Make random</button>
    </div>
        </div>
    )
};

export default GameSettings;