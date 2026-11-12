declare module 'next/image' {
  import type { ImgHTMLAttributes } from 'react';

  export type StaticImageData = {
    src: string;
    height: number;
    width: number;
    blurDataURL?: string;
  };

  export type ImageProps = ImgHTMLAttributes<HTMLImageElement> & {
    src: string | StaticImageData;
    width?: number;
    height?: number;
    unoptimized?: boolean;
    priority?: boolean;
    alt?: string;
  };

  export default function Image(props: ImageProps): JSX.Element;
}
