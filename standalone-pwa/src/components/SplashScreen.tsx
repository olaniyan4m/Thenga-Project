// Simple Splash Screen Component
// Original simple splash screen with just logo and background

import React, { useEffect } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000); // Show splash for 3 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="splash-screen">
      <div className="splash-content">
        <img src="/assets/Logo4.PNG" alt="Thenga" className="splash-logo" />
        <p className="splash-subtitle">Digital Commerce for South Africa</p>
        <div className="splash-loader">
          <div className="loader"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;

