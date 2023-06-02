// user.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    
  ) {}

  async findByEmail(email: string): Promise<User | undefined> {
    return this.userModel.findOne({ email }).exec();
  }

  async setResetPasswordToken(email: string, token: string, expires: Date) {
    await this.userModel.updateOne(
      { email },
      {
        $set: { resetPasswordToken: token, resetPasswordTokenExpires: expires },
      },
    );
  }

  async clearResetPasswordToken(email: string) {
    await this.userModel.updateOne(
      { email },
      { $unset: { resetPasswordToken: '', resetPasswordTokenExpires: '' } },
    );
  }

  async findByResetPasswordToken(token: string): Promise<User | null> {
    return this.userModel.findOne({ resetPasswordToken: token }).exec();
  }

  async createUser(email: string, password: string, role: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new this.userModel({
      email,
      password: hashedPassword,
      role,
    });

    return newUser.save();
}


  async comparePassword(
    providedPassword: string,
    userPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(providedPassword, userPassword);
  }

  async updateUserPassword(email: string, newPassword: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return this.userModel
      .findOneAndUpdate(
        { email },
        { $set: { password: hashedPassword } },
        { new: true },
      )
      .exec();
  }
}
