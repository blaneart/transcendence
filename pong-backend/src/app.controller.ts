import {
  Controller,
  Get,
  Request,
  Post,
  Put,
  Patch,
  UseGuards,
  Body,
  UploadedFile,
  UseInterceptors,
  Req,
  Param,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { ProfileService } from './profile/profile.service';
import { AchievementService } from './achievement/achievement.service';
import { GameService } from './game/game.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { fakeUserDto, getUserByIdDto, getUserByNameDto, setGamesDto, setNameDto, setStatusDto, saveGameDto } from './app.dto';
import path from 'path';

const multer = require('multer');
const crypto = require("crypto");

import { AvatarError } from './app.exceptions';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private authService: AuthService,
    private profileService: ProfileService,
    private achievementService: AchievementService,
    private gameService: GameService,
  ) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }


  @UseGuards(JwtAuthGuard) // Checks JWT AND 2FA (if on)
  @Post('userByName')
  async getUserByName(@Body() body: getUserByNameDto) {
    const user = await this.profileService.getUserByName(body.value);
    return user;
  }

  @UseGuards(JwtAuthGuard) // Checks JWT AND 2FA (if on)
  @Post('userById')
  async getUserById(@Body() body: getUserByIdDto) {
    const user = await this.profileService.getUserById(body.value);
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
  async setName(@Request() req, @Body() body: setNameDto) {
    const bool = await this.profileService.isNameUnique(body.value);
    if (body.value == '' || bool === false) {
      console.log('name not changed');
      return req.user;
    }
    console.log('name changed');
    const response = await this.profileService.updateUserById(
      req.user.id, {
      name: body.value,
    });
    console.log(response.name);
    return response;
  }


  @UseGuards(JwtAuthGuard)
  @Post('account/setStatus')
  async setStatus(@Request() req, @Body() body: setStatusDto) {
    console.log('status changed');
    const response = await this.profileService.updateUserById(
      req.user.id, {
      status: body.value,
    });
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('account/setGames')
  async setGames(@Req() req, @Body() body: setGamesDto) {
    const response = await this.profileService.updateUserById(req.user.id, {
      games: body.games,
      wins: body.wins
    });
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Post('uploadAvatar')
  @UseInterceptors(
    FileInterceptor('picture', {
      storage: multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, '../images/');
        },
        filename: function (req, file, cb) {
          // Get the file extension
          let fileExtension = file.originalname.split('.').pop();

          // Check if file extension is there
          if (!fileExtension)
            return cb(new AvatarError("No file extension"), false);
          
            // Save the file with a random name
          const id = crypto.randomUUID();
          cb(null, id + '.' + fileExtension);

        },
      }),
      fileFilter: function (req, file, callback) {
        // Get the file extension
        let ext = file.originalname.split('.').pop();
        // Check the extension against a whitelist
        if (ext !== 'png' && ext !== 'jpg' && ext !== 'gif' && ext !== 'jpeg') {
          return callback(new AvatarError('Only images are allowed'), false)
        }
        callback(null, true);
      },
      limits: {
        // Limit the file size
        fileSize: 1024 * 1024
      },
    }
  ))
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
  if (!req.user)
    throw new HttpException("Bad user", HttpStatus.BAD_REQUEST);
  const response = await this.profileService.updateUserById(req.user.id, {
    avatar: "" + req.user.id42,
    realAvatar: false
  });
  return response;
}

@Post('/fakeUser/:newName')
async createFakeUser(@Param() param: fakeUserDto)
{
  // Create a new user
  const newUser = await this.profileService.createFakeUser(param.newName);
  // Add this user to JWT
  return this.authService.login(newUser);
}

}
