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

export interface Game {
  id: number;
  winner: string;
  loser: string;
  loserScore: number;
  winner_elo: number;
  loser_elo: number;
  ranked: Boolean;
  maps: number;
  powerUps: Boolean;
}
