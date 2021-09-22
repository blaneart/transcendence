import React, { useRef, useState } from "react";
import { User } from "../../App.types";
import leftArray from '../../assets/left.png'
import rightArray from '../../assets/right.png'
export interface IRuleSetProps {
    user?: User | null,
}

const RuleSet: React.FC<IRuleSetProps> = ({
    user
}) => {

  let rules= [
    {
      header: "Play",
      rule: "You can play against other players!"
    },
    {
      header: "Settings",
      rule: "Choose different maps"
    },
    {
      header: "Friends",
      rule: "Add friends!"
    }
  ]
  const [filler, setFiller] = useState(rules[0])
  const counter = useRef(0);
  const max_c = 2;
  

    return (
    <div className="flex items-center justify-center h-screen space-x-40" >
      <img src={leftArray} className="w-10" onClick={()=> {
          counter.current = counter.current === 0 ?  max_c : counter.current - 1;
          setFiller(rules[counter.current])}}/>
    <div className="w-8/12 h-4/6 bg-black rounded-lg text-center border border-white-800 border-solid">
      <p className="text-white-600 text-7xl">{filler.header}</p>
        {filler.rule}
    {/* {user ? <p>Welcome user !</p> : <p>Welcome Unlogged !</p>}
    <p>Game rules :</p>
    <p>You can either play a game online using the 'PLAY ONLINE' button,</p>
    <p>or against bots or different difficulties using the 'PLAY BOTS' button.</p>
    <p>The ball bounces against the paddles and the obstacles</p>
    <p>If the gall goes out of the screen of your side of the screen, the enemy scors one point</p>
    <p>Once a player reaches 10 (ten) points, he wins</p>
    <p>Options :</p>
    <p>You can choose if the map is ranked, the map and if there are power-ups in the game</p>
    <p>These options can be modified in the /game-settings page accessible using the SETTINGS button</p>
    <p>Ranked : </p>
    <p>You are given an elo of 100 at creation of your account</p>
    <p>You can choose wether the game you are about to play is ranked or not</p>
    <p>Maps :</p>
    <p>There are 3 (three) maps</p>
    <p>The first one has no obstacles, it is the classic Pong map</p>
    <p>The secound one has 4 (four) blocks on the map, two on each side of the map</p>
    <p>The third and final one has walls in the middle of the map</p>
    <p>Power-ups :</p>
    <p>You can choose wether the game you are about to play has power-ups or not</p>
    <p>The red one speeds up the ball a lot when it touches your paddle</p>
    <p>The green one elongates your paddle for some time</p>
    <p>The blue one doesn't allow the enemy to score on that play</p> */}
  </div>
  <img src={rightArray} className="w-10" onClick={()=> {
          counter.current = counter.current === max_c ?  0 : counter.current + 1;
          setFiller(rules[counter.current])}}/>

    </div>
  );

};

export default RuleSet;
