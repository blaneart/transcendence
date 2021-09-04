import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from './constants';
import { ProfileService } from '../profile/profile.service';
import { Socket } from 'socket.io';

function extractFromSocketQuery(request: Socket): string | null {
  if (!request.handshake.query.token)
    return null;
  return request.handshake.query.token as string;
}

@Injectable()
export class JwtWsStrategy extends PassportStrategy(Strategy, "jwt-ws") {
  constructor(private profileService: ProfileService) {
    super({
      jwtFromRequest: extractFromSocketQuery,
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {
    const thisUser = await this.profileService.getUserById(payload.id);
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