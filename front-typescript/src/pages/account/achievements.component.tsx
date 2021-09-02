import React, { useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  id42: number;
  avatar: string;
  games: number;
  wins: number;
  twofa: boolean;
  twofaSecret: string;
  realAvatar: boolean
}



var achivs = [
  // 0
  {
    id: 0,
    name: "Welcome aboard",
    description: "Registered on the website",
    image: "/achievements/parrot.png" 
  },
  {
    id: 1,
    name: "Grab your towel!",
    description: "Connected through 42 API",
    image: "/achievements/swimming.png", 
  },
  {
    id: 2,
    name: "Snowden",
    description: "Enabled 2FA. Good luck, NSA!",
    image: "/achievements/spy.png"
  }
]

async function getAchievements(user_id: string, authToken: string) {
  const response = await fetch(`http://127.0.0.1:3000/profile/${user_id}/achievements/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`
    },
  })

  const jsonData = await response.json();
  const ach_ids = jsonData.map((element: any) => element.achievement_id);
  const achs = ach_ids.map((id: any) => achivs[id]);
  console.log(achs);
  return achs;
}


interface AchievementsProps
{
  user: User;
  authToken: string;
  setUser: Function;
}

const Achievements = ({user, authToken, setUser }: AchievementsProps) => {
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    getAchievements(user.id, authToken).then(res => setAchievements(res));
  }, []);

  
  return (
    <div>
    
        <p>Achievements</p>
        {achievements.map((a: any) => <div>
            <img className="achievement_img" src={a.image}></img>
            <p className="achievement_title">{a.name}</p>
            <p className="achievement_description">{a.description}</p>
          <p>
          </p>
        </div>)}
        
    </div>
  );
}

export default Achievements;