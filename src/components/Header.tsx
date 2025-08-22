
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Calendar, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import ThemeToggle from './ThemeToggle';
import ResponsiveLogo from './ResponsiveLogo';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, language, setLanguage } = useLanguage();
  const location = useLocation();

  const navItems = [
    { path: '/', label: t('nav.home') },
    { path: '/services', label: t('nav.services') },
    { path: '/service-booking', label: 'Réservation' },
    { path: '/contact', label: t('nav.contact') }
  ];

  const isActive = (path: string) => location.pathname === path;

  // Fonction pour changer directement vers la langue spécifiée
  const switchToLanguage = (targetLanguage: 'fr' | 'en') => {
    setLanguage(targetLanguage);
  };

  return (
    <header className="shadow-lg sticky top-z-50 border-b border-gray-800" style={{ backgroundColor: 'rgba(0, 0, 0, 1)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 sm:h-22 md:h-24 lg:h-26">
          
          {/* Logo à gauche - largeur fixe */}
          <div className="flex-shrink-0 flex items-center py-2 w-48">
            <Link to="/" className="flex items-center">
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="flex items-center"
              >
                <ResponsiveLogo 
                  companyName="JJ Mécanique"
                  showText={false}
                  className="max-h-full"
                />
              </motion.div>
            </Link>
          </div>

          {/* Navigation Desktop - Parfaitement centrée avec espacement réduit */}
          <nav className="hidden lg:flex flex-1 justify-center px-12">
            <div className="flex items-center space-x-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    relative px-4 py-3 text-sm font-extrabold transition-all duration-200 rounded-md h-10 flex items-center
                    ${isActive(item.path)
                      ? 'text-red-400 bg-red-900/20'
                      : 'text-gray-300 hover:text-red-400 hover:bg-gray-800'
                    }
                  `}
                  style={{ fontWeight: 800 }}
                >
                  {item.label}
                  {isActive(item.path) && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-1 left-1 right-1 h-0.5 bg-red-600 rounded-full"
                    />
                  )}
                </Link>
              ))}
            </div>
          </nav>

          {/* Actions Desktop - À droite avec largeur fixe et hauteur uniforme */}
          <div className="hidden lg:flex items-center space-x-2 flex-shrink-0 w-80 justify-end">
            <Link
              to="/service-booking"
              className="
                flex items-center space-x-1 bg-red-600 text-white 
                px-3 py-2 rounded-lg hover:bg-red-700 
                transition-all duration-200 transform hover:scale-105
                shadow-sm hover:shadow-md text-sm font-extrabold h-10
              "
              style={{ fontWeight: 800 }}
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden xl:inline text-xs">Réservation</span>
            </Link>
            
            <Link
              to="/calculator"
              className="
                bg-blue-600 text-white px-4 py-2 rounded-lg 
                hover:bg-blue-700 transition-all duration-200 
                text-sm font-extrabold transform hover:scale-105
                shadow-sm hover:shadow-md h-10 flex items-center
              "
              style={{ fontWeight: 800 }}
            >
              {t('nav.quote')}
            </Link>

            {/* Sélecteur de langue APRÈS Devis Gratuit */}
            <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 h-10">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => switchToLanguage('fr')}
                className={`
                  flex items-center space-x-1 px-2 py-1 rounded-md text-sm font-extrabold transition-colors h-8
                  ${language === 'fr' 
                    ? 'bg-red-600 text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400'
                  }
                `}
                style={{ fontWeight: 800 }}
                title="Français"
              >
                <Globe className="h-3 w-3" />
                <span>FR</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => switchToLanguage('en')}
                className={`
                  flex items-center space-x-1 px-2 py-1 rounded-md text-sm font-extrabold transition-colors h-8
                  ${language === 'en' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }
                `}
                style={{ fontWeight: 800 }}
                title="English"
              >
                <Globe className="h-3 w-3" />
                <span>EN</span>
              </motion.button>
            </div>

            {/* Bouton mode sombre APRÈS le sélecteur de langues */}
            <div className="h-10 flex items-center">
              <ThemeToggle />
            </div>
          </div>

          {/* Menu Mobile Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="
              lg:hidden p-2 rounded-md text-gray-400 
              hover:text-white hover:bg-gray-800
              transition-colors duration-200 flex-shrink-0 ml-2 h-10 w-10 flex items-center justify-center
            "
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Menu Mobile */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden border-t border-gray-800 shadow-lg"
            style={{ backgroundColor: 'rgba(0, 0, 0, 1)' }}
          >
            <div className="px-4 py-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`
                    block px-4 py-3 rounded-lg text-base font-extrabold transition-colors
                    ${isActive(item.path)
                      ? 'text-red-400 bg-red-900/20 border-l-4 border-red-600'
                      : 'text-gray-300 hover:text-red-400 hover:bg-gray-800'
                    }
                  `}
                  style={{ fontWeight: 800 }}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Actions Mobile */}
              <div className="pt-3 mt-3 border-t border-gray-800">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between px-4">
                    {/* Sélecteur de langue mobile */}
                    <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                      <button
                        onClick={() => switchToLanguage('fr')}
                        className={`
                          flex items-center space-x-1 px-2 py-1 rounded-md text-sm font-extrabold transition-colors
                          ${language === 'fr' 
                            ? 'bg-red-600 text-white shadow-sm' 
                            : 'text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400'
                          }
                        `}
                        style={{ fontWeight: 800 }}
                      >
                        <Globe className="h-3 w-3" />
                        <span>FR</span>
                      </button>
                      
                      <button
                        onClick={() => switchToLanguage('en')}
                        className={`
                          flex items-center space-x-1 px-2 py-1 rounded-md text-sm font-extrabold transition-colors
                          ${language === 'en' 
                            ? 'bg-blue-600 text-white shadow-sm' 
                            : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                          }
                        `}
                        style={{ fontWeight: 800 }}
                      >
                        <Globe className="h-3 w-3" />
                        <span>EN</span>
                      </button>
                    </div>

                    {/* Bouton mode sombre mobile APRÈS le sélecteur de langues */}
                    <ThemeToggle />
                  </div>
                  
                  <Link
                    to="/service-booking"
                    onClick={() => setIsMenuOpen(false)}
                    className="
                      flex items-center justify-center space-x-2 
                      bg-red-600 text-white px-4 py-3 rounded-lg 
                      hover:bg-red-700 transition-colors font-extrabold mx-4
                    "
                    style={{ fontWeight: 800 }}
                  >
                    <Calendar className="h-5 w-5" />
                    <span>Réservation</span>
                  </Link>
                  
                  <Link
                    to="/calculator"
                    onClick={() => setIsMenuOpen(false)}
                    className="
                      bg-blue-600 text-white px-4 py-3 rounded-lg 
                      hover:bg-blue-700 transition-colors text-center font-extrabold mx-4
                    "
                    style={{ fontWeight: 800 }}
                  >
                    {t('nav.quote')}
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
