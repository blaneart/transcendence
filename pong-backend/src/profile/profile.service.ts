import { Injectable, Res } from '@nestjs/common';
import { db } from 'src/signin/signin.controller';

import { AchievementService } from '../achievement/achievement.service';

// Information that we get from 42
interface User42 {
  id: number; // we're going to need the 42 database id for deduplication
  login: string;
}

@Injectable()
export class ProfileService {
  constructor(
    private achievementService: AchievementService) {}

    show(id : string, res) {
        let found = false;
        db.users.forEach(user => {
            if (user.id === id) {
                found = true;
                return res.json(user);
            }
        })
            if (!found) {
                 return res.status(404).json('no such user');
            }
    }

  // Either find an existing user from a given User42, or create a new one.
  async getOrCreateUser(user: User42): Promise<any> {
    const response = await db('users').where({ id42: user.id }).select('*');
    if (!response.length) {
      // Create a new user
      const new_user = await db('users')
        .returning('*')
        .insert({ name: user.login, id42: user.id, avatar: "" + user.id });
      // Add the register achievement
      this.achievementService.addAchievement(new_user[0].id, 0);
      // Add the 42 integration achievement
      this.achievementService.addAchievement(new_user[0].id, 1);
      return new_user[0];
    }
    // Return old user
    return response[0];
  }

  async isNameUnique(name: string)
  {
    const user = await db('users').returning('*').where({name: name});
    if (user.length)
      return false;
    return true;
  }

  async updateUserById(id: number, change: any)
  {
    const response = await db('users').returning('*').where({id: id}).update(change);
    return response[0];
  }

  async getUserById(id: number)
  {
    const response = await db('users').where({ id: id }).select('*');
    return response[0];
  }

  async getUserByName(name: string)
  {
    const response = await db('users').where({ name: name }).select('*');
    return response[0];
  }

  async getUsers()
  {
    const response = await db('users').select('*');
    return response;
  }

  async createFakeUser(newName: string)
  {
    // Insert a new fake user
    const response = await db('users').returning('*')
      .insert({
        name: newName,
        id42: Math.ceil(Math.random()*-1000), // a negative number to distinguish
        avatar: newName + ""
      });
    return response[0];
  }
}
