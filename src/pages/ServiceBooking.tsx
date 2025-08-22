
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, MapPin, CreditCard, CheckCircle, AlertTriangle, Car, Wrench, Phone, Mail } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useServices } from '../hooks/useServices';
import { useInvoices } from '../hooks/useInvoices';
import { squarePaymentService } from '../services/squarePayment';
import { googleCalendarService } from '../services/googleCalendar';
import { EmailService } from '../services/emailService';
import toast from 'react-hot-toast';

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  vehicleInfo: string;
  vehicleVin: string;
}

interface TimeSlot {
  start: string;
  end: string;
  label: string;
  available: boolean;
}

const ServiceBooking: React.FC = () => {
  const { t, language } = useLanguage();
  const { services, loading } = useServices();
  const { createInvoice } = useInvoices();
  
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedOptions, setSelectedOptions] = useState<{[key: string]: number}>({});
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: '',
    address: '',
    vehicleInfo: '',
    vehicleVin: ''
  });
  const [partsOption, setPartsOption] = useState<'search' | 'have'>('search');
  const [distance, setDistance] = useState<number>(0);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Créneaux de 3 heures (8h-18h, 7 jours/7)
  const timeSlots = [
    { start: '08:00', end: '11:00', label: '8h00 - 11h00' },
    { start: '11:00', end: '14:00', label: '11h00 - 14h00' },
    { start: '14:00', end: '17:00', label: '14h00 - 17h00' }
  ];

  // Calcul automatique de la distance
  useEffect(() => {
    const calculateDistance = async () => {
      if (customerInfo.address.trim()) {
        // Simulation du calcul de distance
        const estimatedDistance = Math.min(Math.random() * 80 + 10, 100);
        setDistance(estimatedDistance);
      } else {
        setDistance(0);
      }
    };

    const timeoutId = setTimeout(calculateDistance, 1000);
    return () => clearTimeout(timeoutId);
  }, [customerInfo.address]);

  // Charger les créneaux disponibles
  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots(selectedDate);
    }
  }, [selectedDate]);

  const loadAvailableSlots = async (dateStr: string) => {
    setLoadingSlots(true);
    try {
      const date = new Date(dateStr);
      const now = new Date();
      
      // Vérifier la règle des 72h
      const minBookingDate = new Date(now.getTime() + (72 * 60 * 60 * 1000));
      
      if (date < minBookingDate) {
        setAvailableSlots([]);
        setLoadingSlots(false);
        return;
      }

      const availableSlots = await googleCalendarService.getAvailableSlots(date);
      
      const slotsWithAvailability = timeSlots.map(slot => {
        const slotStart = new Date(date);
        const [hours, minutes] = slot.start.split(':');
        slotStart.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        const isAvailable = availableSlots.some(available => 
          available.start.getTime() === slotStart.getTime()
        );
        
        return {
          ...slot,
          available: isAvailable
        };
      });
      
      setAvailableSlots(slotsWithAvailability);
    } catch (error) {
      console.error('Erreur chargement créneaux:', error);
      setAvailableSlots(timeSlots.map(slot => ({ ...slot, available: true })));
    } finally {
      setLoadingSlots(false);
    }
  };

  const selectedServiceData = services.find(s => s.serviceId === selectedService);

  const calculateServiceCost = () => {
    if (!selectedServiceData) return 0;
    
    let total = selectedServiceData.basePrice || 0;
    
    Object.entries(selectedOptions).forEach(([optionIndex, quantity]) => {
      const option = selectedServiceData.options?.[parseInt(optionIndex)];
      if (option && quantity > 0) {
        total += (option.price || 0) * quantity;
      }
    });
    
    return total;
  };

  const calculateTravelCost = () => {
    return Math.min(distance * 0.61, 55);
  };

  const calculatePartsCost = () => {
    return partsOption === 'search' ? 20 : 0;
  };

  const calculateSubtotal = () => {
    return calculateServiceCost() + calculateTravelCost() + calculatePartsCost();
  };

  const calculateTaxes = () => {
    return calculateSubtotal() * 0.14975; // TPS 5% + TVQ 9.975%
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTaxes();
  };

  const isFormValid = () => {
    const now = new Date();
    const selectedDateTime = new Date(selectedDate);
    const minBookingDate = new Date(now.getTime() + (72 * 60 * 60 * 1000));
    
    return (
      selectedService &&
      selectedDate &&
      selectedTimeSlot &&
      customerInfo.name.trim() &&
      customerInfo.email.trim() &&
      customerInfo.phone.trim() &&
      customerInfo.address.trim() &&
      customerInfo.vehicleInfo.trim() &&
      acceptedTerms &&
      distance <= 100 &&
      selectedDateTime >= minBookingDate
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (distance > 100) {
      toast.error('Désolé, nous ne desservons pas les adresses à plus de 100 km');
      return;
    }

    setProcessing(true);

    try {
      const total = calculateTotal();

      // Créer la facture
      const invoiceData = {
        invoiceId: `INV-${Date.now()}`,
        invoiceNumber: `INV-${Date.now()}`,
        customerEmail: customerInfo.email,
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        serviceAddress: customerInfo.address,
        serviceName: language === 'fr' ? selectedServiceData?.nameFr || '' : selectedServiceData?.nameEn || '',
        services: [{
          serviceId: selectedService,
          serviceName: language === 'fr' ? selectedServiceData?.nameFr || '' : selectedServiceData?.nameEn || '',
          basePrice: selectedServiceData?.basePrice || 0,
          options: Object.entries(selectedOptions).map(([optionIndex, quantity]) => {
            const option = selectedServiceData?.options?.[parseInt(optionIndex)];
            return {
              name: language === 'fr' ? option?.nameFr || '' : option?.nameEn || '',
              price: option?.price || 0,
              quantity,
              total: (option?.price || 0) * quantity
            };
          }),
          totalPrice: calculateServiceCost()
        }],
        distance,
        subtotal: calculateSubtotal(),
        taxes: calculateTaxes(),
        totalAmount: total,
        status: 'pending' as const,
        serviceDate: selectedDate,
        notes: `${t('booking.summary.time')}: ${selectedTimeSlot}\n${t('booking.summary.parts')}: ${partsOption === 'search' ? t('booking.parts.search') : t('booking.parts.have')}\n${t('booking.summary.vehicle')}: ${customerInfo.vehicleInfo}${customerInfo.vehicleVin ? `\nVIN: ${customerInfo.vehicleVin}` : ''}`
      };

      const invoice = await createInvoice(invoiceData);
      
      if (!invoice) {
        throw new Error('Erreur création facture');
      }

      // Créer l'événement dans Google Calendar
      try {
        const [dateStr] = selectedDate.split('T');
        const [slotStart] = selectedTimeSlot.split(' - ');
        const appointmentDateTime = new Date(`${dateStr}T${slotStart}:00`);

        await googleCalendarService.createAppointment({
          title: `${t('booking.title')} - ${customerInfo.name}`,
          description: `${t('booking.summary.service')}: ${language === 'fr' ? selectedServiceData?.nameFr : selectedServiceData?.nameEn}\n\n${t('booking.summary.vehicle')}: ${customerInfo.vehicleInfo}${customerInfo.vehicleVin ? `\nVIN: ${customerInfo.vehicleVin}` : ''}\n\n${t('booking.summary.total')}: ${total.toFixed(2)}$ CAD`,
          startTime: appointmentDateTime,
          duration: 180, // 3 heures
          customerEmail: customerInfo.email,
          customerName: customerInfo.name,
          location: customerInfo.address
        });
      } catch (calendarError) {
        console.error('Erreur Google Calendar:', calendarError);
      }

      // Traitement du paiement Square
      try {
        const paymentResult = await squarePaymentService.processPayment({
          amount: Math.round(total * 100), // Centimes
          currency: 'CAD',
          sourceId: 'card-nonce-ok', // Simulation
          customerEmail: customerInfo.email,
          customerName: customerInfo.name,
          orderId: invoice._id
        });

        if (paymentResult.success) {
          toast.success(t('booking.success'));
          
          // Envoyer l'email de confirmation
          try {
            await EmailService.sendBookingConfirmation({
              to: customerInfo.email,
              subject: `Confirmation de réservation - ${invoiceData.invoiceNumber}`,
              customerName: customerInfo.name,
              service: language === 'fr' ? selectedServiceData?.nameFr || '' : selectedServiceData?.nameEn || '',
              date: selectedDate,
              timeSlot: selectedTimeSlot,
              address: customerInfo.address,
              total,
              invoiceNumber: invoiceData.invoiceNumber
            });
          } catch (emailError) {
            console.error('Erreur envoi email:', emailError);
          }
          
          // Réinitialiser le formulaire
          setSelectedService('');
          setSelectedOptions({});
          setSelectedDate('');
          setSelectedTimeSlot('');
          setCustomerInfo({
            name: '',
            email: '',
            phone: '',
            address: '',
            vehicleInfo: '',
            vehicleVin: ''
          });
          setPartsOption('search');
          setAcceptedTerms(false);
          setDistance(0);
          setAvailableSlots([]);
        } else {
          throw new Error('Paiement échoué');
        }
      } catch (paymentError) {
        console.error('Erreur paiement:', paymentError);
        toast.error('Erreur lors du paiement');
      }

    } catch (error) {
      console.error('Erreur lors de la réservation:', error);
      toast.error(t('booking.error'));
    } finally {
      setProcessing(false);
    }
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-6"
          >
            <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-full">
              <Calendar className="h-12 w-12 text-blue-600" />
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4"
          >
            {t('booking.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 dark:text-gray-300"
          >
            {t('booking.subtitle')}
          </motion.p>
        </div>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-8">
          {/* Colonne gauche - Sélection du service */}
          <div className="space-y-8">
            {/* Sélection du service */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {t('booking.select.service')}
              </h2>
              <div className="space-y-4">
                {services.map((service) => (
                  <div
                    key={service.serviceId}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedService === service.serviceId
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => setSelectedService(service.serviceId)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {language === 'fr' ? service.nameFr : service.nameEn}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {language === 'fr' ? service.descriptionFr : service.descriptionEn}
                        </p>
                        <p className="text-lg font-bold text-blue-600 mt-2">
                          {t('services.starting')} {(service.basePrice || 0).toFixed(2)}$ CAD
                        </p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 ${
                        selectedService === service.serviceId
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {selectedService === service.serviceId && (
                          <CheckCircle className="h-3 w-3 text-white" />
                        )}
                      </div>
                    </div>

                    {/* Options du service */}
                    {selectedService === service.serviceId && service.options && service.options.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                          Options disponibles:
                        </h4>
                        <div className="space-y-2">
                          {service.options.map((option: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                              <div className="flex-1">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {language === 'fr' ? option.nameFr : option.nameEn}
                                </span>
                                <span className="text-sm text-blue-600 ml-2">
                                  {(option.price || 0) > 0 ? `+${(option.price || 0).toFixed(2)}$` : 'Inclus'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const current = selectedOptions[index] || 0;
                                    if (current > 0) {
                                      setSelectedOptions(prev => ({
                                        ...prev,
                                        [index]: current - 1
                                      }));
                                    }
                                  }}
                                  className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 flex items-center justify-center text-sm"
                                >
                                  -
                                </button>
                                <span className="w-8 text-center font-semibold text-gray-900 dark:text-white">
                                  {selectedOptions[index] || 0}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const current = selectedOptions[index] || 0;
                                    setSelectedOptions(prev => ({
                                      ...prev,
                                      [index]: current + 1
                                    }));
                                  }}
                                  className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 flex items-center justify-center text-sm"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Sélection de la date et heure */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
            >
              <div className="flex items-center mb-6">
                <Calendar className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('booking.select.date')}
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date (minimum 72h à l'avance) *
                  </label>
                  <input
                    type="date"
                    required
                    value={selectedDate.split('T')[0]}
                    min={new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedTimeSlot('');
                    }}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {selectedDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('booking.select.time')} *
                    </label>
                    {loadingSlots ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">Chargement...</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-2">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot.start}
                            type="button"
                            disabled={!slot.available}
                            onClick={() => setSelectedTimeSlot(slot.label)}
                            className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                              selectedTimeSlot === slot.label
                                ? 'bg-blue-600 text-white border-blue-600'
                                : slot.available
                                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-600'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700 cursor-not-allowed'
                            }`}
                          >
                            <div className="flex items-center justify-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {slot.label}
                            </div>
                            {!slot.available && (
                              <div className="text-xs mt-1">{t('booking.slot.unavailable')}</div>
                            )}
                          </button>
                        ))}
                        {availableSlots.length === 0 && (
                          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                            {t('booking.minimum.72h')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Informations client */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
            >
              <div className="flex items-center mb-6">
                <User className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('booking.customer.info')}
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('calc.name')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder={t('calc.name')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('calc.email')} *
                  </label>
                  <input
                    type="email"
                    required
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder={t('calc.email')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('calc.phone')} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="(514) 555-0123"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type de véhicule *
                  </label>
                  <div className="relative">
                    <Car className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={customerInfo.vehicleInfo}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, vehicleInfo: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Ex: Honda Civic 2018"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('calc.address')} *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="123 Rue Example, Montréal, QC H1A 1A1"
                  />
                </div>
                {distance > 100 && (
                  <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                      <span className="text-red-700 dark:text-red-400 text-sm font-medium">
                        Désolé, nous ne desservons pas les adresses à plus de 100 km.
                      </span>
                    </div>
                  </div>
                )}
                {distance > 0 && distance <= 100 && (
                  <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-400">
                      Distance: {distance.toFixed(1)} km • Frais: {calculateTravelCost().toFixed(2)}$ CAD
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Numéro VIN (optionnel)
                </label>
                <input
                  type="text"
                  value={customerInfo.vehicleVin}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, vehicleVin: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Ex: 1HGCM82633A123456"
                  maxLength={17}
                />
              </div>
            </motion.div>

            {/* Options pièces */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
            >
              <div className="flex items-center mb-6">
                <Wrench className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('booking.parts.option')}
                </h2>
              </div>

              <div className="space-y-4">
                <div
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    partsOption === 'search'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setPartsOption('search')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {t('booking.parts.search')}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Nous trouvons et installons les pièces pour vous
                      </p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      partsOption === 'search'
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {partsOption === 'search' && (
                        <CheckCircle className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    partsOption === 'have'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setPartsOption('have')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {t('booking.parts.have')}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {t('booking.parts.warranty.note')}
                      </p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      partsOption === 'have'
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {partsOption === 'have' && (
                        <CheckCircle className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Colonne droite - Résumé et paiement */}
          <div className="space-y-8">
            {/* Résumé de la réservation */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sticky top-6"
            >
              <div className="flex items-center mb-6">
                <CreditCard className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('booking.summary')}
                </h2>
              </div>

              {selectedService && selectedServiceData ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      {t('booking.summary.service')}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          {language === 'fr' ? selectedServiceData.nameFr : selectedServiceData.nameEn}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {(selectedServiceData.basePrice || 0).toFixed(2)}$
                        </span>
                      </div>
                      
                      {Object.entries(selectedOptions).map(([optionIndex, quantity]) => {
                        const option = selectedServiceData.options?.[parseInt(optionIndex)];
                        if (!option || quantity === 0) return null;
                        
                        return (
                          <div key={optionIndex} className="flex justify-between text-xs text-gray-600 dark:text-gray-400 ml-4">
                            <span>+ {language === 'fr' ? option.nameFr : option.nameEn} × {quantity}</span>
                            <span>{((option.price || 0) * quantity).toFixed(2)}$</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {selectedDate && selectedTimeSlot && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">{t('booking.summary.date')}</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {new Date(selectedDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">{t('booking.summary.time')}</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {selectedTimeSlot}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">{t('booking.summary.service.cost')}</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {calculateServiceCost().toFixed(2)}$
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">
                        {t('booking.summary.travel.cost')} ({distance.toFixed(1)} km)
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {calculateTravelCost().toFixed(2)}$
                      </span>
                    </div>

                    {partsOption === 'search' && (
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">{t('booking.summary.parts.cost')}</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {calculatePartsCost().toFixed(2)}$
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">{t('booking.summary.subtotal')}</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {calculateSubtotal().toFixed(2)}$
                      </span>
                    </div>

                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">{t('booking.summary.taxes')}</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {calculateTaxes().toFixed(2)}$
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-gray-900 dark:text-white">{t('booking.summary.total')}</span>
                      <span className="text-blue-600">
                        {calculateTotal().toFixed(2)}$ CAD
                      </span>
                    </div>
                  </div>

                  {/* Case à cocher CGV */}
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        required
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        J'accepte les{' '}
                        <a href="/terms-conditions" target="_blank" className="text-blue-600 hover:text-blue-700 underline">
                          conditions générales de vente
                        </a>
                        {' '}et la{' '}
                        <a href="/privacy-policy" target="_blank" className="text-blue-600 hover:text-blue-700 underline">
                          politique de confidentialité
                        </a>
                        . *
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={!isFormValid() || processing || distance > 100}
                    className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {processing ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    ) : (
                      <CreditCard className="h-5 w-5 mr-2" />
                    )}
                    {t('booking.confirm')}
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Sélectionnez un service pour voir le résumé
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceBooking;
