import { Body, Controller, Post } from '@nestjs/common';
import { ParseGroceriesRequestDto, ParseGroceriesResponse } from './parser.dto';
import { GroceryParserService } from './parser.service';

@Controller('parser')
export class GroceryParserController {
  constructor(private groceryParserService: GroceryParserService) {}

  @Post()
  async parseGroceries(
    @Body() ParseGroceriesRequest: ParseGroceriesRequestDto,
  ): Promise<ParseGroceriesResponse> {
    return this.groceryParserService.parseGroceries({
      text: ParseGroceriesRequest.text,
    });
  }
}
