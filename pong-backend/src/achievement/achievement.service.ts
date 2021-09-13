import { Injectable } from '@nestjs/common';
import { db } from 'src/signin/signin.controller';

@Injectable()
export class AchievementService {
    async getAchievementsByUserId(userId: number) {
      // Get all achievements for a given user
      const response = await db('user_achievements').where({ user_id: userId }).select('*');
      return response;
    }

    async addAchievement(userId: number, achievementId: number) {
      // Insert a connection between a user and an achievement
      const response = await db('user_achievements').returning('*').insert({ user_id: userId, achievement_id: achievementId });
      return response[0];
    }

    async achievementExists(userId: number, achievementId: number): Promise<boolean>
    {
      const response = await db('user_achievements').where({ user_id: userId, achievement_id: achievementId }).select('*');
      if (response.length)
        return true;
      return false;
    }
}
