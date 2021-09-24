import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SigninController } from './signin/signin.controller';
import { RegisterController } from './register/register.controller';
import { ProfileController } from './profile/profile.controller';
import { ProfileService } from './profile/profile.service';
import { SigninService } from './signin/signin.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { GameGateway } from './game/game.gateway';
import { GameService } from './game/game.service';
import { AppGateway } from './app.gateway';
import { AchievementService } from './achievement/achievement.service';
import { ChatModule } from './chat/chat.module';
import { FriendDuoModule } from './friendDuo/friendDuo.module';
import { ChatGateway } from './chat/chat.gateway';
import { ChatService } from './chat/chat.service';
import { FriendDuoService } from './friendDuo/friendDuo.service';
import { StatusGateway } from './status.gateway';


@Module({
  imports: [
    AuthModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'images'),
      serveRoot: '/static/'
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'audio_files'),
      serveRoot: '/audio/'
    }),
    ChatModule,
    FriendDuoModule,
  ],
  controllers: [AppController, SigninController, RegisterController, ProfileController, AuthController],
  providers: [AppService, AppGateway, GameGateway, GameService, ProfileService, SigninService, AchievementService, ChatGateway, ChatService, FriendDuoService, StatusGateway],
})
export class AppModule {}
