import { Controller, Post, UseGuards, Request, Body, HttpException, HttpStatus } from "@nestjs/common";
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

    // Validate the token
    const ret = twofactor.verifyToken(user.twofaSecret, body.code);
    if (ret && ret.delta === 0) {
      return this.authService.loginAndTwofa(user);
    }

    // Refuse a bad code
    throw new HttpException("Bad Code", HttpStatus.BAD_REQUEST);
  }

  @UseGuards(JwtAuthGuard)
  @Post('set2fa')
  async set2fa(@Request() req, @Body() body: Set2FADTO) {
    // Update the user in our database
    const response = await this.profileService.updateUserById(req.user.id, {
      twofa: body.value,
    });
    // If we're turning 2FA on, create and save the new secret
    if (body.value === true) {
      // Create the new secret
      const newSecret = twofactor.generateSecret({
        name: 'Transcendence',
        account: response.name,
      });
      // Save it to the database
      const responseSecret = await this.profileService.updateUserById(
        req.user.id,
        { twofaSecret: newSecret.secret },
      );
      // Add 2FA achievement
      if (!this.achievementService.achievementExists(req.user.id, 2))
        this.achievementService.addAchievement(req.user.id, 2);
      return responseSecret;
    }
    return response as UserPublic;
  }
}