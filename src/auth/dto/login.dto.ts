import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
    @IsEmail({}, { message: 'Invalid email format' })
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}
