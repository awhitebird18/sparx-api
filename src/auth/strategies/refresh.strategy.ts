import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

import { jwtConstants } from '../constants';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class RefreshJWTStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private userService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        RefreshJWTStrategy.extractTokenFromCookie,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  private static extractTokenFromCookie(req: Request): string | null {
    let token = null;
    if (req && req.cookies) {
      token = req.cookies['refresh_token']; // assuming your JWT is in an 'access_token' cookie
    }
    return token;
  }

  async validate(payload: any) {
    const user = await this.userService.findOneByEmail(payload.email);

    return user;
  }
}
