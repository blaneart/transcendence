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
}

export interface Game {
  id: number;
  winner: number;
  loser: number;
  loserScore: number;
}
