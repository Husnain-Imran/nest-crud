import { ThrottlerModuleOptions } from '@nestjs/throttler';

// Global rate limit applied to every route unless overridden with @Throttle.
export const throttlerConfig: ThrottlerModuleOptions = [
  {
    ttl: 60 * 1000, // 1 minute
    limit: 100,
  },
];
