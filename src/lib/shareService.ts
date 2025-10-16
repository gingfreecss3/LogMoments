import { Share } from '@capacitor/share';
import type { ShareOptions } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

class ShareService {
  private readonly isNative = Capacitor.isNativePlatform();

  async canShare(): Promise<boolean> {
    if (!this.isNative) {
      return 'share' in navigator;
    }

    try {
      const result = await Share.canShare();
      return result.value;
    } catch {
      return false;
    }
  }

  async shareMoment(content: string, feeling: string): Promise<void> {
    const text = `${content}\n\n✨ Feeling: ${feeling}\n\nShared from LogMoments`;
    
    if (this.isNative) {
      await this.nativeShare({ text, title: 'My Moment' });
    } else {
      await this.webShare({ text, title: 'My Moment' });
    }
  }

  async shareText(text: string, title?: string): Promise<void> {
    if (this.isNative) {
      await this.nativeShare({ text, title: title || 'Share' });
    } else {
      await this.webShare({ text, title: title || 'Share' });
    }
  }

  async shareUrl(url: string, title?: string, text?: string): Promise<void> {
    if (this.isNative) {
      await this.nativeShare({ url, title: title || 'Share', text });
    } else {
      await this.webShare({ url, title: title || 'Share', text });
    }
  }

  private async nativeShare(options: ShareOptions): Promise<void> {
    try {
      await Share.share(options);
    } catch (error) {
      console.error('Error sharing:', error);
      throw new Error('Failed to share');
    }
  }

  private async webShare(options: { text?: string; title?: string; url?: string }): Promise<void> {
    if ('share' in navigator) {
      try {
        await (navigator as Navigator & { share: (data?: ShareData) => Promise<void> }).share(options);
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        console.error('Error sharing:', error);
        throw new Error('Failed to share');
      }
    } else {
      if (options.text) {
        const nav = navigator as Navigator & { clipboard?: Clipboard };
        if (nav.clipboard?.writeText) {
          await nav.clipboard.writeText(options.text);
          alert('Text copied to clipboard!');
        } else {
          console.warn('Clipboard API not available');
        }
      }
    }
  }
}

export const shareService = new ShareService();
