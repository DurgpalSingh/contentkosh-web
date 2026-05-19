declare module 'next/font/google' {
  export type FontOptions = {
    subsets?: string[];
    weight?: string | number | Array<string | number>;
    preload?: boolean;
    variable?: string;
    display?: 'swap' | 'optional' | 'fallback' | 'auto';
  };

  export type LoadedFont = {
    className?: string;
    variable?: string;
  };

  export function Geist(opts?: FontOptions): LoadedFont;
  export function Geist_Mono(opts?: FontOptions): LoadedFont;
  export default Geist;
}
