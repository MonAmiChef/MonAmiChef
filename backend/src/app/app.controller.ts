/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Controller, Request, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('app')
@SkipThrottle()
export class AppController {
  @UseGuards(AuthGuard('local'))
  @Post('auth/login')
  login(@Request() req) {
    return req.user;
  }

  @UseGuards(AuthGuard('local'))
  @Post('auth/logout')
  logout(@Request() req) {
    return req.logout();
  }
}
