import {
  Controller,
  Get,
  Post,
  Query,
  Headers,
  Delete,
  HttpException,
  HttpStatus,
  Session,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags, ApiHeader } from '@nestjs/swagger';
import { ParseEthAddressPipe } from '../common/ParseEthAddressPipe';
import { Session as ExpressSession } from 'express-session';
import {
  TypedDataChallenge,
  Session as UserSession,
} from './entities/session.entity';
import { SessionService } from './session.service';
import { SessionGuard } from './session.guard';

@Controller('session')
@ApiTags('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get('/challenge')
  @ApiOkResponse({
    type: TypedDataChallenge,
    description: 'Typed data challenge to sign with the wallet to authenticate',
  })
  async getChallenge(
    @Query('address', ParseEthAddressPipe)
    address: string,
  ): Promise<TypedDataChallenge> {
    return this.sessionService.getChallenge(address);
  }

  @Get()
  @ApiOkResponse({ type: UserSession, description: 'User session' })
  @UseGuards(SessionGuard)
  async getSession(
    @Session() session: ExpressSession & UserSession,
  ): Promise<UserSession> {
    return {
      address: session.address,
    };
  }

  @Post()
  @ApiOkResponse({ description: 'User logged in' })
  @ApiHeader({
    name: 'authorization',
    description: 'Signed challenge <hash>_<sign>_<address>',
  })
  async login(
    @Headers('authorization') authorization: string,
    @Session() session: ExpressSession & UserSession,
  ): Promise<void> {
    const userAddress = await this.sessionService.checkUserAuthorization(
      authorization,
    );
    if (userAddress) {
      // session.regenerate()
      session.address = userAddress;
      return; // todo
    }
    throw new HttpException({}, HttpStatus.UNAUTHORIZED); // todo
  }

  @Delete()
  @UseGuards(SessionGuard)
  @ApiOkResponse({ description: 'User logged out' })
  async logout(@Session() session: ExpressSession) {
    await new Promise<void>((resolve, reject) =>
      session.destroy((err) => {
        if (err) {
          reject(new Error(''));
        } else {
          resolve();
        }
      }),
    );
  }
}
