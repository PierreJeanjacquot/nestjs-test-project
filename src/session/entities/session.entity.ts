import { ApiProperty } from '@nestjs/swagger';

class TypedDataField {
  @ApiProperty()
  name: string;
  @ApiProperty()
  type: string;
}
class Challenge {
  @ApiProperty()
  challenge: string;
}

export class TypedDataChallenge {
  @ApiProperty()
  types: Record<string, TypedDataField[]>;
  @ApiProperty()
  domain: {
    name: string;
    version: string;
  };
  @ApiProperty()
  primaryType: string;
  @ApiProperty()
  message: Challenge;
}

export class Session {
  @ApiProperty()
  address: string;
}
