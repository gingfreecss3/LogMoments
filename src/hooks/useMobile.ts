import { useEffect, useState } from 'react';
import { isNativeMobile, getMobileInfo } from '../mobile';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { logger } from '../lib/logger';

interface MobileInfo {
  name: string;
  version: string;
  build: string;
  platform: string;
}

export const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [mobileInfo, setMobileInfo] = useState<MobileInfo | null>(null);

  useEffect(() => {
    const checkMobile = async () => {
      const mobile = isNativeMobile();
      setIsMobile(mobile);

      if (mobile) {
        const info = await getMobileInfo();
        setMobileInfo(info);
      }
    };

    checkMobile();
  }, []);

  const hapticFeedback = async (style: ImpactStyle = ImpactStyle.Medium) => {
    if (!isMobile) {
      return;
    }

    try {
      await Haptics.impact({ style });
    } catch (error) {
      logger.error('Haptic feedback failed', error);
    }
  };

  const hapticNotification = async (type: 'Success' | 'Warning' | 'Error' = 'Success') => {
    if (!isMobile) {
      return;
    }

    try {
      await Haptics.notification({ type: NotificationType[type] });
    } catch (error) {
      logger.error('Haptic notification failed', error);
    }
  };

  return {
    isMobile,
    mobileInfo,
    hapticFeedback,
    hapticNotification,
  };
};
