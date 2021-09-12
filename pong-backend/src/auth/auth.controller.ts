import { Controller, Post, UseGuards, Request } from "@nestjs/common";
import { AchievementService } from "src/achievement/achievement.service";
import { ProfileService } from "src/profile/profile.service";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from './local-auth.guard';
import { TemporaryJwtAuthGuard } from './temporary-jwt-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';

const twofactor = require('node-2fa');

@Controller('auth')
export class AuthController {

  constructor(private readonly profileService: ProfileService,
    private readonly authService: AuthService,
    private readonly achievementService: AchievementService) { }

  @UseGuards(LocalAuthGuard) // Checks OAuth with 42 API
  @Post('login')
  async login(@Request() req) {
    // Issue temporary JWT if 2fa or full JWT if not 2fa.
    return this.authService.login(req.user);
  }

  @UseGuards(TemporaryJwtAuthGuard) // Checks temporary JWT, but not 2fa
  @Post('check2fa')
  async check2fa(@Request() req) {
    const user = await this.profileService.getUserById(req.user.id);
    if (!user || !req.body.code) {
      return { message: 'nope' };
    }
    const ret = twofactor.verifyToken(user.twofaSecret, req.body.code);
    if (ret && ret.delta === 0) {
      return this.authService.loginAndTwofa(user);
    }
    return { message: 'nope' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('set2fa')
  async set2fa(@Request() req) {
    const val = req.body.value;
    if (val !== true && val !== false) return { status: -1 };
    const futureValue: boolean = val === true ? true : false;
    const response = await this.profileService.updateUserById(req.user.id, {
      twofa: futureValue,
    });
    if (futureValue === true) {
      const newSecret = twofactor.generateSecret({
        name: 'Transcendence',
        account: response.name,
      });
      const responseSecret = await this.profileService.updateUserById(
        req.user.id,
        { twofaSecret: newSecret.secret },
      );
      // Add 2FA achievement
      this.achievementService.addAchievement(req.user.id, 2);
      return responseSecret;
    }
    return response; // TODO NOT SEND 2FA SECRET
  }
}