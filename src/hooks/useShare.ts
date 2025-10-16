import { useState } from 'react';
import { shareService } from '../lib/shareService';

export const useShare = () => {
  const [isSharing, setIsSharing] = useState(false);

  const shareMoment = async (content: string, feeling: string) => {
    try {
      setIsSharing(true);
      await shareService.shareMoment(content, feeling);
    } catch (error) {
      console.error('Error sharing moment:', error);
      throw error;
    } finally {
      setIsSharing(false);
    }
  };

  const shareText = async (text: string, title?: string) => {
    try {
      setIsSharing(true);
      await shareService.shareText(text, title);
    } catch (error) {
      console.error('Error sharing text:', error);
      throw error;
    } finally {
      setIsSharing(false);
    }
  };

  const shareUrl = async (url: string, title?: string, text?: string) => {
    try {
      setIsSharing(true);
      await shareService.shareUrl(url, title, text);
    } catch (error) {
      console.error('Error sharing URL:', error);
      throw error;
    } finally {
      setIsSharing(false);
    }
  };

  return {
    isSharing,
    shareMoment,
    shareText,
    shareUrl,
  };
};
