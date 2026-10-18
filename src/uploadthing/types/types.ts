export type UploadSuccess = {
  index: number;
  key: string;
  url: string;
  name: string;
};

export type UploadFailure = {
  index: number;
  error: string;
};

export type UploadResult = UploadSuccess | UploadFailure;
