import { Injectable } from '@nestjs/common';
import { db } from 'src/signin/signin.controller';

@Injectable()
export class FriendDuoService {
  async createDuo(id1: number, id2: number) {
    // Create a new duo in the database
    const new_duo = await db('friendDuos').returning('*').insert({ friend1: id1, friend2: id2 });
    // Return the instance of the duo
    return new_duo[0];
  }
  
  // Delete a duo
  async deleteDuo(duoID: number) {
    const response = await db('friendDuos').where({id: duoID}).del();
    return response;
  }

  //Find the id of the duo in our database
  async getDuoId(id1: number, id2: number): Promise<number> {
    const duo = await db('friendDuos')
    .where(  { friend1: id1, friend2: id2 })
    .orWhere({ friend1: id2, friend2: id1 })
    .select('*');
    // Check if the corresponding duos don't exist
    if (!duo.length) {
      throw 'Duo not found';
    }

    return duo[0].id;
  }

  async getFriendsArray(id1: number): Promise<number[]> {
    let friendsArray = await db('friendDuos')
    .where({ friend1: id1 })
    .orWhere({ friend2: id1 })
    .select('*');

    if (!friendsArray.length) {
      return friendsArray;
    }
    return friendsArray.map((elem) => (elem.friend1 != id1 ? elem.friend1 : elem.friend2));
  }

  //Find the id of the duo in our database
  async DoesDuoExist(id1: number, id2: number): Promise<boolean> {
    const duo = await db('friendDuos')
    .where(  { friend1: id1, friend2: id2 })
    .orWhere({ friend1: id2, friend2: id1 })
    .select('*');

    if (!duo.length) {
      return false;
    }
    return true;
  }
}
