import Dexie, { Table } from 'dexie';

export interface TradeImage {
  id?: number;
  tradeId: number;
  imageId: string;
  filename: string;
  mimeType: string;
  size: number;
  blob: Blob;
  thumbnail?: Blob;
  uploadedAt: number;
}

class ImageStorageDB extends Dexie {
  images!: Table<TradeImage>;

  constructor() {
    super('TradingChecklistImages');
    
    this.version(1).stores({
      images: '++id, tradeId, imageId, uploadedAt'
    });
  }
}

const db = new ImageStorageDB();

export class ImageStorageManager {
  static async saveImage(
    tradeId: number,
    file: File | Blob,
    filename?: string
  ): Promise<string> {
    const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create thumbnail
    const thumbnail = await this.createThumbnail(file);
    
    await db.images.add({
      tradeId,
      imageId,
      filename: filename || `image_${Date.now()}`,
      mimeType: file.type,
      size: file.size,
      blob: file,
      thumbnail,
      uploadedAt: Date.now()
    });

    return imageId;
  }

  static async getTradeImages(tradeId: number): Promise<TradeImage[]> {
    return await db.images
      .where('tradeId')
      .equals(tradeId)
      .toArray();
  }

  static async getImage(imageId: string): Promise<TradeImage | undefined> {
    return await db.images
      .where('imageId')
      .equals(imageId)
      .first();
  }

  static async deleteImage(imageId: string): Promise<void> {
    await db.images
      .where('imageId')
      .equals(imageId)
      .delete();
  }

  static async deleteTradeImages(tradeId: number): Promise<void> {
    await db.images
      .where('tradeId')
      .equals(tradeId)
      .delete();
  }

  static async createThumbnail(file: File | Blob, maxSize = 150): Promise<Blob> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate thumbnail dimensions
        const { width, height } = this.calculateThumbnailSize(img.width, img.height, maxSize);
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw resized image
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          resolve(blob || file);
        }, 'image/jpeg', 0.8);
      };

      img.onerror = () => resolve(file);
      img.src = URL.createObjectURL(file);
    });
  }

  static calculateThumbnailSize(originalWidth: number, originalHeight: number, maxSize: number) {
    if (originalWidth <= maxSize && originalHeight <= maxSize) {
      return { width: originalWidth, height: originalHeight };
    }

    const aspectRatio = originalWidth / originalHeight;
    
    if (originalWidth > originalHeight) {
      return {
        width: maxSize,
        height: Math.round(maxSize / aspectRatio)
      };
    } else {
      return {
        width: Math.round(maxSize * aspectRatio),
        height: maxSize
      };
    }
  }

  static createObjectURL(blob: Blob): string {
    return URL.createObjectURL(blob);
  }

  static revokeObjectURL(url: string): void {
    URL.revokeObjectURL(url);
  }

  // Handle drag and drop
  static handleDrop(event: DragEvent): File[] {
    event.preventDefault();
    const files: File[] = [];
    
    if (event.dataTransfer?.files) {
      for (let i = 0; i < event.dataTransfer.files.length; i++) {
        const file = event.dataTransfer.files[i];
        if (file.type.startsWith('image/')) {
          files.push(file);
        }
      }
    }
    
    return files;
  }

  // Handle clipboard paste
  static handlePaste(event: ClipboardEvent): File[] {
    const files: File[] = [];
    
    if (event.clipboardData?.files) {
      for (let i = 0; i < event.clipboardData.files.length; i++) {
        const file = event.clipboardData.files[i];
        if (file.type.startsWith('image/')) {
          files.push(file);
        }
      }
    }
    
    return files;
  }

  // Validate image file
  static validateImage(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Please use JPEG, PNG, GIF, or WebP.' };
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'File too large. Maximum size is 10MB.' };
    }

    return { valid: true };
  }

  // Get storage usage statistics
  static async getStorageStats(): Promise<{
    totalImages: number;
    totalSize: number;
    oldestImage: number | null;
    newestImage: number | null;
  }> {
    const images = await db.images.toArray();
    
    const totalSize = images.reduce((sum, img) => sum + img.size, 0);
    const timestamps = images.map(img => img.uploadedAt);
    
    return {
      totalImages: images.length,
      totalSize,
      oldestImage: timestamps.length > 0 ? Math.min(...timestamps) : null,
      newestImage: timestamps.length > 0 ? Math.max(...timestamps) : null
    };
  }

  // Cleanup old images (optional maintenance)
  static async cleanupOldImages(daysOld = 90): Promise<number> {
    const cutoffDate = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
    const oldImages = await db.images
      .where('uploadedAt')
      .below(cutoffDate)
      .toArray();
    
    await db.images
      .where('uploadedAt')
      .below(cutoffDate)
      .delete();
    
    return oldImages.length;
  }
}

export default ImageStorageManager; 