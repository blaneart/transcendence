import React, { useEffect } from "react";

import { User } from "../App.types";

interface WatchdogParams {
  authToken: string
  bannedHandler: Function
  children: any
}

async function getMe(authToken: string): Promise<User | null> {

  const response = await fetch(process.env.REACT_APP_API_URL + "/profile/me", {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
  });

  if (!response.ok)
  {
    if (response.status === 401)
    {
      alert("You're banned.");
      return null;
    }
    alert("Couldn't authenticate");
    return null;
  }
  const jsonData = await response.json();
  return jsonData as User;
}

const Watchdog: React.FC<WatchdogParams> = ({ authToken , bannedHandler, children }) => {
  useEffect(() => {
    getMe(authToken).then(me => me ? null : bannedHandler());
  })

  return (
    <div>
      {children}
    </div>
  );
};

export default Watchdog
