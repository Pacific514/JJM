
import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Shield, CreditCard, Wrench, AlertTriangle, CheckCircle, Clock, DollarSign, Phone, Mail } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const TermsConditions: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-6"
          >
            <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-full">
              <FileText className="h-12 w-12 text-blue-600" />
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4"
          >
            {t('terms.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 dark:text-gray-300"
          >
            {t('terms.subtitle')}
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-gray-500 dark:text-gray-400 mt-2"
          >
            {t('terms.last.updated')} : {new Date().toLocaleDateString(language === 'fr' ? 'fr-CA' : 'en-CA')}
          </motion.p>
        </div>

        <div className="space-y-8">
          {/* Section 1: Informations générales */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                1. {t('terms.general.title')}
              </h2>
            </div>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {t('terms.general.content')}
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">{t('terms.contact.info')}</h3>
                <ul className="text-blue-800 dark:text-blue-400 space-y-1">
                  <li><strong>{t('contact.phone.title')} :</strong> (514) 555-0123</li>
                  <li><strong>Email :</strong> info@jjmecanique.ca</li>
                  <li><strong>{t('contact.service.zone.title')} :</strong> {language === 'fr' ? 'Grand Montréal et environs (rayon de 100 km)' : 'Greater Montreal and surroundings (100 km radius)'}</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Section 2: Services offerts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center mb-4">
              <Wrench className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                2. {t('terms.services.title')}
              </h2>
            </div>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {t('terms.services.content')}
              </p>
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line mb-4">
                {t('terms.services.list')}
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                <h3 className="font-semibold text-green-900 dark:text-green-300 mb-2">{t('terms.hours.title')}</h3>
                <div className="text-green-800 dark:text-green-400 whitespace-pre-line">
                  {t('terms.hours.content')}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Section 3: Tarification et frais */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center mb-4">
              <DollarSign className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                3. {t('terms.pricing.title')}
              </h2>
            </div>
            <div className="prose dark:prose-invert max-w-none">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('terms.travel.fees')}</h3>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-700 mb-4">
                <ul className="text-orange-800 dark:text-orange-400 space-y-2">
                  <li><strong>{t('terms.travel.rate')}</strong></li>
                  <li><strong>{t('terms.travel.maximum')}</strong></li>
                  <li><strong>{t('terms.travel.calculation')}</strong></li>
                  <li><strong>{t('terms.travel.zone')}</strong></li>
                </ul>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('terms.taxes.title')}</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {t('terms.taxes.content')}
              </p>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 mb-4">
                <li>{t('terms.taxes.gst')}</li>
                <li>{t('terms.taxes.qst')}</li>
                <li><strong>{t('terms.taxes.total')}</strong></li>
              </ul>
            </div>
          </motion.div>

          {/* Section 4: Politique d'annulation et remboursement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center mb-4">
              <Clock className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                4. {t('terms.cancellation.title')}
              </h2>
            </div>
            <div className="prose dark:prose-invert max-w-none">
              <div className="grid md:grid-cols-1 gap-6">
                {/* Annulation 24h+ à l'avance */}
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <h3 className="font-semibold text-green-900 dark:text-green-300">
                      {t('terms.cancellation.24h.title')}
                    </h3>
                  </div>
                  <p className="text-green-800 dark:text-green-400">
                    <strong>{t('terms.cancellation.24h.content')}</strong>
                  </p>
                </div>

                {/* Annulation moins de 24h */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                    <h3 className="font-semibold text-yellow-900 dark:text-yellow-300">
                      {t('terms.cancellation.less24h.title')}
                    </h3>
                  </div>
                  <ul className="text-yellow-800 dark:text-yellow-400 space-y-1">
                    <li><strong>{t('terms.cancellation.less24h.services')}</strong></li>
                    <li><strong>{t('terms.cancellation.less24h.travel')}</strong></li>
                  </ul>
                </div>

                {/* Absence du client */}
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-700">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                    <h3 className="font-semibold text-red-900 dark:text-red-300">
                      {t('terms.cancellation.absent.title')}
                    </h3>
                  </div>
                  <ul className="text-red-800 dark:text-red-400 space-y-1">
                    <li><strong>{t('terms.cancellation.less24h.services')}</strong></li>
                    <li><strong>{t('terms.cancellation.less24h.travel')}</strong></li>
                  </ul>
                  <p className="text-red-800 dark:text-red-400 text-sm mt-2">
                    {t('terms.cancellation.absent.content')}
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">{t('terms.refund.title')}</h3>
                <ul className="text-blue-800 dark:text-blue-400 space-y-1">
                  <li>• {t('terms.refund.timeline')}</li>
                  <li>• {t('terms.refund.method')}</li>
                  <li>• {t('terms.refund.confirmation')}</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Section 5: Modes de paiement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center mb-4">
              <CreditCard className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                5. {t('terms.payment.title')}
              </h2>
            </div>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {t('terms.payment.accepted')}
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                  <li>{t('terms.payment.cash')}</li>
                  <li>{t('terms.payment.debit')}</li>
                  <li>{t('terms.payment.credit')}</li>
                  <li>{t('terms.payment.transfer')}</li>
                </ul>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('terms.invoice.title')}</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    {t('terms.invoice.content')}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Section 6: Garanties */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                6. {t('terms.warranty.title')}
              </h2>
            </div>
            <div className="prose dark:prose-invert max-w-none">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('terms.warranty.opc.title')}</h3>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700 mb-4">
                <p className="text-green-800 dark:text-green-400 mb-2">
                  {t('terms.warranty.opc.content')}
                </p>
                <ul className="text-green-800 dark:text-green-400 space-y-1">
                  <li><strong>{t('terms.warranty.parts')}</strong></li>
                  <li><strong>{t('terms.warranty.specialized')}</strong></li>
                  <li><strong>{t('terms.warranty.new.parts')}</strong></li>
                </ul>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('terms.warranty.limitations.title')}</h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                <li>{t('terms.warranty.limitations.wear')}</li>
                <li>{t('terms.warranty.limitations.damage')}</li>
                <li>{t('terms.warranty.limitations.receipt')}</li>
              </ul>
            </div>
          </motion.div>

          {/* Section 7: Dispositions générales */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center mb-4">
              <FileText className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                7. {t('terms.general.provisions.title')}
              </h2>
            </div>
            <div className="prose dark:prose-invert max-w-none">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('terms.modifications.title')}</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {t('terms.modifications.content')}
              </p>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('terms.applicable.law.title')}</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {t('terms.applicable.law.content')}
              </p>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('terms.data.protection.title')}</h3>
              <p className="text-gray-700 dark:text-gray-300">
                {t('terms.data.protection.content')}
                <a href="/privacy-policy" className="text-blue-600 hover:text-blue-700 underline ml-1">
                  {language === 'fr' ? 'politique de confidentialité' : 'privacy policy'}
                </a>.
              </p>
            </div>
          </motion.div>

          {/* Contact pour questions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700"
          >
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3">
              {t('terms.questions.title')}
            </h3>
            <p className="text-blue-800 dark:text-blue-400 mb-3">
              {t('terms.questions.content')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="tel:+15145550123" 
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                <Phone className="h-4 w-4 mr-2" />
                (514) 555-0123
              </a>
              <a 
                href="mailto:info@jjmecanique.ca" 
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                <Mail className="h-4 w-4 mr-2" />
                info@jjmecanique.ca
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;
