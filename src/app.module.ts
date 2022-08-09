import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as Joi from 'joi';
import { SessionModule } from './session/session.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        SESSION_SECRET: Joi.string().min(8).required(),
        PORT: Joi.number().default(3000),
      }),
    }),
    MongooseModule.forRoot('mongodb://localhost/nest'),
    SessionModule,
  ],
})
export class AppModule {}
