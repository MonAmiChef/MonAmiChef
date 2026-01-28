import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

export class UsersRepository {
  constructor(private prismaService: PrismaService) {}

  async findUserByUsername({
    username,
  }: {
    username: string;
  }): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: { username },
    });
  }

  async createGuestUser() {
    return this.prismaService.user.create({
      data: { username: 'test', password: 'test' },
    });
  }
}
