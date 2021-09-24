// The info we can show others about a given user
export interface UserPublic {
  id: number;
  name: string;
  avatar: string;
  id42: number
  elo: number;
  realAvatar: boolean;
  owner: boolean;
  banned: boolean;
  admin: boolean;
}

export enum PowerUpType {
  NONE = 0,
  RED = 1, // Speeds up the ball temporarily
  GREEN = 2, // Makes the last player's paddle larger temporarily
  BLUE = 3, // The player losing this ball will win the point
}

export interface Settings {
  ranked: Boolean;
  maps: number;
  powerUps: Boolean;
}
