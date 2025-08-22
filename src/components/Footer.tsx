
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Send } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubscribing(true);
    
    // Simulation d'inscription à l'infolettre
    setTimeout(() => {
      toast.success('Inscription réussie à l\'infolettre !');
      setEmail('');
      setIsSubscribing(false);
    }, 1000);
  };

  // Icône TikTok personnalisée
  const TikTokIcon = ({ className }: { className: string }) => (
    <svg 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={className}
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  );

  return (
    <footer className="text-white" style={{ backgroundColor: 'rgba(0, 0, 0, 1)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Logo et Suivez-nous */}
          <div className="lg:col-span-1">
            <img
              src="https://static.lumi.new/8d/8d6bd42022b6bb94b92c1e4aa516a75c.webp"
              alt="JJ Mécanique"
              className="h-13 mb-4"
              style={{
                transform: 'scale(0.561)',
                transformOrigin: 'left center',
                width: 'auto'
              }}
            />
            <p className="text-gray-300 mb-6">
              Service mobile professionnel de pneus et mécanique. Nous nous déplaçons chez vous pour tous vos besoins automobiles dans la région de Montréal.
            </p>

            {/* Réseaux sociaux */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Suivez-nous</h4>
              <div className="flex space-x-3">
                <a
                  href="#"
                  className="text-gray-300 hover:text-red-400 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="text-gray-300 hover:text-red-400 transition-colors"
                  aria-label="TikTok"
                >
                  <TikTokIcon className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Services et Navigation */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Nos Services</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/services" className="text-gray-300 hover:text-red-400 transition-colors flex items-center">
                  <span className="text-red-400 mr-2">•</span>
                  Changement de pneus saisonnier
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-300 hover:text-red-400 transition-colors flex items-center">
                  <span className="text-red-400 mr-2">•</span>
                  Réparation de crevaison
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-300 hover:text-red-400 transition-colors flex items-center">
                  <span className="text-red-400 mr-2">•</span>
                  Changement d'huile mobile
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-300 hover:text-red-400 transition-colors flex items-center">
                  <span className="text-red-400 mr-2">•</span>
                  Remplacement de batterie
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-300 hover:text-red-400 transition-colors flex items-center">
                  <span className="text-red-400 mr-2">•</span>
                  Remplacement de freins
                </Link>
              </li>
              <li>
                <Link to="/calculator" className="text-gray-300 hover:text-red-400 transition-colors flex items-center">
                  <span className="text-red-400 mr-2">•</span>
                  Calculateur de prix
                </Link>
              </li>
            </ul>
          </div>

          {/* Informations (anciennement Contact & Zone) */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Informations</h3>
            <div className="space-y-3 mb-4">
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-3 text-red-400" />
                <a href="tel:+15145550123" className="text-gray-300 hover:text-red-400 transition-colors">
                  (514) 555-0123
                </a>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-red-400" />
                <a href="mailto:info@jjmecanique.ca" className="text-gray-300 hover:text-red-400 transition-colors">
                  info@jjmecanique.ca
                </a>
              </div>
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 text-red-400 mt-0.5" />
                <div className="text-gray-300">
                  <div>Montréal et environs</div>
                  <div className="text-sm text-gray-400">Rayon de service: 100 km</div>
                  <div className="text-sm text-gray-400">Frais déplacement: 0,61$ /km</div>
                </div>
              </div>
            </div>
          </div>

          {/* Infolettre */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Infolettre</h3>
            <p className="text-gray-300 text-sm mb-4">
              Recevez nos promotions et conseils d'entretien par courriel.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="mb-6">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre courriel"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white placeholder-gray-400 mb-3"
                required
              />
              <button
                type="submit"
                disabled={isSubscribing}
                className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isSubscribing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    S'abonner
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Liens légaux et copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Copyright à gauche */}
            <p className="text-gray-300 text-sm mb-4 md:mb-0">
              © 2024 JJ Mécanique Mobile. Tous droits réservés.
            </p>
            
            {/* Liens légaux à droite - éclaircis */}
            <div className="flex flex-wrap gap-6">
              <Link 
                to="/privacy-policy" 
                className="text-gray-300 hover:text-red-400 transition-colors text-sm"
              >
                Politique de confidentialité
              </Link>
              <Link 
                to="/terms-conditions" 
                className="text-gray-300 hover:text-red-400 transition-colors text-sm"
              >
                Conditions générales
              </Link>
              <Link 
                to="/client-portal" 
                className="text-gray-300 hover:text-red-400 transition-colors text-sm"
              >
                Espace client
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
