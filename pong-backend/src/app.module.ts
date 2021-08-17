import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SigninController } from './signin/signin.controller';
import { RegisterController } from './register/register.controller';
import { ProfileController } from './profile/profile.controller';
import { ProfileService } from './profile/profile.service';
import { SigninService } from './signin/signin.service';

@Module({
  imports: [],
  controllers: [AppController, SigninController, RegisterController, ProfileController],
  providers: [AppService, ProfileService, SigninService],
})
export class AppModule {}
