import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UTApi } from 'uploadthing/server';
import 'multer';
import { UploadResult } from './types/types';

@Injectable()
export class UploadthingService {
  private readonly utapi: UTApi;
  constructor(private configservice: ConfigService) {
    const token = this.configservice.get<string>('UPLOADTHING_TOKEN')!;
    this.utapi = new UTApi({
      token,
    });
  }

  async uploadFiles(files: Express.Multer.File[]): Promise<UploadResult[]> {
    // Implementation for uploading files

    if (!files || files.length === 0) {
      throw new Error('No files provided for upload');
    }

    const webFiles = files.map(
      (file) =>
        new File([new Uint8Array(file.buffer)], file.originalname, {
          type: file.mimetype,
        }),
    );

    const results = await this.utapi.uploadFiles(webFiles);

    return results.map((result) =>
      result.error
        ? { error: result.error.message }
        : {
            key: result.data[0].key,
            url: result.data[0].url,
            name: result.data[0].name,
          },
    );
  }

  async deleteFile(key: string): Promise<void> {
    try {
      await this.utapi.deleteFiles(key);
    } catch (error) {
      throw new Error(`Failed to delete file with key ${key}: ${error}`);
    }
  }
}
