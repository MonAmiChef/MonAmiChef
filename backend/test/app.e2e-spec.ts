import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('GroceryParserController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/parser (POST) - success', () => {
    return request(app.getHttpServer())
      .post('/parser')
      .set('x-api-key', 'local-test-api-key')
      .send({ text: 'I need 1 apple and 2 bananas for the recipe' })
      .expect(200);
  });

  it('/parser (POST) - unauthorized', () => {
    return request(app.getHttpServer())
      .post('/parser')
      .send({ text: 'I need 1 apple and 2 bananas for the recipe' })
      .expect(401);
  });

  // it('/parser (POST) - throttling', async () => {
  //   const promises = [];
  //   for (let i = 0; i < 5; i++) {
  //     promises.push(
  //       request(app.getHttpServer())
  //         .post('/parser')
  //         .set('x-api-key', 'local-test-api-key')
  //         .send({ text: 'I need 1 apple and 2 bananas for the recipe' }),
  //     );
  //   }
  //   const responses = await Promise.all(promises);
  //   const tooManyRequests = responses.filter((r) => r.status === 429);
  //   expect(tooManyRequests.length).toBeGreaterThan(0); // At least one should be throttled
  // });
});
