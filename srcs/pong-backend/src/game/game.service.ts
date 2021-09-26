import { Injectable } from '@nestjs/common';
import { ProfileService } from 'src/profile/profile.service';
import { db } from 'src/signin/signin.controller';


interface Settings {
  ranked: Boolean;
  maps: number;
  powerUps: Boolean;
}


@Injectable()
export class GameService {
  async saveGame(winner: number, loser: number, loserScore: number, winner_elo: number, loser_elo: number, settings: Settings) {
    // Create a new game in the database
    const new_game = await db('games')
    .returning('*')
    .insert({ winner_id: winner, loser_id: loser , loserScore: loserScore, winner_elo: winner_elo, loser_elo: loser_elo,
      ranked: settings.ranked, maps: settings.maps, powerUps: settings.powerUps });
    // Return the instance of the game
    return new_game[0];
  }

  async getGamesById(userid: number) {
    const games = await db('games')
    .where({ winner_id: userid })
    .orWhere({ loser_id: userid })
    .select('games.id', 'winner.name as winner', 'loser.name as loser', 'games.loserScore', 'games.winner_elo', 'games.loser_elo',
      'games.ranked', 'games.maps', 'games.powerUps')
    .join('users as winner', 'winner.id', '=', 'games.winner_id')
    .join('users as loser', 'loser.id', '=', 'games.loser_id').orderBy('games.id');

    return games;
  }

  async getNumberOfGames(userid: number) {
    let gameNumbers: number[] = [0, 0, 0];

    const cWins = await db('games')
    .where({ winner_id: userid })
    .count();
    gameNumbers[0] = cWins[0].count
    
    const cGames = await db('games')
    .where({ winner_id: userid })
    .orWhere({ loser_id: userid })
    .count();
    gameNumbers[1] = cGames[0].count

    const cLosses = await db('games')
    .where({ loser_id: userid })
    .count();
    gameNumbers[2] = cLosses[0].count

    return gameNumbers;
  }

  async getNumberOfWins(userid: number) {
    const wins = await db('games')
    .where({ winner_id: userid })
    .count();

    return wins[0].count;
  }

  async getNumberOfLosses(userid: number) {
    const losses = await db('games')
    .where({ loser_id: userid })
    .count();

    return losses[0].count;
  }


  async getEloById(userid: number) {
    const elo = await db('users')
    .where({ id: userid })
    .select('elo');

    return elo[0].elo;
  }
}
