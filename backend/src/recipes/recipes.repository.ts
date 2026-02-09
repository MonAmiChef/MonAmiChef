import { Injectable } from '@nestjs/common';
import { Ingredient, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { UnsplashService } from 'src/unsplash/unsplash.service';

@Injectable()
export class RecipesRepository {
  constructor(
    private prismaService: PrismaService,
    private unsplashService: UnsplashService,
  ) {}

  private async enrichReferenceWithImage(id: string, name: string) {
    try {
      const image = await this.unsplashService.getImageByPrompt(
        `${name} ingredient`,
      );
      if (image?.url) {
        await this.prismaService.ingredientReference.update({
          where: { id },
          data: { imageUrl: image.url },
        });
      }
    } catch (e) {
      console.error(`Erreur Unsplash for  ${name}`, e);
    }
  }

  async getOrCreateReference(name: string) {
    const slug = name.toLowerCase().trim();

    const ref = await this.prismaService.ingredientReference.upsert({
      where: { name: slug },
      update: {},
      create: { name: slug },
    });

    if (!ref.imageUrl && ref.id) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.enrichReferenceWithImage(ref.id, slug);
    }

    return ref.id;
  }

  async createFullRecipeContext({
    userId,
    recipeData,
    ingredients,
    imagePath,
  }: {
    userId: string;
    imagePath: string;
    recipeData: Omit<
      Prisma.RecipeCreateInput,
      'user' | 'ingredients' | 'mealPlans'
    >;
    ingredients: Ingredient[];
  }) {
    const uniqueIngredientNames = Array.from(
      new Set(ingredients.map((i) => i.name.toLowerCase().trim())),
    );

    const refMap = new Map();
    await Promise.all(
      uniqueIngredientNames.map(async (name) => {
        const refId = await this.getOrCreateReference(name);
        refMap.set(name, refId);
      }),
    );

    const ingredientsWithRefs = ingredients.map((ing) => ({
      name: ing.name,
      quantity: ing.quantity,
      unit: ing.unit,
      category: ing.category,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      referenceId: refMap.get(ing.name.toLowerCase().trim()),
    }));

    return this.prismaService.recipe.create({
      data: {
        ...recipeData,
        imagePath,
        userId,

        ingredients: {
          create: ingredientsWithRefs,
        },

        mealPlans: {
          create: {
            userId,
            plannedFor: new Date(),
          },
        },
      },
      include: {
        ingredients: {
          include: {
            reference: true,
          },
        },
      },
    });
  }
}
