declare module 'next/dist/lib/metadata/types/metadata-interface.js' {
  export interface ResolvingMetadata {
    title?: string;
    description?: string;
    // Add other known metadata fields here if needed
  }

  export type ResolvingViewport = { width?: number } | undefined;
}
