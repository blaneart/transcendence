import { Controller, Get, Request, Post, UseGuards, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { ProfileService } from './profile/profile.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private authService: AuthService, private profileService: ProfileService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
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
    return response;
  }


}