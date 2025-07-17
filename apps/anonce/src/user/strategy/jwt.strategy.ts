import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  // constructor() {
  //   super({
  //     jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  //     ignoreExpiration: true,
  //     secretOrKey: 'secret',
  //   });
  // }

  // validate(payload: any) {
  //   return payload;
  // }
  constructor() {
    super({
      jwtFromRequest: (req: Request) => {
        if (!req.cookies || !req.cookies['access_token']) {
          throw new UnauthorizedException('Not authenticated');
        }
        return req.cookies['access_token'];
      },
      ignoreExpiration: false, // best practice: don't ignore
      secretOrKey: 'secret', // consider loading from config
    });
  }

  async validate(payload: any) {
    return payload; // or fetch user from DB if needed
  }
}
