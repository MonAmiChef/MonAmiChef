import { Injectable, Logger } from '@nestjs/common';
import { createApi } from 'unsplash-js';

export interface UnsplashImageResult {
  url: string;
  photographerName: string;
  photographerUrl: string;
  downloadLocation: string;
}

@Injectable()
export class UnsplashService {
  private readonly logger = new Logger(UnsplashService.name);
  private unsplash: ReturnType<typeof createApi>;

  constructor() {
    this.unsplash = createApi({
      accessKey: process.env.UNSPLASH_ACCESS_KEY!,
    });
  }

  async getImageByPrompt(prompt: string): Promise<UnsplashImageResult | null> {
    if (!prompt || prompt.trim().length === 0) return null;

    try {
      const result = await this.unsplash.search.getPhotos({
        query: prompt,
        page: 1,
        perPage: 1,
        orientation: 'landscape',
      });

      if (result.type === 'success') {
        const photo = result.response.results[0];

        // --- LOGIQUE DE RETRY ---
        // Si on n'a pas de photo et que le prompt contient plus de 3 mots
        if (!photo) {
          const words = prompt.trim().split(/\s+/);
          if (words.length > 3) {
            const simplifiedPrompt = words.slice(0, 3).join(' ');
            this.logger.warn(
              `No photo found for "${prompt}", retrying with "${simplifiedPrompt}"`,
            );
            return this.getImageByPrompt(simplifiedPrompt); // Récursion simple
          }
          return null;
        }

        return {
          url: photo.urls.regular,
          photographerName: photo.user.name,
          photographerUrl: photo.user.links.html,
          downloadLocation: photo.links.download_location,
        };
      } else {
        this.logger.error(`Unsplash API Error: ${result.errors[0]}`);
        return null;
      }
    } catch (err) {
      this.logger.error('Unexpected error during Unsplash search', err);
      return null;
    }
  }
}
