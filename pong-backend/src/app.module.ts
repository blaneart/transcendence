import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SigninController } from './signin/signin.controller';
import { RegisterController } from './register/register.controller';
import { ProfileController } from './profile/profile.controller';
import { ProfileService } from './profile/profile.service';
import { SigninService } from './signin/signin.service';
import { AuthModule } from './auth/auth.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    AuthModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'images'),
      serveRoot: '/static/'
    }),
  ],
  controllers: [AppController, SigninController, RegisterController, ProfileController],
  providers: [AppService, ProfileService, SigninService],
})
export class AppModule {}
