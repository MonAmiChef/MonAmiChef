import { Body, Controller, Post } from '@nestjs/common';
import {
  ParseGroceriesRequestDto,
  ParseGroceriesResponseDto,
} from './parse-groceries.dto';
import { ParseGroceriesService } from './parse-groceries.service';
import { ZodResponse } from 'nestjs-zod';

@Controller('parse-groceries')
export class ParserController {
  constructor(private parserService: ParseGroceriesService) {}

  @Post()
  @ZodResponse({
    status: 200,
    type: ParseGroceriesResponseDto,
  })
  parse(@Body() ParseGroceriesRequest: ParseGroceriesRequestDto) {
    return this.parserService.parseGroceries({
      text: ParseGroceriesRequest.text,
    });
  }
}
