
import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, Lock, Users } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const PrivacyPolicy: React.FC = () => {
  const { t, language } = useLanguage();

  const sections = [
    {
      icon: Eye,
      titleKey: 'privacy.collection.title',
      contentKey: 'privacy.collection.content'
    },
    {
      icon: Users,
      titleKey: 'privacy.usage.title',
      contentKey: 'privacy.usage.content'
    },
    {
      icon: Lock,
      titleKey: 'privacy.protection.title',
      contentKey: 'privacy.protection.content'
    },
    {
      icon: Shield,
      titleKey: 'privacy.rights.title',
      contentKey: 'privacy.rights.content'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 dark:bg-blue-900/20 p-4 rounded-full">
              <Shield className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t('privacy.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            {t('privacy.last.updated')} : 16 {language === 'fr' ? 'janvier' : 'January'} 2025
          </p>
        </motion.div>

        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8"
        >
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
            {t('privacy.intro')}
          </p>
        </motion.div>

        {/* Sections principales */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8"
            >
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg flex-shrink-0">
                  <section.icon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {t(section.titleKey)}
                  </h2>
                  <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {t(section.contentKey)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Partage de données */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mt-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('privacy.sharing.title')}
          </h2>
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
            {t('privacy.sharing.content')}
          </div>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-8 mt-8 text-center"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('privacy.contact.title')}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            {t('privacy.contact.content')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:privacy@jjmecanique.ca"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              privacy@jjmecanique.ca
            </a>
            <a
              href="tel:+15145550123"
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
            >
              (514) 555-0123
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
