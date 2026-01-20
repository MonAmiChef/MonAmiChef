import { Module } from '@nestjs/common';
import { RecipeCacheRepository } from './recipe-cache.repository';
import { RecipeCacheService } from './recipe-cache.service';
import { PrismaService } from '../prisma.service';
import { HashingService } from '../hashing/hashing.service';

@Module({
  providers: [
    RecipeCacheRepository,
    RecipeCacheService,
    PrismaService,
    HashingService,
  ],
  exports: [RecipeCacheService, RecipeCacheModule],
})
export class RecipeCacheModule {}
