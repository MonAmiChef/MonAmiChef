import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpsertUserPreferencesDto } from './profile.dto';
import {
  SupabaseGuard,
  type AuthenticatedRequest,
} from 'src/supabase-guard/supabase.guard';

@Controller('user-preferences')
@UseGuards(SupabaseGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async getProfile(@Req() req: AuthenticatedRequest) {
    return this.profileService.getProfile(req.user.id);
  }

  @Patch()
  async updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() body: UpsertUserPreferencesDto,
  ) {
    return this.profileService.updateProfile(req.user.id, body);
  }
}
