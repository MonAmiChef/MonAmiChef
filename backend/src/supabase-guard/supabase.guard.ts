/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

export interface AuthenticatedRequest extends Request {
  user: User;
}

@Injectable()
export class SupabaseGuard implements CanActivate {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.DATABASE_URL ?? '',
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE ?? '',
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('No authorization header found');
    }

    const token = authHeader.split(' ')[1];

    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    request.user = user;
    return true;
  }
}
