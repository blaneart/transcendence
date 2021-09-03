
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AchievementService } from '../achievement/achievement.service';
import { ProfileService } from '../profile/profile.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { JwtStrategy } from './jwt.strategy';
import { TemporaryJwtStrategy } from './temporaryJWT.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60h' },
    }),
    ],
  providers: [AuthService, LocalStrategy, JwtStrategy, TemporaryJwtStrategy, ProfileService, AchievementService],
  exports: [AuthService],
  
})
export class AuthModule {}
