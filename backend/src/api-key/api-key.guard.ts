/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class ApikeyGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    const rapidApiSecret = request.headers['x-rapidapi-proxy-secret'];
    const localApiKey = request.headers['x-api-key'];

    const url = request.url;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    if (url.includes('/docs')) {
      return true;
    }

    if (rapidApiSecret === process.env.RAPIDAPI_PROXY_SECRET) {
      return true;
    }

    if (
      process.env.NODE_ENV === 'development' &&
      localApiKey === 'local-test-api-key'
    ) {
      return true;
    }

    throw new UnauthorizedException('Missing or invalid API Key');
  }
}
