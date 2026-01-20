import { Body, Controller, Post } from '@nestjs/common';
import {
  ParseGroceriesRequestDto,
  ParseGroceriesResponseDto,
} from './parser.dto';
import { GroceryParserService } from './parser.service';
import { ZodResponse } from 'nestjs-zod';

@Controller('parser')
export class GroceryParserController {
  constructor(private groceryParserService: GroceryParserService) {}

  @Post()
  @ZodResponse({
    status: 200,
    type: ParseGroceriesResponseDto,
  })
  async parseGroceries(
    @Body() ParseGroceriesRequest: ParseGroceriesRequestDto,
  ) {
    return this.groceryParserService.parseGroceries({
      text: ParseGroceriesRequest.text,
    });
  }
}
