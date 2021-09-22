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
  banned: boolean;
  admin: boolean;
}

export interface Settings {
  ranked: Boolean;
  maps: number;
  powerUps: Boolean;
}

export interface Game {
  id: number;
  winner: string;
  loser: string;
  loserScore: number;
  winner_elo: number;
  loser_elo: number;
  settings: Settings;
}
