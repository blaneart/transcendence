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
import { AuthService } from './auth/auth.service';
import { ProfileService } from './profile/profile.service';
import { AchievementService } from './achievement/achievement.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

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
  @Post('account/setName')
  async setName(@Request() req) {
    const val = req.body.value;
    console.log(val);
    const bool = await this.profileService.isNameUnique(val);
    if (val == '' || bool === false)
    {
      console.log('name not changed');
      return req.user;
    }
    console.log('name changed');
    const response = await this.profileService.updateUserById(
      req.user.id, {
      name: val,
    });
    console.log(response.name);
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
