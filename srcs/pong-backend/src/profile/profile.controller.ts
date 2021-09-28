import { Controller, Get, Post, Body, Res, HttpStatus, Param, Req, UseGuards, Request, ParseIntPipe, HttpException } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { AchievementService } from '../achievement/achievement.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { userIdDto } from './profile.dto';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly achievementService: AchievementService) { }

  @UseGuards(JwtAuthGuard) // only for logged in
  @Get('/me') // returns 'my' profile
  async getProfile(@Request() req) {
    // Gets the profile that corresponds to the id saved in session
    return this.profileService.getUserById(req.user.id);
  }

  @UseGuards(JwtAuthGuard) // only for logged in
  @Get(':id/achievements')
  async userAchievements(@Param() param: userIdDto) {
    // Return all achievements that belong to this user
    return this.achievementService.getAchievementsByUserId(param.id);

  }

  @Get(':id')
  async show(@Param() param: userIdDto) {
    return await this.profileService.getUserById(param.id);
  }

  @UseGuards(JwtAuthGuard) // only for logged in
  @Post('/ban/:id')
  async banUser(@Request() req, @Param() param: userIdDto) {
    // Ensure this is an owner
    if (!req.user.owner && !req.user.admin)
      throw new HttpException("You have to be the owner or an admin in order to do this.", HttpStatus.FORBIDDEN);

    // Find the user
    const target = await this.profileService.getUserById(param.id);

    // Ensure the user exists
    if (!target)
      throw new HttpException("User not found.", HttpStatus.BAD_REQUEST);

    if (target.owner)
      throw new HttpException("You can't ban the owner of the site.", HttpStatus.FORBIDDEN);

    // If the user was actually admin at this point, demote them
    if (target.admin)
      await this.profileService.demote(target.id);
  
    await this.profileService.updateUserById(param.id, {status: 0});
    return await this.profileService.banUser(param.id);
  }

  @UseGuards(JwtAuthGuard) // only for logged in
  @Post('/forgive/:id')
  async forgiveUser(@Request() req, @Param() param: userIdDto) {
    // Ensure this is an owner
    if (!req.user.owner && !req.user.admin)
      throw new HttpException("You have to be the owner or an admin in order to do this.", HttpStatus.FORBIDDEN);

    // Find the user
    const target = await this.profileService.getUserById(param.id);

    // Ensure the user exists
    if (!target)
      throw new HttpException("User not found.", HttpStatus.BAD_REQUEST);

    return await this.profileService.forgiveUser(param.id);
  }

  @UseGuards(JwtAuthGuard) // only for logged in
  @Post('/makeAdmin/:id')
  async makeUserAdmin(@Request() req, @Param() param: userIdDto) {
    // Ensure this is an owner
    if (!req.user.owner && !req.user.admin)
      throw new HttpException("You have to be the owner or an admin in order to do this.", HttpStatus.FORBIDDEN);

    // Find the user
    const target = await this.profileService.getUserById(param.id);

    // Ensure the user exists
    if (!target)
      throw new HttpException("User not found.", HttpStatus.BAD_REQUEST);

    // If a person is actually banned at the same time, forgive them
    if (target.banned)
      await this.profileService.forgiveUser(target.id);

    return await this.profileService.makeUserAdmin(param.id);
  }

  @UseGuards(JwtAuthGuard) // only for logged in
  @Post('/demote/:id')
  async demote(@Request() req, @Param() param: userIdDto) {
    // Ensure this is an owner
    if (!req.user.owner && !req.user.admin)
      throw new HttpException("You have to be the owner or an admin in order to do this.", HttpStatus.FORBIDDEN);

    // Find the user
    const target = await this.profileService.getUserById(param.id);

    // Ensure the user exists
    if (!target)
      throw new HttpException("User not found.", HttpStatus.BAD_REQUEST);

    if (target.owner === true)
      throw new HttpException("You can't demote the owner of the site.", HttpStatus.FORBIDDEN);

    return await this.profileService.demote(param.id);
  }


}

