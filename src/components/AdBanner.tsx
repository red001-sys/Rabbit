import { useEffect, useRef } from 'react';
import { isPremium } from '@/lib/storage';

interface AdBannerProps {
  format?: 'auto' | 'horizontal' | 'rectangle';
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

const AD_CLIENT = 'ca-pub-XXXXXXXXXX'; // TODO: Replace with your real AdSense publisher ID
const AD_SLOT = '0000000000'; // TODO: Replace with your real ad slot ID

const AdBanner = ({ format = 'auto', className = '' }: AdBannerProps) => {
  const adRef = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);
  const premium = isPremium();

  useEffect(() => {
    if (premium || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense not loaded yet
    }
  }, [premium]);

  if (premium) return null;

  return (
    <div ref={adRef} className={`w-full flex justify-center ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', minHeight: 50 }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={AD_SLOT}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdBanner;
