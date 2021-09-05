import { Injectable } from '@nestjs/common';
import { db } from 'src/signin/signin.controller';

@Injectable()
export class AchievementService {
    async getAchievementsByUserId(userId: number) {
      // Get all achievements for a given user
      const response = await db('user_achievements').where({ user_id: userId }).select('*');
      console.log(response);
      return response;
    }

    async addAchievement(userId: number, achievementId: number) {
      // Insert a connection between a user and an achievement
      const response = await db('user_achievements').returning('*').insert({ user_id: userId, achievement_id: achievementId });
      return response[0];
    }
}