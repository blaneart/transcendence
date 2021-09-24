export interface User {
  id: number;
  name: string;
  id42: number;
  avatar: string;
  games: number;
  elo: number;
  wins: number;
  realAvatar: boolean;
  status: number;
  owner: boolean;
  banned: boolean;
  admin: boolean;
}

export interface Settings {
  ranked: Boolean;
  maps: number;
  powerUps: Boolean;
  sounds: Boolean;
}
