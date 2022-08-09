import {
  Injectable,
  Optional,
  HttpStatus,
  ArgumentMetadata,
  PipeTransform,
} from '@nestjs/common';
import {
  ErrorHttpStatusCode,
  HttpErrorByCode,
} from '@nestjs/common/utils/http-error-by-code.util';
import { utils } from 'ethers';

export interface ParseEthAddressPipeOptions {
  errorHttpStatusCode?: ErrorHttpStatusCode;
  exceptionFactory?: (error: string) => any;
}

/**
 * Defines the ParseEthAddress Pipe
 */
@Injectable()
export class ParseEthAddressPipe implements PipeTransform<string> {
  protected exceptionFactory: (error: string) => any;

  constructor(@Optional() options?: ParseEthAddressPipeOptions) {
    options = options || {};
    const { exceptionFactory, errorHttpStatusCode = HttpStatus.BAD_REQUEST } =
      options;

    this.exceptionFactory =
      exceptionFactory ||
      ((error) => new HttpErrorByCode[errorHttpStatusCode](error));
  }

  /**
   * Method that accesses and performs optional transformation on argument for
   * in-flight requests.
   *
   * @param value currently processed route argument
   * @param metadata contains metadata about the currently processed route argument
   */
  async transform(value: string, metadata: ArgumentMetadata): Promise<string> {
    try {
      return utils.getAddress(value.toLowerCase());
    } catch {
      throw this.exceptionFactory(
        `${metadata.data} Validation failed (ethereum address is expected${
          metadata.data && ` for \`${metadata.data}\``
        })`,
      );
    }
  }
}
