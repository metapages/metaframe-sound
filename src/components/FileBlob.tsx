import { Howl } from "howler";

export interface FileBlob {
  label: string;
  url: string;
  loaded?: boolean;
  playing?: boolean;
  playAgain?: boolean;
  error?: string;
  sound: Howl;
}
