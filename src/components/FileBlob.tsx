export interface FileBlob {
  url: string;
  value?: any;
  file?: File;
  cached?: boolean;
  size?: number;
  error?: string;
  sent?: boolean;
}
