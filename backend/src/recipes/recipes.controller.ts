import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ZodResponse } from 'nestjs-zod';
import {
  AddMealToPlanRequestDto,
  AddMealToPlanResponseDto,
} from './recipes.dto';
import {
  type AuthenticatedRequest,
  SupabaseGuard,
} from 'src/supabase-guard/supabase.guard';
import { RecipesService } from './recipes.service';

@Controller('recipes')
@UseGuards(SupabaseGuard)
export class RecipesController {
  constructor(private recipesService: RecipesService) {}

  @Post('add-to-mealplan')
  @ZodResponse({
    status: 200,
    type: AddMealToPlanResponseDto,
  })
  addMealToPlan(
    @Body() body: AddMealToPlanRequestDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.recipesService.addMealToPlan({
      messageContent: body.messageContent,
      userId: req.user.id,
    });
  }
}
