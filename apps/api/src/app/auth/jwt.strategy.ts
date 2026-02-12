import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // 1. Look for the token in the "Authorization" header
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // 2. Use the same key we used to sign it
      secretOrKey: 'SUPER_SECRET_KEY',
    });
  }

  async validate(payload: any) {
    return { 
      id: payload.sub, 
      username: payload.username, 
      role: payload.role,
      orgId: payload.orgId // <--- ADD THIS LINE
    };
  }
}