import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from './constants';
import { ProfileService } from '../profile/profile.service';

@Injectable()
export class TemporaryJwtStrategy extends PassportStrategy(Strategy, 'temporary-jwt') {
  constructor(private profileService: ProfileService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {
    return payload; // in a temporary JWT, we don't check 2fa.
    // This strategy is only for 2fa code check request.
  }
}