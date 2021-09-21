export interface User {
  id: number;
  name: string;
  id42: number;
  avatar: string;
  games: number;
  elo: number;
  wins: number;
  twofa: boolean;
  twofaSecret: string;
  realAvatar: boolean;
  status: number;
  owner: boolean;
}

export interface Settings {
  ranked: Boolean;
  maps: number;
  powerUps: Boolean;
}
