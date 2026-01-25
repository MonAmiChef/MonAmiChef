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
  @ApiOperation({ operationId: 'substitute' })
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
