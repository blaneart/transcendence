import { Controller, Post, Get, UseGuards, Request, Body, HttpException, HttpStatus } from "@nestjs/common";
import { AchievementService } from "src/achievement/achievement.service";
import { ProfileService } from "src/profile/profile.service";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from './local-auth.guard';
import { TemporaryJwtAuthGuard } from './temporary-jwt-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Check2FADto, Set2FADTO } from "./auth.dto";
import { UserPublic } from "src/app.types";

const twofactor = require('node-2fa');

@Controller('auth')
export class AuthController {

  constructor(private readonly profileService: ProfileService,
    private readonly authService: AuthService,
    private readonly achievementService: AchievementService) { }

  @UseGuards(LocalAuthGuard) // Checks OAuth with 42 API
  @Post('login')
  async login(@Request() req) { // No user input: no DTO
    // Issue temporary JWT if 2fa or full JWT if not 2fa.
    return this.authService.login(req.user);
  }

  @UseGuards(TemporaryJwtAuthGuard) // Checks temporary JWT, but not 2fa
  @Post('check2fa')
  async check2fa(@Request() req, @Body() body: Check2FADto) {
    // Find the user in our database
    const user = await this.profileService.getUserById(req.user.id);

    // If the user doesn't exist, something's probably very wrong
    if (!user)
      throw new HttpException("Bad user", HttpStatus.BAD_REQUEST);

    const isTwofaOn = await this.authService.isUserTwofa(user.id);
    
    if (isTwofaOn === false)
      throw new HttpException("User doesn't have 2FA on", HttpStatus.BAD_REQUEST);

    const secret = await this.authService.getUserTwofa(user.id);
    
    if (!secret)
      throw new HttpException("User doesn't have 2FA on", HttpStatus.BAD_REQUEST);

    // Validate the token
    const ret = twofactor.verifyToken(secret, body.code);
    if (ret && ret.delta === 0) {
      return this.authService.loginAndTwofa(user);
    }

    // Refuse a bad code
    throw new HttpException("Bad Code", HttpStatus.BAD_REQUEST);
  }

  @UseGuards(JwtAuthGuard)
  @Post('set2fa')
  async set2fa(@Request() req, @Body() body: Set2FADTO) {
    // If we're turning 2FA on, create and save the new secret
    if (body.value === true) {
      // Create the new secret
      const newSecret = twofactor.generateSecret({
        name: 'Transcendence',
        account: req.user.name,
      });
      // Save it to the database
      await this.authService.addUserTwofa(req.user.id, newSecret.secret);

      // Add 2FA achievement
      if (!await this.achievementService.achievementExists(req.user.id, 2))
        this.achievementService.addAchievement(req.user.id, 2);

      return ({resp: await this.authService.loginAndTwofa(req.user), secret: newSecret.secret});
    }
    this.authService.removeUserTwofa(req.user.id);
    return req.user as UserPublic;
  }

  @UseGuards(JwtAuthGuard)
  @Get('my2fa')
  async getmy2fa(@Request() req) {
    return this.authService.isUserTwofa(req.user.id);
  }
}