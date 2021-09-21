import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from './constants';
import { ProfileService } from '../profile/profile.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private profileService: ProfileService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {
    const thisUser = await this.profileService.getUserById(payload.id);
    if (thisUser.banned)
      return null;
    if (!thisUser)
      return null;
    if (thisUser.twofa) // we check the actual 2fa state, not jwt
    {
      if (payload.twofaSuccess)
        return thisUser;
      else
        return null;
    }
    return thisUser;
  }
}