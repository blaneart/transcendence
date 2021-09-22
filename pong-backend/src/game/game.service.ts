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

  // const response = await db('blocklist').where({blockerID: blockerID})
  // .join('users', 'users.id', '=', 'blocklist.blockedID') // Join to users for username
  // .select('blocklist.blockedID', 'users.name');

// knex.select('*').from('users').join('accounts', function() {
//   this.on('accounts.id', '=', 'users.account_id').orOn('accounts.owner_id', '=', 'users.id')
// })

  async getGamesById(userid: number) {
    // const games = await db('games')
    // .where({ winner_id: userid })
    // .orWhere({ loser_id: userid })
    // .join('users', function() {
    //   this.on('games.winner_id', '=', 'users.id' ).orOn('games.loser_id', '=', 'users.id')
    // })
    // .select('*');

    const games = await db('games')
    .where({ winner_id: userid })
    .orWhere({ loser_id: userid })
    .select('games.id', 'winner.name as winner', 'loser.name as loser', 'games.loserScore', 'games.winner_elo', 'games.loser_elo',
      'games.ranked', 'games.maps', 'games.powerUps')
    .join('users as winner', 'winner.id', '=', 'games.winner_id')
    .join('users as loser', 'loser.id', '=', 'games.loser_id');

    console.log('games', games);
    return games;


    // .select('title', 'author1', 'author2')
    // .from('books')
    // .join('authors as author1', 'books.author_name', '=', 'author1.name')
    // .join('authors as author2', 'books.author_name', '=', 'author2.name')
  }
}
