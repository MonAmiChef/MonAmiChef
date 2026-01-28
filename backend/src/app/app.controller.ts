/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Controller, Request, Post, UseGuards, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SkipThrottle } from '@nestjs/throttler';
import { AuthService } from 'src/auth/auth.service';

@Controller('app')
@SkipThrottle()
export class AppController {
  constructor(private AuthService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('auth/login')
  login(@Request() req) {
    return this.AuthService.login(req.user);
  }

  @UseGuards(AuthGuard('local'))
  @Post('auth/logout')
  logout(@Request() req) {
    return req.logout();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
