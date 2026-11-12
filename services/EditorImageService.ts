/**
 * EditorImageService
 *
 * Handles upload and deletion of images used inside the rich-text editor.
 *
 * Flow:
 *  1. Client picks a file.
 *  2. browser-image-compression shrinks it client-side.
 *  3. The compressed file is POSTed to POST /api/editor/image.
 *  4. The server converts it to WebP with sharp and returns { url }.
 *  5. The URL is inserted as the <img src> in the TipTap editor — no base64.
 */

import imageCompression from 'browser-image-compression';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/constants';

const COMPRESSION_OPTIONS = {
  /** Target output size in MB */
  maxSizeMB: 1,
  /** Longest side in px — prevents huge dimensions hitting the server */
  maxWidthOrHeight: 1920,
  /** Use a web worker so the main thread stays responsive */
  useWebWorker: true,
} as const;

class EditorImageServiceClass {
  private static instance: EditorImageServiceClass;
  private readonly uploadUrl: string;
  private readonly deleteUrl: string;

  private constructor() {
    const base = API_BASE_URL.replace(/\/api\/?$/, '').replace(/\/+$/, '');
    this.uploadUrl = `${base}/api/editor/image`;
    this.deleteUrl = `${base}/api/editor/image`;
  }

  public static getInstance(): EditorImageServiceClass {
    if (!EditorImageServiceClass.instance) {
      EditorImageServiceClass.instance = new EditorImageServiceClass();
    }
    return EditorImageServiceClass.instance;
  }

  /**
   * Compress the file client-side then upload to the backend.
   * Returns the public path string (e.g. "/uploads/editor/editor-xxx.webp").
   */
  public async upload(file: File): Promise<string> {
    const compressed = await imageCompression(file, COMPRESSION_OPTIONS);

    const formData = new FormData();
    formData.append('image', compressed, file.name);

    const response = await axios.post<{ data: { url: string } }>(
      this.uploadUrl,
      formData,
      { withCredentials: true },
    );

    const url = response.data?.data?.url;
    if (!url) throw new Error('Server did not return an image URL');
    return url;
  }

  /**
   * Ask the server to delete a previously uploaded editor image.
   * Best-effort — errors are logged but not re-thrown.
   */
  public async delete(url: string): Promise<void> {
    try {
      await axios.delete(this.deleteUrl, {
        data: { url },
        withCredentials: true,
      });
    } catch (err) {
      console.warn('[EditorImageService] Failed to delete image:', url, err);
    }
  }
}

export const EditorImageService = EditorImageServiceClass.getInstance();
