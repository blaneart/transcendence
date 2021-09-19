import { Injectable } from '@nestjs/common';
import { ProfileService } from 'src/profile/profile.service';
import { db } from 'src/signin/signin.controller';

@Injectable()
export class GameService {
  constructor(private readonly profileService: ProfileService){}
  async saveGame(winner: number, loser: number, loserScore: number) {
    // Get players' names
    const winner_name = await this.profileService.getNameById(winner);
    const loser_name = await this.profileService.getNameById(loser);
    
    // Create a new game in the database
    const new_game = await db('games')
    .returning('*')
    .insert({ winner: winner_name, loser: loser_name , loserScore: loserScore});
    // Return the instance of the game
    return new_game[0];
  }

  async getGamesByName(name: string) {
    let games = await db('games')
    .where({ winner: name })
    .orWhere({ loser: name })
    .select('*');

    if (!games.length) {
      throw 'No Games :(';
    }

    return games;
  }
}
