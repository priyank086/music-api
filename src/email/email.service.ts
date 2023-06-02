// email.service.ts
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendResetPasswordEmail(userEmail: string, resetPasswordLink: string) {
    const mailData = {
      to: userEmail,
      subject: 'Reset Password - Music',
      template: './templates/reset-password', // Use the template's name without the file extension
      context: {
        resetPasswordLink,
      },
      text: `Dear user,\n\nPlease click on the following link to reset your password: ${resetPasswordLink}\n\nBest regards,\nThe Music Team`
    };
  
    try {
      await this.mailerService.sendMail(mailData);
    } catch (error) {
      console.error(error);
    }
  }
  
}
