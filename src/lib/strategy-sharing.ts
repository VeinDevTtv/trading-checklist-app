export interface ShareableStrategy {
  id: string;
  name: string;
  conditions: Array<{
    id: number;
    text: string;
    importance: 'high' | 'medium' | 'low';
  }>;
  metadata: {
    version: string;
    createdAt: number;
    author?: string;
    description?: string;
    tags?: string[];
  };
}

export interface ShareResult {
  success: boolean;
  shareUrl?: string;
  error?: string;
}

export interface ImportResult {
  success: boolean;
  strategy?: ShareableStrategy;
  error?: string;
}

export class StrategySharing {
  private static readonly VERSION = '1.0.0';
  private static readonly URL_PREFIX = '#s=';
  private static readonly MAX_URL_LENGTH = 2048; // Browser URL limit

  /**
   * Export strategy as JSON file download
   */
  static exportAsJSON(strategy: ShareableStrategy): void {
    try {
      const exportData = {
        ...strategy,
        metadata: {
          ...strategy.metadata,
          version: this.VERSION,
          exportedAt: Date.now()
        }
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${this.sanitizeFilename(strategy.name)}_strategy.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
         } catch (error) {
       console.error('Failed to export strategy:', error);
       throw new Error('Failed to export strategy as JSON');
     }
  }

  /**
   * Import strategy from JSON file
   */
  static async importFromJSON(file: File): Promise<ImportResult> {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      const validation = this.validateStrategyData(data);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      const strategy: ShareableStrategy = {
        id: `imported_${Date.now()}`,
        name: data.name,
        conditions: data.conditions,
        metadata: {
          version: this.VERSION,
          createdAt: Date.now(),
          author: data.metadata?.author,
          description: data.metadata?.description,
          tags: data.metadata?.tags || []
        }
      };

             return { success: true, strategy };
     } catch {
       return { 
         success: false, 
         error: 'Invalid JSON file or corrupted strategy data' 
       };
     }
  }

  /**
   * Generate shareable URL with base64-encoded strategy
   */
  static generateShareUrl(strategy: ShareableStrategy): ShareResult {
    try {
      const shareData = {
        n: strategy.name,
        c: strategy.conditions.map(c => ({
          i: c.id,
          t: c.text,
          p: c.importance === 'high' ? 'h' : c.importance === 'medium' ? 'm' : 'l'
        })),
        m: {
          v: this.VERSION,
          a: strategy.metadata.author,
          d: strategy.metadata.description,
          t: strategy.metadata.tags
        }
      };

      const jsonStr = JSON.stringify(shareData);
      const base64 = btoa(unescape(encodeURIComponent(jsonStr)));
      const shareUrl = `${window.location.origin}${window.location.pathname}${this.URL_PREFIX}${base64}`;

      if (shareUrl.length > this.MAX_URL_LENGTH) {
        return {
          success: false,
          error: 'Strategy too large to share via URL. Please use JSON export instead.'
        };
      }

             return { success: true, shareUrl };
     } catch {
       return {
         success: false,
         error: 'Failed to generate share URL'
       };
     }
  }

  /**
   * Import strategy from share URL
   */
  static importFromShareUrl(url?: string): ImportResult {
    try {
      const urlToProcess = url || window.location.hash;
      
      if (!urlToProcess.includes(this.URL_PREFIX)) {
        return { success: false, error: 'No shared strategy found in URL' };
      }

      const base64Data = urlToProcess.split(this.URL_PREFIX)[1];
      if (!base64Data) {
        return { success: false, error: 'Invalid share URL format' };
      }

      const jsonStr = decodeURIComponent(escape(atob(base64Data)));
      const shareData = JSON.parse(jsonStr);

             const strategy: ShareableStrategy = {
         id: `shared_${Date.now()}`,
         name: shareData.n,
         conditions: shareData.c.map((c: { i: number; t: string; p: string }) => ({
           id: c.i,
           text: c.t,
           importance: c.p === 'h' ? 'high' : c.p === 'm' ? 'medium' : 'low'
         })),
        metadata: {
          version: shareData.m?.v || this.VERSION,
          createdAt: Date.now(),
          author: shareData.m?.a,
          description: shareData.m?.d,
          tags: shareData.m?.t || []
        }
      };

      const validation = this.validateStrategyData(strategy);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      return { success: true, strategy };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to decode shared strategy. URL may be corrupted.'
      };
    }
  }

  /**
   * Copy share URL to clipboard
   */
  static async copyShareUrl(shareUrl: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(shareUrl);
      return true;
    } catch (error) {
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
      } catch (fallbackError) {
        console.error('Failed to copy to clipboard:', fallbackError);
        return false;
      }
    }
  }

  /**
   * Validate strategy data structure
   */
  private static validateStrategyData(data: any): { valid: boolean; error?: string } {
    if (!data || typeof data !== 'object') {
      return { valid: false, error: 'Invalid strategy data format' };
    }

    if (!data.name || typeof data.name !== 'string') {
      return { valid: false, error: 'Strategy name is required' };
    }

    if (!Array.isArray(data.conditions) || data.conditions.length === 0) {
      return { valid: false, error: 'Strategy must have at least one condition' };
    }

    for (const condition of data.conditions) {
      if (!condition.text || typeof condition.text !== 'string') {
        return { valid: false, error: 'All conditions must have text' };
      }

      if (!['high', 'medium', 'low'].includes(condition.importance)) {
        return { valid: false, error: 'Invalid condition importance level' };
      }
    }

    return { valid: true };
  }

  /**
   * Sanitize filename for download
   */
  private static sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-z0-9]/gi, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .toLowerCase();
  }

  /**
   * Generate strategy preview for sharing
   */
  static generatePreview(strategy: ShareableStrategy): string {
    const conditionCounts = {
      high: strategy.conditions.filter(c => c.importance === 'high').length,
      medium: strategy.conditions.filter(c => c.importance === 'medium').length,
      low: strategy.conditions.filter(c => c.importance === 'low').length
    };

    return `${strategy.name} - ${strategy.conditions.length} conditions (${conditionCounts.high} high, ${conditionCounts.medium} medium, ${conditionCounts.low} low priority)`;
  }

  /**
   * Check if current URL contains a shared strategy
   */
  static hasSharedStrategy(): boolean {
    return window.location.hash.includes(this.URL_PREFIX);
  }

  /**
   * Clear shared strategy from URL
   */
  static clearShareUrl(): void {
    if (this.hasSharedStrategy()) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }

  /**
   * Get sharing statistics
   */
  static getShareStats(strategy: ShareableStrategy): {
    estimatedUrlLength: number;
    canShareViaUrl: boolean;
    conditionCount: number;
    complexity: 'simple' | 'moderate' | 'complex';
  } {
    const mockShareResult = this.generateShareUrl(strategy);
    const urlLength = mockShareResult.shareUrl?.length || 0;
    
    let complexity: 'simple' | 'moderate' | 'complex' = 'simple';
    if (strategy.conditions.length > 10) complexity = 'complex';
    else if (strategy.conditions.length > 5) complexity = 'moderate';

    return {
      estimatedUrlLength: urlLength,
      canShareViaUrl: urlLength <= this.MAX_URL_LENGTH,
      conditionCount: strategy.conditions.length,
      complexity
    };
  }
}

export default StrategySharing; 