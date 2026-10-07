import { service } from './../../node_modules/.pnpm/effect@3.17.7/node_modules/effect/src/internal/sink';
import { Module } from '@nestjs/common';
import { UploadthingService } from './uploadthing.service';

@Module({
  providers: [UploadthingService],
})
export class UploadthingModule {}
