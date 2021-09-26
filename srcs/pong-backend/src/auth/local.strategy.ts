// import { Strategy } from 'passport-local';
// import passportCustom from 'passport-custom';
// const CustomStrategy = passportCustom.Strategy;


import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
// import { OAuth2Strategy } from 'passport-oauth2';
import passportCustom = require("passport-custom");
const CustomStrategy = passportCustom.Strategy;


// @Injectable()
// export class LocalStrategy extends PassportStrategy(Strategy) {
//   constructor(private authService: Auth2Service) {
//     super();
//   }

//   async validate(username: string, password: string): Promise<any> {
//     const user = await this.authService.validateUser(username, password);
//     if (!user) {
//       throw new UnauthorizedException();
//     }
//     return user;
//   }
// }


@Injectable()
export class LocalStrategy extends PassportStrategy(CustomStrategy, "local") {
  constructor(private authService: AuthService) {
    super(
      function(req, callback)
      {
        const code = req.body.code;
        if (!code)
          return callback("Get a code", null);
        
        try {

          const user = this.authService.validate42login(code);
          return callback(null, user);
        } catch (err) {
          return callback(err, null)
        }
      }
    )
  }
}