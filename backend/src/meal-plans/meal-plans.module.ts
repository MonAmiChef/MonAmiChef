import { Module } from '@nestjs/common';
import { MealPlanController } from './meal-plans.controller';
import { MealPlanService } from './meal-plans.service';
import { MealPlanRepository } from './meal-plans.repository';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [MealPlanController],
  providers: [MealPlanService, MealPlanRepository, PrismaService],
  exports: [MealPlanService],
})
export class MealPlanModule {}
