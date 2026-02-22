import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            // Supabase JWTs are signed with this secret
            secretOrKey: process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET || 'SECRET_KEY_CHANGE_ME',
        });
    }

    async validate(payload: any) {
        // Supabase stores user ID in 'sub' and email in 'email'
        return {
            userId: payload.sub,
            email: payload.email,
            supabaseUser: payload // Keep full payload for extra metadata if needed
        };
    }
}
