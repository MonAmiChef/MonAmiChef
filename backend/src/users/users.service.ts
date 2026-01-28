import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async findUserByUsername({
    username,
  }: {
    username: string;
  }): Promise<User | null> {
    const user = await this.usersRepository.findUserByUsername({
      username,
    });

    if (!user) {
      throw new NotFoundException(
        `User with user ${username} nor found, returning null`,
      );
    }

    return user;
  }
}
