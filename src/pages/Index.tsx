import { useState, useEffect } from 'react';
import { getProfile } from '@/lib/storage';
import Onboarding from '@/pages/Onboarding';
import Dashboard from '@/pages/Dashboard';

const Index = () => {
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  useEffect(() => {
    setHasProfile(!!getProfile());
  }, []);

  if (hasProfile === null) return null;

  if (!hasProfile) {
    return <Onboarding onComplete={() => setHasProfile(true)} />;
  }

  return <Dashboard />;
};

export default Index;
