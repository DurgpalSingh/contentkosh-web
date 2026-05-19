declare module 'next' {
  export interface Metadata {
    title?: string;
    description?: string;
    // Add other well-known metadata fields here as needed
  }

  export interface NextConfig {
    eslint?: {
      ignoreDuringBuilds?: boolean;
    };
    images?: {
      remotePatterns?: Array<{
        protocol?: string;
        hostname?: string;
        port?: string;
        pathname?: string;
      }>;
    };
    // Intentionally narrow: add other fields to this interface as needed instead of using a broad index signature.
  }
}
