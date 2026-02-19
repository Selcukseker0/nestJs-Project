import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './login.dto';
import { ApiOperation } from '@nestjs/swagger';
@Controller('auth')
export class AuthController {
constructor(private authService: AuthService) {}

@Post('login')
@ApiOperation({ summary: 'Kullanıcı girişi yap' })
login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
}
}