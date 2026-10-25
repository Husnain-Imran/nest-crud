import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UTApi } from 'uploadthing/server';
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
    console.log('upload data ', JSON.stringify(results, null, 2));
    console.log('upload data 111', results);

    return results.map((result, index) =>
      result.error
        ? { index, error: result.error.message }
        : {
            index,
            key: result.data.key,
            url: result.data.ufsUrl,
            name: result.data.name,
          },
    );
  }

  async deleteFile(keys: string[]): Promise<void> {
    try {
      await this.utapi.deleteFiles(keys);
    } catch (error) {
      throw new Error(
        `Failed to delete files with keys ${keys.join(', ')}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
