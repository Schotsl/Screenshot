type Format =
  | "bmp"
  | "emf"
  | "exif"
  | "jpg"
  | "jpeg"
  | "gif"
  | "png"
  | "tiff"
  | "wmf";

export interface Display {
  name: string;
  mirror: boolean;
  online: boolean;
  primary: boolean;
}

export interface Options {
  format?: Format;
  display?: string;
  filename?: string;
}
