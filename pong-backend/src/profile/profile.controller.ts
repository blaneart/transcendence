import { Controller, Get, Post, Body, Res, HttpStatus, Param, Req, UseGuards, Request, ParseIntPipe, HttpException } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { AchievementService } from '../achievement/achievement.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { userIdDto } from './profile.dto';

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
      return this.profileService.getUserById(req.user.id);
    }

    @UseGuards(JwtAuthGuard) // only for logged in
    @Get(':id/achievements')
    async userAchievements(@Param() param: userIdDto)
    {
      // Return all achievements that belong to this user
      return this.achievementService.getAchievementsByUserId(param.id);
    
    }

    @Get(':id')
    async show(@Param() param: userIdDto)
    {
      return await this.profileService.getUserById(param.id);
    }

    @UseGuards(JwtAuthGuard) // only for logged in
    @Post('/ban/:id')
    async banUser(@Request() req, @Param() param: userIdDto)
    {
      // Ensure this is an owner
      if (!req.user.owner)
        throw new HttpException("You have to be the owner in order to do this.", HttpStatus.FORBIDDEN);
      return await this.profileService.banUser(param.id);
    }

    
}

