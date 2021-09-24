import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from './constants';
import { ProfileService } from '../profile/profile.service';
import { Socket } from 'socket.io';
import { AuthService } from './auth.service';

function extractFromSocketQuery(request: Socket): string | null {
  if (!request.handshake.auth.token)
    return null;
  return request.handshake.auth.token as string;
}

@Injectable()
export class JwtWsStrategy extends PassportStrategy(Strategy, "jwt-ws") {
  constructor(private profileService: ProfileService, private readonly authService: AuthService) {
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
    if (thisUser.banned)
      return null
    if (await this.authService.isUserTwofa(thisUser.id)) // we check the actual 2fa state, not jwt
    {
      if (payload.twofaSuccess)
        return thisUser;
      else
        return null;
    }
    return thisUser;
  }
}