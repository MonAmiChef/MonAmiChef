import { Injectable } from '@nestjs/common';
import { UpdateProfileRequest } from './profile.dto';
import { ProfileRepository } from './profile.repository';

@Injectable()
export class ProfileService {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async getProfile(userId: string) {
    return this.profileRepository.getProfile(userId);
  }

  async updateProfile(userId: string, data: UpdateProfileRequest) {
    return this.profileRepository.updateProfile(userId, data);
  }
}
