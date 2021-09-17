import { Injectable } from '@nestjs/common';
import { db } from 'src/signin/signin.controller';

@Injectable()
export class GameService {
  async saveGame(winner: number, loser: number, loserScore: number) {
    // Create a new game in the database
    const new_game = await db('games').returning('*').insert({ winner: winner, loser: loser , loserScore: loserScore});
    // Return the instance of the game
    return new_game[0];
  }
}
