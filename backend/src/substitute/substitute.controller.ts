import { Body, Controller, Post } from '@nestjs/common';
import { SubstituteService } from './substitute.service';
import { ZodResponse } from 'nestjs-zod';
import {
  SubstituteIngredientsRequestDto,
  SubstituteIngredientsResponseDto,
} from './substitute.dto';

@Controller('substitute')
export class SubstituteController {
  constructor(private substituteService: SubstituteService) {}

  @Post()
  @ZodResponse({
    status: 200,
    type: SubstituteIngredientsResponseDto,
  })
  async subsituteIngredients(
    @Body() substituteBody: SubstituteIngredientsRequestDto,
  ) {
    return this.substituteService.substituteIngredients({
      text: substituteBody.text,
    });
  }
}
