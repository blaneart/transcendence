import React, { useRef, useState } from "react";
import { User } from "../../App.types";
import leftArrow from '../../assets/left.png'
import rightArrow from '../../assets/right.png'
export interface IRuleSetProps {
    user?: User | null,
}

const RuleSet: React.FC<IRuleSetProps> = ({
    user
}) => {

  let rules= [
    {
      header: "LOGIN",
      rule: "Hello! If you want to experience PONG in all its glory you should log with your 42 account by pressing that beautiful button on the up and right of this website. You will have access to all features of our website."
    },
    {
      header: "PLAY ONLINE",
      rule: "You can play against other players online! Just press online and we'll find a worthy opponent for you! Choose map, choose ranked/not ranked, choose power-ups or no in game settings and enjoy!"
    },
    {
      header: "PLAY BOTS",
      rule: "If you dont feel like playing against other humans or want to train you can challenge our Artificial Intellegence Pong System 3000"
    },
    {
      
      header: "WATCH",
      rule: "Here you can watch other player playing games. Just choose the room and root for the beautiful game!"
    },
    {
      header: "GAME SETTINGS",
      rule: "Here you can choose which game mode you want to play. You can choose among three maps. First map is a classic pong-1972 map. Other maps are offering you different obstacles on the map. Also you can have power-ups that can change the fate of the game! If you want to be number one you can play rank games and earn your title! Ranked games will change your rank. You can check your rank on ACCOUNT page."
    },
    {
      header: "CHATS",
      rule: "You can join our chat rooms and discuss everything you want. Be polite because you can be banned if you gonna be too annoying. You can create rooms, moderate them, send private messages and challenge other members of these chat rooms for a game! The one who sends invite gonna decide game rules for the duel."
    },
    {
      header: "ACCOUNT",
      rule: "If you want to access your info - it's the page you are looking for. You can upload your own avatar, change your nickname, secure your account with 2FA and check you stats!"
    },
    {
      header: "USERS",
      rule: "This page allows you to check all other players, add them to your friendlist!"
    },
    {
      header: "FRIENDS",
      rule: "It is your friendlist. You can send private messages to your friends, check their status or (hope that it will never happen) unfriend them"
    },
    {
      header: "RULESET",
      rule: "Well... hello :) You can check rules here"
    },
    {
      header: "CHEATS",
      rule: "Psst, wanna make fake account?"
    },
    {
      header: "ADMIN PANEL",
      rule: "YOU ARE THE SHERIFF. You can decide fate of all other users, promote them or ban from using our platform."
    }
  ]
  let unlog_rules =[
    {
      header: "LOGIN",
      rule: "Hello! If you want to experience PONG in all its glory you should log with your 42 account. You will have access to all features of our website."
    },
    {
      header: "PLAY BOTS",
      rule: "If you dont feel like playing against other humans or want to train you can challenge our Artificial Intellegence Pong System 3000"
    },
    {
      header: "GAME SETTINGS",
      rule: "Here you can choose which game mode you want to play. You can choose among three maps. First map is a classic pong-1972 map. Other maps are offering you different obstacles on the map. Also you can have power-ups that can change the fate of the game! If you want to be number one you can play rank games and earn your title! Ranked games will change your rank. You can check your rank on ACCOUNT page."
    },
    {
      header: "RULESET",
      rule: "Well... hello :) You can check rules here"
    },
    {
      header: "CHEATS",
      rule: "Psst, wanna make fake account?"
    }
  ]
  const [filler, setFiller] = useState(rules[0])
  const counter = useRef(0);
  const max_c = 11;
  const max_unlog = 4;
  
  if (user)
  {
      return (
      <div className="flex items-center justify-center h-screen space-x-40" >
        <img src={leftArrow} alt="Previous ruleset button" className="w-10 cursor-pointer" onClick={()=> {
            counter.current = counter.current === 0 ?  max_c : counter.current - 1;
            setFiller(rules[counter.current])}}/>
      <div className="w-8/12 h-4/6 bg-black rounded-lg text-center border border-white-800 border-solid">
        <p className="text-white-600 text-7xl">{filler.header}</p>
          {filler.rule}
          </div>
    <img src={rightArrow} alt="Next ruleset button" className="w-10 cursor-pointer" onClick={()=> {
            counter.current = counter.current === max_c ?  0 : counter.current + 1;
            setFiller(rules[counter.current])}}/>
      </div>
    );
  }
else
{
  if (counter.current >= max_unlog)
    counter.current = 0;
  return (
      <div className="flex items-center justify-center h-screen space-x-40" >
        <img src={leftArrow} alt="Previous ruleset button" className="w-10 cursor-pointer" onClick={()=> {
            counter.current = counter.current === 0 ?  max_unlog : counter.current - 1;
            setFiller(unlog_rules[counter.current])}}/>
      <div className="w-8/12 h-4/6 bg-black rounded-lg text-center border border-white-800 border-solid">
        <p className="text-white-600 text-7xl">{filler.header}</p>
          {filler.rule}
    </div>
    <img src={rightArrow} alt="Next ruleset button" className="w-10 cursor-pointer" onClick={()=> {
            counter.current = counter.current === max_unlog ?  0 : counter.current + 1;
            setFiller(rules[counter.current])}}/>

      </div>
    );
}
};

export default RuleSet;
