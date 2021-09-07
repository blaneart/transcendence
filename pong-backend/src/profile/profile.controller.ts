import { Controller, Get, Post, Body, Res, HttpStatus, Param, Req, UseGuards, Request } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { AchievementService } from '../achievement/achievement.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';


@Controller('profile')
export class ProfileController {
    constructor(
      private readonly profileService: ProfileService, 
      private readonly achievementService: AchievementService)
    {}

    
    
    @UseGuards(JwtAuthGuard) // only for logged in
    @Get('/me') // returns 'my' profile
    async getProfile(@Request() req) {
      // Gets the profile that corresponds to the id saved in session
      console.log('me');
      return this.profileService.getUserById(req.user.id);
    }

    @UseGuards(JwtAuthGuard) // only for logged in
    @Get(':id/achievements')
    async userAchievements(@Param('id') id: number)
    {
      // Return all achievements that belong to this user
      return this.achievementService.getAchievementsByUserId(id);
    }

    @Get(':id')
    show(@Param('id') id: string, @Res() res)
    {
        return this.profileService.show(id, res);
    }
}

