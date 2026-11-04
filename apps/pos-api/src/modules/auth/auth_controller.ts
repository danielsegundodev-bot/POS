import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService, JwtPayload } from './auth_service';
import { LoginDto } from './dto/login_dto';
import { Public } from './public.decorator';

interface AuthedRequest extends Request {
  user?: { sub: string; email: string };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Get('me')
  async me(@Req() req: AuthedRequest) {
    if (!req.user) {
      throw new UnauthorizedException('Sesión requerida');
    }
    return this.authService.validateUser(req.user as JwtPayload);
  }
}
