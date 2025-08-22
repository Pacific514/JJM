
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, MapPin, Shield, Phone, Calculator } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import HeroSlider from '../components/HeroSlider';
import { useServices } from '../hooks/useServices';

const Home: React.FC = () => {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const { services, loading } = useServices();

  const advantages = [
    {
      icon: MapPin,
      titleKey: 'home.advantage.mobile.title',
      descKey: 'home.advantage.mobile.desc'
    },
    {
      icon: Clock,
      titleKey: 'home.advantage.fast.title',
      descKey: 'home.advantage.fast.desc'
    },
    {
      icon: Shield,
      titleKey: 'home.advantage.quality.title',
      descKey: 'home.advantage.quality.desc'
    },
    {
      icon: CheckCircle,
      titleKey: 'home.advantage.certified.title',
      descKey: 'home.advantage.certified.desc'
    }
  ];

  const featuredServices = services.slice(0, 4);

  return (
    <div className="min-h-screen">
      {/* Hero Slider */}
      <HeroSlider />

      {/* Section avantages avec icônes rouges en mode sombre */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('home.advantages.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {t('home.advantages.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {advantages.map((advantage, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  theme === 'dark' 
                    ? 'bg-red-600' 
                    : 'bg-blue-100 dark:bg-blue-900'
                }`}>
                  <advantage.icon className={`h-8 w-8 ${
                    theme === 'dark' 
                      ? 'text-white' 
                      : 'text-blue-600'
                  }`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t(advantage.titleKey)}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t(advantage.descKey)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section services populaires */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('services.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {t('services.subtitle')}
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredServices.map((service, index) => (
                <motion.div
                  key={service.serviceId}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
                >
                  <img
                    src={service.imageUrl}
                    alt={language === 'fr' ? service.nameFr : service.nameEn}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {language === 'fr' ? service.nameFr : service.nameEn}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                      {language === 'fr' ? service.descriptionFr : service.descriptionEn}
                    </p>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-2xl font-bold text-blue-600">
                          {service.basePrice}$
                        </span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t('services.starting')}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{service.duration} {t('services.minutes')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/services"
              className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              {t('home.cta.view.all')}
            </Link>
          </div>
        </div>
      </section>

      {/* Section CTA */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('home.cta.title')}
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              {t('home.cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/calculator"
                className="inline-flex items-center justify-center bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
              >
                <Calculator className="h-5 w-5 mr-2" />
                {t('calc.title')}
              </Link>
              <a
                href="tel:+15145550123"
                className="inline-flex items-center justify-center bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                <Phone className="h-5 w-5 mr-2" />
                {t('hero.phone')}
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
