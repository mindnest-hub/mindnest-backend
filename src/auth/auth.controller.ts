import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('signup')
    signup(@Body() signupDto: SignupDto) {
        return this.authService.signup(
            signupDto.email,
            signupDto.password,
            signupDto.ageGroup,
            signupDto.username
        );
    }

    @Post('login')
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto.email, loginDto.password);
    }

    @Post('verify-otp')
    verifyOtp(@Body('email') email: string, @Body('code') code: string) {
        return this.authService.verifyOtp(email, code);
    }

    @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 requests per hour
    @Post('request-password-reset')
    requestPasswordReset(@Body('email') email: string) {
        // This is a placeholder for actual reset logic
        return { message: 'If this email exists, a reset link will be sent shortly.' };
    }
}
