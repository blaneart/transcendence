import { Controller, Get, Request, Post, UseGuards, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { ProfileService } from './profile/profile.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { TemporaryJwtAuthGuard } from './auth/temporary-jwt-auth.guard';

const twofactor = require("node-2fa");



@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private authService: AuthService, private profileService: ProfileService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(LocalAuthGuard) // Checks OAuth with 42 API
  @Post('auth/login')
  async login(@Request() req) {
    // Issue temporary JWT if 2fa or full JWT if not 2fa.
    return this.authService.login(req.user);
  }

  @UseGuards(TemporaryJwtAuthGuard) // Checks temporary JWT, but not 2fa
  @Post('auth/check2fa')
  async check2fa(@Request() req) {
    const user = await this.profileService.getUserById(req.user.id);
    if (!user || !req.body.code)
    {
      return {message: 'nope'};
    }
    const ret = twofactor.verifyToken(user.twofaSecret, req.body.code);
    if (ret && ret.delta === 0)
    {
      return this.authService.loginAndTwofa(user);
    }
    return {message: 'nope'};
  }

  @UseGuards(JwtAuthGuard) // Checks JWT AND 2FA (if on)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('auth/set2fa')
  async set2fa(@Request() req) {
    const val = req.body.value;
    console.log(val);
    console.log(req.user);
    if (val !== true && val !== false) 
      return {status: -1};
    const futureValue : boolean = val === true ? true : false;
    const response = await this.profileService.updateUserById(req.user.id, {twofa: futureValue});
    if (futureValue === true)
    {
      const newSecret = twofactor.generateSecret({ name: "Transcendence", account: response.name });
      const responseSecret = await this.profileService.updateUserById(req.user.id, {twofaSecret: newSecret.secret});
      return responseSecret;
    }
    return response; // TODO NOT SEND 2FA SECRET
  }

  @UseGuards(JwtAuthGuard)
  @Post('account/setName')
  async setName(@Request() req) {
    const val = req.body.value;
    console.log(val);
    console.log(req.user);
    console.log("here :)");
    if (val == "")
      return req.user;
    const response = await this.profileService.updateUserById(req.user.id, {name: val});
    return response;
  }


}