import { useState, useEffect } from "react";
import { User } from "../../../App.types";

var achivs = [
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

async function getAchievementIds(user_id: number, authToken: string): Promise<number[] | null> {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/profile/${user_id}/achievements/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`
    },
  })

  if (!response.ok)
    return null;
  const jsonData = await response.json();
  const ach_ids = jsonData.map((element: any) => element.achievement_id);
  return ach_ids;
}


interface AchievementsProps {
  user: User;
  authToken: string;
  setUser: Function;
}

const Achievements = ({ user, authToken, setUser }: AchievementsProps) => {
  const [achievementIds, setAchievementIds] = useState<number[]>([]);

  useEffect(() => {
    getAchievementIds(user.id, authToken).then(res => res !== null && setAchievementIds(res));
  }, [user.id, authToken]);

  if (!achievementIds.length)
    return(<div></div>);

  return (
    <div>
      <p>Achievements</p>
      {
        achivs.map(achievement => achievementIds.includes(achievement.id) &&
          <div key={achievement.id}>
            <img className="achievement_img" src={achievement.image} alt="achievement"></img>
            <p className="achievement_title">{achievement.name}</p>
            <p className="achievement_description">{achievement.description}</p>
            <p>
            </p>
          </div>
        )
      }

    </div>
  );
}

export default Achievements;