import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CalculateCaloriesRequestDto,
  CalculateCaloriesResponseDto,
} from './calculate-calories.dto';
import { CalculateCaloriesService } from './calculate-calories.service';
import { ZodResponse } from 'nestjs-zod';

@ApiTags('MonAmiChef')
@Controller('calculate-calories')
export class CalculateCaloriesController {
  constructor(private calculateCaloriesService: CalculateCaloriesService) {}

  @Post()
  @ApiOperation({
    summary:
      'Calculate your recommended daily nutrition intake according to your goal',
    description:
      'Inputting your height, gender, age and estimated daily physical activity find out your BMR',
    operationId: 'calories-calculator',
  })
  @ZodResponse({
    status: 200,
    type: CalculateCaloriesResponseDto,
  })
  getCalories(@Body() userInfos: CalculateCaloriesRequestDto) {
    return this.calculateCaloriesService.calculateCalories(userInfos);
  }
}
