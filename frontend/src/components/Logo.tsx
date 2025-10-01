// Composant Logo Unity DevOps IDE
import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large' | 'xl';
  variant?: 'full' | 'icon-only';
  className?: string;
  showText?: boolean;
}

const sizeMap = {
  small: 32,
  medium: 48,
  large: 64,
  xl: 128,
};

export const Logo: React.FC<LogoProps> = ({ 
  size = 'medium', 
  variant = 'full',
  className = '',
  showText = true 
}) => {
  const pixelSize = sizeMap[size];
  const logoPath = variant === 'icon-only' 
    ? `/logos/logo-${pixelSize > 256 ? 512 : 256}.png`
    : '/logos/logo-full.png';

  if (variant === 'icon-only' || !showText) {
    return (
      <img 
        src={logoPath}
        alt="Unity DevOps IDE Logo"
        className={`unity-logo ${className}`}
        style={{ 
          width: pixelSize, 
          height: pixelSize,
          objectFit: 'contain'
        }}
      />
    );
  }

  return (
    <div className={`unity-logo-container flex items-center gap-3 ${className}`}>
      <img 
        src={logoPath}
        alt="Unity DevOps IDE Logo"
        className="unity-logo-image"
        style={{ 
          width: pixelSize, 
          height: pixelSize,
          objectFit: 'contain'
        }}
      />
      {showText && (
        <div className="unity-logo-text flex flex-col">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            DEVOPS
          </span>
          <div className="flex gap-2">
            <span className="text-xl font-semibold text-teal-500">
              UNITY
            </span>
            <span className="text-xl font-semibold text-blue-600 dark:text-blue-400">
              IDE
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Logo animé pour le splash screen
export const AnimatedLogo: React.FC<{ size?: 'small' | 'medium' | 'large' | 'xl' }> = ({ 
  size = 'xl' 
}) => {
  const pixelSize = sizeMap[size];

  return (
    <div className="animated-logo-container flex flex-col items-center gap-6">
      <div className="relative animate-pulse">
        <img 
          src="/logos/logo-full.png"
          alt="Unity DevOps IDE"
          className="unity-logo-animated"
          style={{ 
            width: pixelSize, 
            height: pixelSize,
            objectFit: 'contain',
            filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.3))'
          }}
        />
      </div>
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          DEVOPS
        </h1>
        <div className="flex gap-3">
          <span className="text-3xl font-semibold text-teal-500">
            UNITY
          </span>
          <span className="text-3xl font-semibold text-blue-600 dark:text-blue-400">
            IDE
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Performance de K9s + Fonctionnalités de 10 IDEs
        </p>
      </div>
    </div>
  );
};

// Logo pour la barre de navigation
export const NavbarLogo: React.FC = () => {
  return (
    <Logo 
      size="small" 
      variant="full"
      showText={true}
      className="cursor-pointer hover:opacity-80 transition-opacity"
    />
  );
};

// Logo pour le README (SVG inline pour GitHub)
export const ReadmeLogo: React.FC = () => {
  return (
    <div className="readme-logo text-center p-8">
      <img 
        src="/logos/logo-full.png"
        alt="Unity DevOps IDE"
        width="256"
        height="256"
        className="mx-auto"
      />
      <h1 className="text-5xl font-bold mt-6 mb-2">
        <span className="text-gray-900">DEVOPS</span>
      </h1>
      <div className="flex items-center justify-center gap-3">
        <span className="text-4xl font-semibold text-teal-500">UNITY</span>
        <span className="text-4xl font-semibold text-blue-600">IDE</span>
      </div>
      <p className="text-lg text-gray-600 mt-4 italic">
        "One IDE to rule them all"
      </p>
    </div>
  );
};

export default Logo;
