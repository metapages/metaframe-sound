export interface FileBlob {
  name: string;
  value?: any;
  file?: File;
  urlEncoded?: string;
  // type?:string;//??
  cached: boolean;
  size?: number;
  arrived?: Date;
}
