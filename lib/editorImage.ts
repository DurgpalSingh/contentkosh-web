/**
 * Utilities for uploading / deleting editor images.
 *
 * Flow:
 *  1. Client picks a file.
 *  2. browser-image-compression shrinks it before the network round-trip.
 *  3. The compressed file is POSTed to POST /api/editor/image.
 *  4. The server converts it to WebP with sharp and returns { url }.
 *  5. The URL is inserted as the <img src> in the TipTap editor (no base64).
 *
 * On image removal the caller should hit deleteEditorImage so orphaned
 * files are cleaned up — but this is best-effort; the server handles it
 * gracefully if the file is already gone.
 */

import imageCompression from 'browser-image-compression';
import axios from 'axios';

const getApiBase = (): string => {
  const raw = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';
  return raw.replace(/\/+$/, '');
};

const UPLOAD_URL = () => `${getApiBase()}/api/editor/image`;
const DELETE_URL = () => `${getApiBase()}/api/editor/image`;

const COMPRESSION_OPTIONS = {
  /** Target output size in MB — browser-image-compression will try not to exceed this */
  maxSizeMB: 1,
  /** Longest side in px — prevents huge dimensions from hitting the server */
  maxWidthOrHeight: 1920,
  /** Use a web worker so the main thread stays responsive */
  useWebWorker: true,
} as const;

/**
 * Compress the file client-side then upload to the backend.
 * Returns the public URL string (e.g. "/uploads/editor/editor-xxx.webp").
 */
export async function uploadEditorImage(file: File): Promise<string> {
  // 1. Compress
  const compressed = await imageCompression(file, COMPRESSION_OPTIONS);

  // 2. Upload
  const formData = new FormData();
  formData.append('image', compressed, file.name);

  const response = await axios.post<{ data: { url: string } }>(
    UPLOAD_URL(),
    formData,
    { withCredentials: true },
  );

  const url = response.data?.data?.url;
  if (!url) throw new Error('Server did not return an image URL');
  return url;
}

/**
 * Ask the server to delete a previously uploaded editor image.
 * Fires-and-forgets — errors are logged but not re-thrown so
 * a stale deletion attempt never blocks the UI.
 */
export async function deleteEditorImage(url: string): Promise<void> {
  try {
    await axios.delete(DELETE_URL(), {
      data: { url },
      withCredentials: true,
    });
  } catch (err) {
    console.warn('[editorImage] Failed to delete image on server:', url, err);
  }
}
