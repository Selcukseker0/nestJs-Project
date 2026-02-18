import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
@IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz!' })
email: string;

@IsString()
@MinLength(6, { message: 'Şifre en az 6 karakter olmalı!' })
password: string;
}