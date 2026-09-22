import { ImageObject } from '../types';

/**
 * Safely extracts the URL string from an ImageObject or standard string.
 */
export function getImageUrl(img: string | ImageObject | null | undefined): string {
  if (!img) return '';
  if (typeof img === 'string') return img;
  return img.url || '';
}

/**
 * Identifies the source type of an image field ('UPLOAD' | 'MEDIA_LIBRARY' | 'EXTERNAL_URL').
 */
export function getImageSource(img: string | ImageObject | null | undefined): 'UPLOAD' | 'MEDIA_LIBRARY' | 'EXTERNAL_URL' {
  if (!img) return 'EXTERNAL_URL';
  if (typeof img === 'object' && 'source' in img) {
    return img.source;
  }
  
  const url = typeof img === 'string' ? img : (img as ImageObject).url || '';
  if (url.startsWith('data:')) {
    return 'UPLOAD';
  }
  
  // By default, if it's a seed Unsplash URL or placeholder, we can classify it as EXTERNAL_URL,
  // but if the user explicitly specifies it, it's set.
  return 'EXTERNAL_URL';
}

/**
 * Formats size in bytes to human-readable string.
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
