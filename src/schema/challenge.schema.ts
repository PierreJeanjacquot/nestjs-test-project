import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { addressValidator } from './utils';

export type ChallengeDocument = Challenge & Document;

@Schema()
export class Challenge {
  @Prop({ type: Date, default: Date.now, expires: 5 * 60 })
  createdAt: Date;
  @Prop({ type: String, required: true, index: true })
  hash: string;
  @Prop({ type: String, required: true })
  value: string;
  @Prop({ type: String, required: true, validate: addressValidator })
  address: string;
}

export const ChallengeSchema = SchemaFactory.createForClass(Challenge);
