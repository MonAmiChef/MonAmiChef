import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

@Injectable()
export class HashingService {
  textToHash({ text }: { text: string }): string {
    const cleanText = text.trim().toLowerCase();

    return createHash('sha256').update(cleanText).digest('hex');
  }
}
