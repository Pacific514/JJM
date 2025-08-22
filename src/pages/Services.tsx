
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Star, Calendar, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useServices } from '../hooks/useServices';

interface ServiceOption {
  nameFr: string;
  nameEn: string;
  price: number;
}

interface SelectedOption {
  serviceId: string;
  optionIndex: number;
  quantity: number;
}

const Services: React.FC = () => {
  const { t, language } = useLanguage();
  const { services, loading } = useServices();
  const [expandedServices, setExpandedServices] = useState<string[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);

  const toggleServiceExpansion = (serviceId: string) => {
    setExpandedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleOptionSelect = (serviceId: string, optionIndex: number) => {
    setSelectedOptions(prev => {
      const existing = prev.find(opt => opt.serviceId === serviceId && opt.optionIndex === optionIndex);
      
      if (existing) {
        // Si l'option existe déjà, on l'enlève
        return prev.filter(opt => !(opt.serviceId === serviceId && opt.optionIndex === optionIndex));
      } else {
        // Sinon on l'ajoute
        return [...prev, { serviceId, optionIndex, quantity: 1 }];
      }
    });
  };

  const updateOptionQuantity = (serviceId: string, optionIndex: number, quantity: number) => {
    if (quantity <= 0) {
      setSelectedOptions(prev => 
        prev.filter(opt => !(opt.serviceId === serviceId && opt.optionIndex === optionIndex))
      );
      return;
    }

    setSelectedOptions(prev => 
      prev.map(opt => 
        opt.serviceId === serviceId && opt.optionIndex === optionIndex
          ? { ...opt, quantity }
          : opt
      )
    );
  };

  const isOptionSelected = (serviceId: string, optionIndex: number) => {
    return selectedOptions.some(opt => opt.serviceId === serviceId && opt.optionIndex === optionIndex);
  };

  const getOptionQuantity = (serviceId: string, optionIndex: number) => {
    const option = selectedOptions.find(opt => opt.serviceId === serviceId && opt.optionIndex === optionIndex);
    return option?.quantity || 0;
  };

  // FONCTION SÉCURISÉE pour calcul du total d'un service
  const calculateServiceTotal = (service: any) => {
    // Vérification de sécurité pour le prix de base
    const basePrice = service.basePrice || 0;
    
    const optionsTotal = selectedOptions
      .filter(opt => opt.serviceId === service.serviceId)
      .reduce((total, opt) => {
        const option = service.options?.[opt.optionIndex];
        if (!option || typeof option.price !== 'number') return total;
        
        const quantity = opt.quantity || 0;
        return total + (option.price * quantity);
      }, 0);
    
    return basePrice + optionsTotal;
  };

  // FONCTION SÉCURISÉE pour calcul du total de tous les services sélectionnés
  const getTotalSelectedServices = () => {
    return services.reduce((total, service) => {
      const hasSelectedOptions = selectedOptions.some(opt => opt.serviceId === service.serviceId);
      if (hasSelectedOptions) {
        return total + calculateServiceTotal(service);
      }
      return total;
    }, 0);
  };

  const getSelectedServicesCount = () => {
    const servicesWithOptions = new Set(selectedOptions.map(opt => opt.serviceId));
    return servicesWithOptions.size;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4"
          >
            {t('services.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 dark:text-gray-300"
          >
            {t('services.subtitle')}
          </motion.p>
        </div>

        {/* Résumé des sélections */}
        {getSelectedServicesCount() > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6 mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Services sélectionnés ({getSelectedServicesCount()})
                </h3>
                <p className="text-blue-700 dark:text-blue-300">
                  Total estimé: <span className="font-bold text-xl">{getTotalSelectedServices().toFixed(2)}$ CAD</span>
                  <span className="text-sm ml-2">(+ frais de déplacement selon distance)</span>
                </p>
              </div>
              <a
                href="/service-booking"
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center"
              >
                <Calendar className="h-5 w-5 mr-2" />
                Réserver maintenant
              </a>
            </div>
          </motion.div>
        )}

        {/* Services - Une seule section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Mécanique Générale
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.serviceId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <img
                  src={service.imageUrl}
                  alt={language === 'fr' ? service.nameFr : service.nameEn}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {language === 'fr' ? service.nameFr : service.nameEn}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-blue-600">
                      {t('services.starting')} {(service.basePrice || 0).toFixed(2)}$ CAD
                    </span>
                    <div className="flex items-center text-gray-500 dark:text-gray-400">
                      <Clock className="h-4 w-4 mr-1" />
                      <span className="text-sm">{service.duration} {t('services.minutes')}</span>
                    </div>
                  </div>

                  {/* Options du service */}
                  {service.options && service.options.length > 0 && (
                    <div className="mb-4">
                      <button
                        onClick={() => toggleServiceExpansion(service.serviceId)}
                        className="flex items-center justify-between w-full text-left text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        <span className="font-medium">Options disponibles</span>
                        {expandedServices.includes(service.serviceId) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                      
                      {expandedServices.includes(service.serviceId) && (
                        <div className="mt-3 space-y-3">
                          {service.options.map((option: ServiceOption, optionIndex: number) => (
                            <div
                              key={optionIndex}
                              className={`border rounded-lg p-3 cursor-pointer transition-all ${
                                isOptionSelected(service.serviceId, optionIndex)
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                              }`}
                              onClick={() => handleOptionSelect(service.serviceId, optionIndex)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center flex-1">
                                  <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center ${
                                    isOptionSelected(service.serviceId, optionIndex)
                                      ? 'border-blue-500 bg-blue-500'
                                      : 'border-gray-300 dark:border-gray-600'
                                  }`}>
                                    {isOptionSelected(service.serviceId, optionIndex) && (
                                      <Check className="h-3 w-3 text-white" />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900 dark:text-white">
                                      {language === 'fr' ? option.nameFr : option.nameEn}
                                    </p>
                                    <p className="text-sm text-blue-600 font-semibold">
                                      {(option.price || 0) > 0 ? `+${(option.price || 0).toFixed(2)}$` : 'Inclus'}
                                    </p>
                                  </div>
                                </div>
                                
                                {isOptionSelected(service.serviceId, optionIndex) && (
                                  <div className="flex items-center space-x-2 ml-3">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateOptionQuantity(service.serviceId, optionIndex, 
                                          getOptionQuantity(service.serviceId, optionIndex) - 1
                                        );
                                      }}
                                      className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center text-sm"
                                    >
                                      -
                                    </button>
                                    <span className="font-semibold text-gray-900 dark:text-white min-w-[20px] text-center">
                                      {getOptionQuantity(service.serviceId, optionIndex)}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateOptionQuantity(service.serviceId, optionIndex, 
                                          getOptionQuantity(service.serviceId, optionIndex) + 1
                                        );
                                      }}
                                      className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center text-sm"
                                    >
                                      +
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Total du service si options sélectionnées */}
                  {selectedOptions.some(opt => opt.serviceId === service.serviceId) && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg mb-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-green-700 dark:text-green-300">
                          Total pour ce service:
                        </span>
                        <span className="font-bold text-green-600 dark:text-green-400 text-lg">
                          {calculateServiceTotal(service).toFixed(2)}$ CAD
                        </span>
                      </div>
                    </div>
                  )}

                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                    {language === 'fr' ? service.descriptionFr : service.descriptionEn}
                  </p>

                  <a
                    href="/service-booking"
                    className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-semibold text-center block"
                  >
                    {t('services.book.now')}
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Call to Action */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-blue-600 to-red-600 rounded-lg p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">{t('home.cta.title')}</h2>
            <p className="text-xl mb-6">{t('home.cta.subtitle')}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/calculator"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
              >
                Obtenir une estimation
              </a>
              <a
                href="/service-booking"
                className="bg-red-700 text-white px-8 py-3 rounded-lg hover:bg-red-800 transition-colors font-semibold flex items-center justify-center"
              >
                <Calendar className="h-5 w-5 mr-2" />
                {t('home.cta.book.now')}
              </a>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Services;
