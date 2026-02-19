import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class LoginDto {
@IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz!' })
@ApiProperty({ example: 'john@example.com', description: 'Kullanıcının e-posta adresi' })
email: string;

@IsString()
@MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır!' })
@ApiProperty({ example: 'password123', description: 'Kullanıcının şifresi' })
password: string;
}