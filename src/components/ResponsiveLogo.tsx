
import React from 'react';

interface ResponsiveLogoProps {
  className?: string;
  companyName?: string;
  showText?: boolean;
  logoUrl?: string;
}

const ResponsiveLogo: React.FC<ResponsiveLogoProps> = ({ 
  className = '', 
  companyName = "JJ Mécanique",
  showText = false,
  logoUrl
}) => {
  // Utiliser le nouveau logo fourni
  const newLogo = "https://static.lumi.new/8d/8d6bd42022b6bb94b92c1e4aa516a75c.webp";
  const fallbackLogo = "https://static.lumi.new/e5/e5fec81e2a72d5284b07d2c7ca256c9d.webp";
  const currentLogo = logoUrl || newLogo;

  return (
    <div className={`flex items-center ${className}`}>
      {/* Logo image - affiché à 50.4% de la taille avec responsive (+5%) */}
      <img
        src={currentLogo}
        alt={`${companyName} - Pneus et mécanique mobile`}
        className="
          h-10 w-auto sm:h-12 md:h-14 lg:h-16 xl:h-18 2xl:h-20
          max-w-none object-contain
          transition-all duration-200
          max-h-full
        "
        style={{
          maxHeight: 'calc(100% - 8px)',
          width: 'auto',
          transform: 'scale(0.504)',
          transformOrigin: 'left center'
        }}
        onError={(e) => {
          // En cas d'erreur de chargement, revenir au logo de fallback
          const target = e.target as HTMLImageElement;
          if (target.src !== fallbackLogo) {
            target.src = fallbackLogo;
          }
        }}
      />
      
      {/* Texte du nom de l'entreprise (optionnel) */}
      {showText && (
        <span className="
          ml-3 font-bold text-white
          text-base sm:text-lg md:text-xl lg:text-2xl
          hidden sm:inline-block
        ">
          {companyName}
        </span>
      )}
    </div>
  );
};

export default ResponsiveLogo;
