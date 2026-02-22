import { IsEmail, IsString, IsNotEmpty, MinLength, IsOptional, IsIn } from 'class-validator';

export class SignupDto {
    @IsEmail({}, { message: 'Invalid email format' })
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    @IsIn(['kids', 'teens', 'adults'], { message: 'Invalid age group' })
    ageGroup: string;

    @IsString()
    @IsOptional()
    username?: string;
}
