import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import request from 'supertest';
import { App } from 'supertest/types';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';
import { throttlerConfig } from '../src/config/throttler.config';

// The real AuthService pulls in @nestjs/jwt (ESM-only) and TypeORM. The test
// only needs the class as an injection token, so stub the module.
jest.mock('../src/auth/auth.service', () => ({ AuthService: class {} }));

const AUTH_LIMIT = 10;
const AUTH_TTL_MS = 60_000;

describe('Rate limiting (e2e)', () => {
  let app: INestApplication<App>;
  let now: number;

  beforeEach(async () => {
    // Throttler expiry is based on Date.now(), so control the clock
    // instead of waiting a real minute for the window to reset.
    now = Date.now();
    jest.spyOn(Date, 'now').mockImplementation(() => now);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot(throttlerConfig)],
      controllers: [AuthController, AppController],
      providers: [
        AppService,
        // Same global guard registration as AppModule.
        { provide: APP_GUARD, useClass: ThrottlerGuard },
        {
          provide: AuthService,
          useValue: {
            signIn: jest.fn().mockResolvedValue({ success: true }),
            signup: jest.fn().mockResolvedValue({ success: true }),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await app.close();
  });

  describe.each(['/auth/signin', '/auth/signup'])('POST %s', (path) => {
    it(`allows ${AUTH_LIMIT} requests then returns 429`, async () => {
      const server = app.getHttpServer();
      for (let i = 0; i < AUTH_LIMIT; i++) {
        await request(server).post(path).send({}).expect(201);
      }
      await request(server).post(path).send({}).expect(429);
    });

    it('accepts requests again after the window expires', async () => {
      const server = app.getHttpServer();
      for (let i = 0; i < AUTH_LIMIT; i++) {
        await request(server).post(path).send({});
      }
      await request(server).post(path).send({}).expect(429);

      now += AUTH_TTL_MS + 1;

      await request(server).post(path).send({}).expect(201);
    });
  });

  it('keeps the higher global limit on other routes', async () => {
    const server = app.getHttpServer();
    // More than the auth limit, still well under the global limit of 100.
    for (let i = 0; i < AUTH_LIMIT + 5; i++) {
      await request(server).get('/').expect(200);
    }
  });
});
