import {
  Controller,
  Post,
  Get,
  Request,
  Body,
  UseGuards,
  HttpCode,
  ConflictException,
  Render,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.authService.login(email, password);
  }

  @Post('register')
  async register(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    try {
      await this.authService.register(email, password);
      return { message: 'User registered successfully' };
    } catch (e) {
      return { message: 'User already exists' };
    }
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    await this.authService.forgotPassword(email);
    return { message: 'Reset password email sent successfully' };
  }

  @Get('reset-password')
  @Render('reset-password')
  async showResetPasswordPage() {
    return {};
  }

  @Post('reset-password')
  @HttpCode(204)
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    await this.authService.resetPassword(token, newPassword);
  }
}