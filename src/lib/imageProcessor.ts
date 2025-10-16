/**
 * Image processing utilities for optimizing photo uploads
 */

import { PHOTO_LIMITS, ERROR_MESSAGES } from './constants';
import { logger } from './logger';

export interface ProcessedImage {
  dataUrl: string;
  width: number;
  height: number;
  size: number;
}

export class ImageProcessor {
  validateFileType(file: File): boolean {
    return PHOTO_LIMITS.ALLOWED_TYPES.some((type) => type === file.type);
  }

  validateFileSize(file: File): boolean {
    return file.size <= PHOTO_LIMITS.MAX_FILE_SIZE;
  }

  async processImage(file: File): Promise<ProcessedImage> {
    if (!this.validateFileType(file)) {
      throw new Error(ERROR_MESSAGES.UNSUPPORTED_FILE_TYPE);
    }

    if (!this.validateFileSize(file)) {
      throw new Error(ERROR_MESSAGES.FILE_TOO_LARGE);
    }

    try {
      const img = await this.loadImage(file);
      const resizedDataUrl = await this.resizeImage(img);
      
      const processedSize = this.estimateDataUrlSize(resizedDataUrl);
      
      return {
        dataUrl: resizedDataUrl,
        width: img.width,
        height: img.height,
        size: processedSize,
      };
    } catch (error) {
      logger.error('Failed to process image', error);
      throw error;
    }
  }

  private loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const img = new Image();

      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result !== 'string') {
          reject(new Error('Failed to read image file'));
          return;
        }

        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = result;
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  private resizeImage(img: HTMLImageElement): Promise<string> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve('');
        return;
      }

      let { width, height } = img;
      const maxWidth = PHOTO_LIMITS.MAX_WIDTH;
      const maxHeight = PHOTO_LIMITS.MAX_HEIGHT;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      const dataUrl = canvas.toDataURL('image/jpeg', PHOTO_LIMITS.QUALITY);
      resolve(dataUrl);
    });
  }

  private estimateDataUrlSize(dataUrl: string): number {
    const base64Length = dataUrl.split(',')[1]?.length || 0;
    return Math.floor(base64Length * 0.75);
  }

  async convertFileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }
}

export const imageProcessor = new ImageProcessor();
