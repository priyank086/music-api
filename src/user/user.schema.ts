import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop()
  _id: string;

  @Prop()
  email: string;

  @Prop()
  resetPasswordToken: string;

  @Prop()
  resetPasswordTokenExpires: Date;

  @Prop()
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
