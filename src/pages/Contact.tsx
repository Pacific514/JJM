
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, MessageCircle, CreditCard, Shield, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';

const Contact: React.FC = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.phone || !formData.email || !formData.subject || !formData.message) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulation d'envoi
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Message envoyé avec succès !');
      setFormData({
        name: '',
        phone: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du message');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t('contact.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            {t('contact.subtitle')}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Informations de contact */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1 space-y-8"
          >
            {/* Contact direct */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {t('contact.direct.title')}
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Phone className="h-6 w-6 text-red-600 mr-4 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {t('contact.phone.title')}
                    </h3>
                    <a href="tel:+15145550123" className="text-blue-600 hover:text-blue-800 text-lg font-medium">
                      (514) 555-0123
                    </a>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('contact.phone.available')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Mail className="h-6 w-6 text-red-600 mr-4 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {t('contact.email.title')}
                    </h3>
                    <a href="mailto:info@jjmecanique.ca" className="text-blue-600 hover:text-blue-800">
                      info@jjmecanique.ca
                    </a>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('contact.email.response')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Clock className="h-6 w-6 text-red-600 mr-4 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {t('contact.hours.title')}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      {t('contact.hours.daily')}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('contact.hours.available')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Clavardage en direct */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <MessageCircle className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  {t('contact.chat.title')}
                </h3>
              </div>
              <p className="text-blue-700 dark:text-blue-300 mb-4">
                {t('contact.chat.desc')}
              </p>
              <a
                href="#"
                className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                {t('contact.chat.button')}
              </a>
            </div>

            {/* Paiements acceptés */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <CreditCard className="h-6 w-6 text-red-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('contact.payment.title')}
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">{t('contact.payment.online')}</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">{t('contact.payment.cash')}</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">{t('contact.payment.debit')}</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">{t('contact.payment.credit')}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Formulaire de contact et informations */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Formulaire */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {t('contact.form.title')}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('contact.form.name')}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('contact.form.phone')}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('contact.form.email')}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('contact.form.subject')}
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('contact.form.message')}
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Mail className="h-5 w-5 mr-2" />
                      {t('contact.form.send')}
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Zone de service et frais */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Zone de service */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <MapPin className="h-6 w-6 text-red-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('contact.service.zone.title')}
                  </h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      {t('contact.service.regions')}
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <li>• {t('contact.service.montreal')}</li>
                      <li>• {t('contact.service.laval')}</li>
                      <li>• {t('contact.service.south.shore')}</li>
                      <li>• {t('contact.service.north.shore')}</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Frais de déplacement */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('contact.travel.fees.title')}
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>{t('contact.travel.fees.rate')}</strong>
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t('contact.travel.fees.calculated')}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t('contact.travel.fees.maximum')}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t('contact.travel.fees.no.extra')}
                  </p>
                </div>
              </div>
            </div>

            {/* Garanties */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-6">
                <Shield className="h-6 w-6 text-red-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('contact.guarantees.title')}
                </h3>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {t('contact.guarantees.professionals')}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('contact.guarantees.professionals.desc')}
                  </p>
                </div>
                
                <div className="text-center">
                  <Shield className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {t('contact.guarantees.opc')}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('contact.guarantees.opc.desc')}
                  </p>
                </div>
                
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {t('contact.guarantees.satisfaction')}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('contact.guarantees.satisfaction.desc')}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
