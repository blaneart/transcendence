import {
  Controller,
  Get,
  Request,
  Post,
  Patch,
  UseGuards,
  Body,
  UploadedFile,
  UseInterceptors,
  Req,
  Param
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { ProfileService } from './profile/profile.service';
import { AchievementService } from './achievement/achievement.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { TemporaryJwtAuthGuard } from './auth/temporary-jwt-auth.guard';

const twofactor = require('node-2fa');
const multer = require('multer');
const crypto = require("crypto");

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private authService: AuthService,
    private profileService: ProfileService,
    private achievementService: AchievementService,
  ) {}

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
    if (!user || !req.body.code) {
      return { message: 'nope' };
    }
    const ret = twofactor.verifyToken(user.twofaSecret, req.body.code);
    if (ret && ret.delta === 0) {
      return this.authService.loginAndTwofa(user);
    }
    return { message: 'nope' };
  }

  @UseGuards(JwtAuthGuard) // Checks JWT AND 2FA (if on)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
  
  @UseGuards(JwtAuthGuard) // Checks JWT AND 2FA (if on)
  @Post('userByName')
  async getUserByName(@Request() req) {
    const user = await this.profileService.getUserByName(req.body.value);
    return user;
  }

  @UseGuards(JwtAuthGuard) // Checks JWT AND 2FA (if on)
  @Post('userById')
  async getUserById(@Request() req) {
    const user = await this.profileService.getUserById(req.body.value);
    return user;
  }

  @UseGuards(JwtAuthGuard) // Checks JWT AND 2FA (if on)
  @Get('users')
  async getUsers() {
    const users = await this.profileService.getUsers();
    return users;
  }

  @UseGuards(JwtAuthGuard)
  @Post('auth/set2fa')
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

  @UseGuards(JwtAuthGuard)
  @Post('account/setName')
  async setName(@Request() req) {
    const val = req.body.value;
    console.log(val);
    console.log(req.user);
    const bool = await this.profileService.isNameUnique(val);
    if (val == '' || bool === false) return req.user;
    const response = await this.profileService.updateUserById(req.user.id, {
      name: val,
    });
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Post('uniqueName')
  async isNameUnique(@Request() req) {
    const bool = await this.profileService.isNameUnique(req.body.value);
    return bool;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('account/setGames')
  async setGames(@Req() req, @Body() body) {
    const val = req.body.games;
    const val2 = req.body.wins;
    const response = await this.profileService.updateUserById(req.user.id, {
      games: val,
      wins: val2
    });
    return response;
  }
  // const upload = multer({ storage: storage })

  @UseGuards(JwtAuthGuard)
  @Post('uploadAvatar')
  @UseInterceptors(
    FileInterceptor('picture', {
      storage: multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, '../images/');
        },
        filename: function (req, file, cb) {
          console.log(file);
          // const uniqueSuffix =
          //   Date.now() + '-' + Math.round(Math.random() * 1e9);
          // cb(null, file.fieldname + '-' + uniqueSuffix);
          let fileExtension = file.originalname.split('.').pop();

          if (!fileExtension)
            throw("No file extension")
          const id = crypto.randomUUID();
          console.log(id + '.' + fileExtension);
          cb(null, id + '.' + fileExtension);
          
        },
      }),
    }),
  )
  async uploadfile(@UploadedFile() file, @Request() req) {
     const response = await this.profileService.updateUserById(req.user.id, {
      avatar: file.filename,
      realAvatar: true
    });
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Post('removeAvatar')
  async removeAvatar(@Request() req) {
    const response = await this.profileService.updateUserById(req.user.id, {
      avatar: "" + req.user.id42,
      realAvatar: false
    });
    return response;
  }

  @Post('/fakeUser/:newName')
  async createFakeUser(@Request() req, @Param('newName') newName: string)
  {
    // Create a new user
    const newUser = await this.profileService.createFakeUser(newName);
    // Add this user to JWT
    return this.authService.login(newUser);
  }
}
