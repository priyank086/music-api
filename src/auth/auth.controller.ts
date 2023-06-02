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
  UnauthorizedException,
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
    @Body('role') role: string,
  ) {
    try {
      await this.authService.register(email, password, role);
      return { message: 'User registered successfully' };
    } catch (e) {
      console.log(e);
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

  @Post('user')
  async getUserByAccessToken(@Body('access_token') token: string) {
    const user = await this.authService.getUserByAccessToken(token);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
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
