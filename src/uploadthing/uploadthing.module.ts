import { Module } from '@nestjs/common';
import { UploadthingService } from './uploadthing.service';

@Module({
  providers: [UploadthingService],
})
export class UploadthingModule {}
