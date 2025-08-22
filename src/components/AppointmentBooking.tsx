
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, CreditCard, ArrowLeft, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';

interface SelectedService {
  serviceId: string;
  name: string;
  price: number;
  duration: number;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  preferredDate: string;
  notes: string;
}

interface AppointmentBookingProps {
  customerInfo: CustomerInfo;
  selectedServices: SelectedService[];
  total: number;
  onBack: () => void;
}

const AppointmentBooking: React.FC<AppointmentBookingProps> = ({
  customerInfo,
  selectedServices,
  total,
  onBack
}) => {
  const { t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);

  // Créneaux horaires disponibles
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Veuillez sélectionner une date et une heure');
      return;
    }

    setIsBooking(true);

    try {
      // Simulation de réservation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setBookingComplete(true);
      toast.success('Rendez-vous confirmé !');
    } catch (error) {
      toast.error('Erreur lors de la réservation');
    } finally {
      setIsBooking(false);
    }
  };

  if (bookingComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center"
      >
        <div className="bg-red-100 dark:bg-red-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="h-10 w-10 text-red-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Rendez-vous confirmé !
        </h1>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Détails de votre rendez-vous
          </h2>
          
          <div className="space-y-3 text-left">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Date:</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {new Date(selectedDate).toLocaleDateString('fr-CA')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Heure:</span>
              <span className="text-gray-900 dark:text-white font-medium">{selectedTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Client:</span>
              <span className="text-gray-900 dark:text-white font-medium">{customerInfo.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Total:</span>
              <span className="text-red-600 font-bold text-lg">{total.toFixed(2)}$</span>
            </div>
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Un email de confirmation a été envoyé à {customerInfo.email}
        </p>
        
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
        >
          Nouveau devis
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* En-tête */}
      <div className="flex items-center mb-8">
        <button
          onClick={onBack}
          className="mr-4 p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 transition-colors"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Réserver votre rendez-vous
        </h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Formulaire de réservation */}
        <div className="space-y-6">
          {/* Sélection de la date */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-red-600" />
              Choisir une date
            </h2>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Sélection de l'heure */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-red-600" />
              Choisir une heure
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`p-3 rounded-lg border transition-colors ${
                    selectedTime === time
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:border-red-500'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Méthode de paiement */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-red-600" />
              Méthode de paiement
            </h2>
            <div className="space-y-3">
              <label className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'card')}
                  className="mr-3 text-red-600"
                />
                <span className="text-gray-900 dark:text-white">Carte de crédit/débit</span>
              </label>
              
              <label className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <input
                  type="radio"
                  name="payment"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'cash')}
                  className="mr-3 text-red-600"
                />
                <span className="text-gray-900 dark:text-white">Paiement comptant sur place</span>
              </label>
            </div>
          </div>
        </div>

        {/* Résumé de la commande */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Résumé de votre commande
          </h2>

          {/* Informations client */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Informations client</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Nom:</span>
                <span className="text-gray-900 dark:text-white">{customerInfo.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Email:</span>
                <span className="text-gray-900 dark:text-white">{customerInfo.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Téléphone:</span>
                <span className="text-gray-900 dark:text-white">{customerInfo.phone}</span>
              </div>
            </div>
          </div>

          {/* Services sélectionnés */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Services sélectionnés</h3>
            <div className="space-y-2">
              {selectedServices.map((service) => (
                <div key={service.serviceId} className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">{service.name}</span>
                  <span className="text-gray-900 dark:text-white">{service.price}$</span>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span className="text-gray-900 dark:text-white">Total</span>
              <span className="text-red-600">{total.toFixed(2)}$</span>
            </div>
          </div>

          {/* Bouton de confirmation */}
          <button
            onClick={handleBooking}
            disabled={!selectedDate || !selectedTime || isBooking}
            className="w-full mt-6 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            {isBooking ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Confirmation en cours...
              </div>
            ) : (
              'Confirmer le rendez-vous'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentBooking;
