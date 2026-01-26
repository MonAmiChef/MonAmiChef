import { Body, Controller, Post } from '@nestjs/common';
import { SubstituteService } from './substitute.service';
import { ZodResponse } from 'nestjs-zod';
import {
  SubstituteIngredientsRequestDto,
  SubstituteIngredientsResponseDto,
} from './substitute.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('MonAmiChef')
@Controller('substitute')
export class SubstituteController {
  constructor(private substituteService: SubstituteService) {}

  @Post()
  @ApiOperation({
    summary: 'Get AI-powered ingredient alternatives based on dish context',
    description:
      'Provides intelligent, context-aware ingredient alternatives based on the specific dish being prepared. Each suggestion includes adjusted quantities, a detailed explanation of why the substitute works, and an impact score reflecting how much it might change the final flavor or texture.',
    operationId: 'substitute',
  })
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
