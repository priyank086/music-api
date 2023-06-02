import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from 'src/email/email.service';
import { UserService } from 'src/user/user.service';
import { User, UserDocument } from 'src/user/user.schema';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private emailService: EmailService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(email: string, password: string) {
    const mongoUri = this.configService.get<string>('MONGO_URI');
    console.log(mongoUri);

    const existingUser = await this.userService.findByEmail(email);
    console.log(existingUser);
    if (existingUser) {
      throw new Error('User already exists');
    }

    await this.userService.createUser(email, password);
  }

  async login(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      console.log(`User with email ${email} not found`);
      throw new Error('User not found');
    }
  
    const passwordMatch = await this.userService.comparePassword(
      password,
      user.password,
    );
    if (!passwordMatch) {
      console.log(`Invalid password for user with email ${email}`);
      throw new Error('Invalid credentials');
    }
  
    const payload = { email: user.email, sub: (user as UserDocument)._id.toString() };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
  

  async forgotPassword(email: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate a random token and store it in the user's document
    const resetToken = crypto.randomBytes(20).toString('hex');
    const tokenExpiration = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    await this.userService.setResetPasswordToken(email, resetToken, tokenExpiration);

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const resetPasswordLink = `${frontendUrl}/auth/reset-password?token=${resetToken}`;

    await this.emailService.sendResetPasswordEmail(email, resetPasswordLink);
  }

  async resetPassword(token: string, newPassword: string) {
    // Find the user with the given token and check the expiration
    const user = await this.userService.findByResetPasswordToken(token);
    
    if (!user) {
      console.log(`No user found with token: ${token}`);
      throw new Error('Invalid or expired token');
    }
  
    if (user.resetPasswordTokenExpires < new Date()) {
      console.log(`Token expired for user with email: ${user.email}`);
      throw new Error('Invalid or expired token');
    }
  
    await this.userService.updateUserPassword(user.email, newPassword);
    await this.userService.clearResetPasswordToken(user.email);
  }
  

  async validateUser(email: string, userId: string) {
    const user = await this.userService.findByEmail(email);
    if (user && (user as UserDocument)._id.toString() === userId) {
      // <-- Use UserDocument type and cast to it
      return user;
    }
    return null;
  }

  async getUserByAccessToken(token: string): Promise<User | null> {
    let payload;
    try {
      payload = this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }

    return this.userService.findByEmail(payload.email);
  }
}
