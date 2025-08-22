
import React from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setLanguage('fr')}
        className={`
          flex items-center space-x-1 px-2 py-1 rounded-md text-sm font-medium transition-colors
          ${language === 'fr' 
            ? 'bg-red-600 text-white shadow-sm' 
            : 'text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400'
          }
        `}
        title="Français"
      >
        <Globe className="h-3 w-3" />
        <span>FR</span>
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setLanguage('en')}
        className={`
          flex items-center space-x-1 px-2 py-1 rounded-md text-sm font-medium transition-colors
          ${language === 'en' 
            ? 'bg-red-600 text-white shadow-sm' 
            : 'text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400'
          }
        `}
        title="English"
      >
        <Globe className="h-3 w-3" />
        <span>EN</span>
      </motion.button>
    </div>
  );
};

export default LanguageToggle;
