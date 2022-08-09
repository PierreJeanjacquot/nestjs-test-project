import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { addressValidator } from './utils';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({
    type: String,
    required: true,
    index: true,
    validate: addressValidator,
  })
  address: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
