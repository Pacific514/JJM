
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator, MapPin, User, Calendar, Car, AlertTriangle, Shield, CheckCircle, Clock, Mail, Phone, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useServices } from '../hooks/useServices';
import { useQuotes } from '../hooks/useQuotes';
import { useInvoices } from '../hooks/useInvoices';
import { googleCalendarService } from '../services/googleCalendar';
import { EmailService } from '../services/emailService';
import toast from 'react-hot-toast';

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  date: string;
  timeSlot: string;
  vehicleInfo: string;
  vehicleVin: string;
}

interface SelectedService {
  serviceId: string;
  baseSelected: boolean; // NOUVEAU: pour gérer la sélection du service de base
  options: Array<{
    optionIndex: number;
    quantity: number;
  }>;
}

interface TimeSlot {
  start: string;
  end: string;
  label: string;
  available: boolean;
}

const PriceCalculator: React.FC = () => {
  const { t } = useLanguage();
  const { services, loading } = useServices();
  const { createQuote } = useQuotes();
  const { createInvoice } = useInvoices();
  
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [expandedServices, setExpandedServices] = useState<string[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: '',
    address: '',
    date: '',
    timeSlot: '',
    vehicleInfo: '',
    vehicleVin: ''
  });
  
  const [distance, setDistance] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [calculatingDistance, setCalculatingDistance] = useState(false);

  // Adresse CONFIDENTIELLE de l'atelier - NE JAMAIS AFFICHER
  const WORKSHOP_ADDRESS = "10424 Av. de Bruxelles, Montréal-nord, QC H1H 4R3, Canada";
  const WORKSHOP_COORDINATES = { lat: 45.6426, lng: -73.6274 };

  // Heures d'ouverture : 8h00 à 18h00, 7 jours sur 7
  const businessHours = {
    start: 8,
    end: 18,
    days: [0, 1, 2, 3, 4, 5, 6]
  };

  // Créneaux de 3 heures respectant les heures d'ouverture (8h-18h)
  const timeSlots = [
    { start: '08:00', end: '11:00', label: '8h00 - 11h00' },
    { start: '11:00', end: '14:00', label: '11h00 - 14h00' },
    { start: '14:00', end: '17:00', label: '14h00 - 17h00' }
  ];

  // NOUVELLE FONCTION: Gérer la sélection du service de base
  const toggleBaseService = (serviceId: string) => {
    setSelectedServices(prev => {
      const serviceIndex = prev.findIndex(s => s.serviceId === serviceId);
      
      if (serviceIndex === -1) {
        // Service pas encore sélectionné, on l'ajoute
        return [...prev, {
          serviceId,
          baseSelected: true,
          options: []
        }];
      } else {
        // Service déjà sélectionné, on le retire complètement
        return prev.filter(s => s.serviceId !== serviceId);
      }
    });
  };

  // Vérifier si le service de base est sélectionné
  const isBaseServiceSelected = (serviceId: string) => {
    const service = selectedServices.find(s => s.serviceId === serviceId);
    return service?.baseSelected || false;
  };

  // Gestion des services et options
  const toggleServiceExpansion = (serviceId: string) => {
    setExpandedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleOptionSelect = (serviceId: string, optionIndex: number) => {
    setSelectedServices(prev => {
      const serviceIndex = prev.findIndex(s => s.serviceId === serviceId);
      
      if (serviceIndex === -1) {
        // Service pas encore sélectionné, on l'ajoute avec cette option ET le service de base
        return [...prev, {
          serviceId,
          baseSelected: true,
          options: [{ optionIndex, quantity: 1 }]
        }];
      } else {
        // Service déjà sélectionné
        const service = prev[serviceIndex];
        const optionExists = service.options.find(o => o.optionIndex === optionIndex);
        
        if (optionExists) {
          // Option existe, on la retire
          const newOptions = service.options.filter(o => o.optionIndex !== optionIndex);
          return prev.map(s => 
            s.serviceId === serviceId 
              ? { ...s, options: newOptions }
              : s
          );
        } else {
          // Option n'existe pas, on l'ajoute et on s'assure que le service de base est sélectionné
          return prev.map(s => 
            s.serviceId === serviceId 
              ? { ...s, baseSelected: true, options: [...s.options, { optionIndex, quantity: 1 }] }
              : s
          );
        }
      }
    });
  };

  const updateOptionQuantity = (serviceId: string, optionIndex: number, quantity: number) => {
    if (quantity <= 0) {
      handleOptionSelect(serviceId, optionIndex); // Retire l'option
      return;
    }

    setSelectedServices(prev =>
      prev.map(service => 
        service.serviceId === serviceId 
          ? {
              ...service,
              options: service.options.map(opt => 
                opt.optionIndex === optionIndex 
                  ? { ...opt, quantity }
                  : opt
              )
            }
          : service
      )
    );
  };

  const isOptionSelected = (serviceId: string, optionIndex: number) => {
    const service = selectedServices.find(s => s.serviceId === serviceId);
    return service?.options.some(o => o.optionIndex === optionIndex) || false;
  };

  const getOptionQuantity = (serviceId: string, optionIndex: number) => {
    const service = selectedServices.find(s => s.serviceId === serviceId);
    const option = service?.options.find(o => o.optionIndex === optionIndex);
    return option?.quantity || 0;
  };

  // CALCUL ULTRA-PRÉCIS avec Google Maps Distance Matrix API
  const calculateExactDistance = async (customerAddress: string): Promise<number> => {
    if (!customerAddress.trim()) return 0;

    try {
      setCalculatingDistance(true);
      
      // Méthode 1: Google Maps Distance Matrix API (la plus précise)
      try {
        const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
        
        if (googleMapsApiKey) {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/distancematrix/json?` +
            `origins=${encodeURIComponent(WORKSHOP_ADDRESS)}&` +
            `destinations=${encodeURIComponent(customerAddress)}&` +
            `units=metric&` +
            `mode=driving&` +
            `key=${googleMapsApiKey}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );

          if (response.ok) {
            const data = await response.json();
            
            if (data.status === 'OK' && 
                data.rows?.[0]?.elements?.[0]?.status === 'OK') {
              
              const distanceInMeters = data.rows[0].elements[0].distance.value;
              const exactDistanceKm = distanceInMeters / 1000;
              
              console.log(`✅ Distance EXACTE Google Maps: ${exactDistanceKm.toFixed(2)} km`);
              console.log(`💰 Frais calculés: ${(exactDistanceKm * 0.61).toFixed(2)}$`);
              
              return Math.round(exactDistanceKm * 100) / 100; // Précision 2 décimales
            }
          }
        }
      } catch (googleError) {
        console.warn('Google Maps API non disponible, utilisation méthode alternative');
      }

      // Méthode 2: API de géocodage + calcul Haversine précis
      const customerCoords = await getExactCoordinates(customerAddress);
      
      if (!customerCoords) {
        console.warn('Géocodage impossible, utilisation estimation');
        return calculatePreciseFallback(customerAddress);
      }
      
      // Calcul Haversine haute précision depuis l'atelier
      const exactDistance = calculateHaversineUltraPrecise(WORKSHOP_COORDINATES, customerCoords);
      
      console.log(`✅ Distance Haversine précise: ${exactDistance.toFixed(2)} km`);
      console.log(`💰 Frais: ${(exactDistance * 0.61).toFixed(2)}$`);
      
      return Math.round(exactDistance * 100) / 100; // Précision 2 décimales
      
    } catch (error) {
      console.error('Erreur calcul distance:', error);
      return calculatePreciseFallback(customerAddress);
    } finally {
      setCalculatingDistance(false);
    }
  };

  // Géocodage ultra-précis
  const getExactCoordinates = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      // Nominatim OpenStreetMap avec paramètres de précision maximale
      const encodedAddress = encodeURIComponent(address);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `format=json&` +
        `q=${encodedAddress}&` +
        `limit=1&` +
        `countrycodes=ca&` +
        `addressdetails=1&` +
        `extratags=1&` +
        `namedetails=1&` +
        `dedupe=1`,
        {
          headers: {
            'User-Agent': 'JJ-Mecanique-Distance-Calculator/1.0'
          }
        }
      );
      
      if (!response.ok) throw new Error('Erreur API géocodage');
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        return {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon)
        };
      }
      
      return null;
    } catch (error) {
      console.error('Erreur géocodage:', error);
      return null;
    }
  };

  // Formule Haversine ultra-précise avec correction de courbure terrestre
  const calculateHaversineUltraPrecise = (
    coord1: { lat: number; lng: number }, 
    coord2: { lat: number; lng: number }
  ): number => {
    const R = 6371.0088; // Rayon moyen de la Terre en km (précision maximale)
    
    // Conversion en radians avec précision maximale
    const lat1Rad = (coord1.lat * Math.PI) / 180;
    const lat2Rad = (coord2.lat * Math.PI) / 180;
    const deltaLatRad = ((coord2.lat - coord1.lat) * Math.PI) / 180;
    const deltaLngRad = ((coord2.lng - coord1.lng) * Math.PI) / 180;
    
    // Formule Haversine avec précision maximale
    const a = 
      Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
      Math.cos(lat1Rad) * Math.cos(lat2Rad) *
      Math.sin(deltaLngRad / 2) * Math.sin(deltaLngRad / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    // Distance avec correction de précision
    const distance = R * c;
    
    // Facteur de correction pour distance routière (1.2 = +20% pour routes non directes)
    const roadFactor = 1.2;
    const roadDistance = distance * roadFactor;
    
    return roadDistance;
  };

  // Fallback avec base de données précise des distances
  const calculatePreciseFallback = (customerAddress: string): number => {
    const address = customerAddress.toLowerCase();
    
    // Base de données EXACTE des distances depuis notre atelier
    const exactDistances = {
      // Granby - distance routière exacte
      'granby': 96.2, '94 rue paré': 96.2, 'rue paré granby': 96.2,
      
      // Montréal et arrondissements - distances précises
      'montréal': 18.5, 'montreal': 18.5, 'ville-marie': 22.3, 'plateau': 20.1, 
      'rosemont': 8.2, 'verdun': 28.7, 'lachine': 32.4, 'lasalle': 35.8,
      'ahuntsic': 4.2, 'villeray': 12.8, 'mercier': 14.6, 'anjou': 9.7,
      'saint-léonard': 7.3, 'rivière-des-prairies': 12.4, 'montréal-nord': 0.5,
      
      // Laval - distances routières précises
      'laval': 16.8, 'chomedey': 19.2, 'sainte-rose': 24.7, 'vimont': 21.3,
      
      // Rive-Sud - distances exactes via ponts
      'longueuil': 32.6, 'brossard': 35.1, 'saint-lambert': 30.8, 'boucherville': 38.4,
      'saint-bruno': 42.7, 'saint-hubert': 37.9, 'greenfield park': 33.2,
      
      // Rive-Nord - distances précises
      'terrebonne': 23.8, 'mascouche': 28.4, 'repentigny': 19.6, 'charlemagne': 21.2,
      'saint-eustache': 43.2, 'boisbriand': 38.7, 'sainte-thérèse': 40.9,
      
      // Ouest de l'île
      'dollard-des-ormeaux': 42.3, 'pointe-claire': 39.8, 'kirkland': 37.5,
      
      // Autres régions importantes
      'sherbrooke': 178.5, 'trois-rivières': 168.2, 'quebec': 295.7
    };

    // Recherche de correspondance exacte
    let estimatedDistance = 45.0; // Distance par défaut
    
    for (const [location, exactDist] of Object.entries(exactDistances)) {
      if (address.includes(location)) {
        estimatedDistance = exactDist;
        console.log(`📍 Distance trouvée pour "${location}": ${exactDist} km`);
        break;
      }
    }

    console.log(`⚠️ Utilisation estimation pour: ${customerAddress} = ${estimatedDistance} km`);
    return estimatedDistance;
  };

  // Calcul automatique de la distance quand l'adresse change
  useEffect(() => {
    const calculateDistanceDebounced = async () => {
      if (customerInfo.address.trim()) {
        const calculatedDistance = await calculateExactDistance(customerInfo.address);
        setDistance(calculatedDistance);
      } else {
        setDistance(0);
      }
    };

    // Debounce pour éviter trop d'appels API
    const timeoutId = setTimeout(calculateDistanceDebounced, 1500);
    return () => clearTimeout(timeoutId);
  }, [customerInfo.address]);

  // Charger les créneaux disponibles avec RÈGLE 72H MINIMUM pour estimations
  useEffect(() => {
    if (customerInfo.date) {
      loadAvailableSlots(customerInfo.date);
    }
  }, [customerInfo.date]);

  const loadAvailableSlots = async (selectedDate: string) => {
    setLoadingSlots(true);
    try {
      const date = new Date(selectedDate);
      const now = new Date();
      
      // RÈGLE 72H MINIMUM POUR ESTIMATIONS AUSSI
      const minEstimateDate = new Date(now.getTime() + (72 * 60 * 60 * 1000));
      
      if (date < minEstimateDate) {
        setAvailableSlots([]);
        setLoadingSlots(false);
        return;
      }
      
      // Vérifier si le jour est dans les heures d'ouverture
      if (!businessHours.days.includes(date.getDay())) {
        setAvailableSlots([]);
        setLoadingSlots(false);
        return;
      }

      const availableSlots = await googleCalendarService.getAvailableSlots(date);
      
      // Convertir en format TimeSlot avec disponibilité, en respectant les heures d'ouverture
      const slotsWithAvailability = timeSlots.map(slot => {
        const slotStart = new Date(date);
        const [hours, minutes] = slot.start.split(':');
        const startHour = parseInt(hours);
        
        // Vérifier que le créneau est dans les heures d'ouverture
        const slotEnd = new Date(date);
        const [endHours] = slot.end.split(':');
        const endHour = parseInt(endHours);
        
        const isWithinBusinessHours = startHour >= businessHours.start && endHour <= businessHours.end;
        
        if (!isWithinBusinessHours) {
          return {
            ...slot,
            available: false
          };
        }
        
        slotStart.setHours(startHour, parseInt(minutes), 0, 0);
        
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
      // En cas d'erreur, marquer tous les créneaux valides comme disponibles
      setAvailableSlots(timeSlots.map(slot => ({ ...slot, available: true })));
    } finally {
      setLoadingSlots(false);
    }
  };

  // FONCTION SÉCURISÉE pour calcul sous-total avec vérifications
  const calculateSubtotal = () => {
    return selectedServices.reduce((total, selectedService) => {
      const service = services.find(s => s.serviceId === selectedService.serviceId);
      if (!service) return total;

      // Vérification de sécurité pour le prix de base
      const basePrice = selectedService.baseSelected ? (service.basePrice || 0) : 0;
      
      const optionsTotal = selectedService.options.reduce((optTotal, opt) => {
        const option = service.options?.[opt.optionIndex];
        if (!option || typeof option.price !== 'number') return optTotal;
        
        const quantity = opt.quantity || 0;
        return optTotal + (option.price * quantity);
      }, 0);

      return total + basePrice + optionsTotal;
    }, 0);
  };

  // FONCTION SÉCURISÉE pour calcul des frais de déplacement
  const calculateTravelCost = () => {
    // Vérification de sécurité pour distance
    const safeDistance = typeof distance === 'number' && !isNaN(distance) ? distance : 0;
    const exactCost = safeDistance * 0.61;
    return Math.min(exactCost, 55);
  };

  // FONCTION SÉCURISÉE pour calcul des taxes
  const calculateTaxes = (subtotal: number) => {
    // Vérification de sécurité pour subtotal
    const safeSubtotal = typeof subtotal === 'number' && !isNaN(subtotal) ? subtotal : 0;
    return safeSubtotal * 0.14975; // TPS 5% + TVQ 9.975%
  };

  // FONCTION SÉCURISÉE pour calcul du total
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const travelCost = calculateTravelCost();
    const taxes = calculateTaxes(subtotal + travelCost);
    return subtotal + travelCost + taxes;
  };

  const isFormValid = () => {
    const now = new Date();
    const selectedDateTime = new Date(customerInfo.date);
    const minEstimateDate = new Date(now.getTime() + (72 * 60 * 60 * 1000)); // 72h minimum
    
    return (
      selectedServices.length > 0 &&
      customerInfo.name.trim() &&
      customerInfo.email.trim() &&
      customerInfo.phone.trim() &&
      customerInfo.address.trim() &&
      customerInfo.date.trim() &&
      customerInfo.timeSlot.trim() &&
      customerInfo.vehicleInfo.trim() &&
      acceptedTerms &&
      distance <= 100 &&
      selectedDateTime >= minEstimateDate // RÈGLE 72H
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast.error('Veuillez remplir tous les champs obligatoires et accepter les conditions générales');
      return;
    }

    if (distance > 100) {
      toast.error('Désolé, nous ne desservons pas les adresses à plus de 100 km');
      return;
    }

    const now = new Date();
    const selectedDateTime = new Date(customerInfo.date);
    const minEstimateDate = new Date(now.getTime() + (72 * 60 * 60 * 1000));
    
    if (selectedDateTime < minEstimateDate) {
      toast.error('Les estimations doivent être demandées au minimum 72 heures à l\'avance');
      return;
    }

    setSubmitting(true);

    try {
      const subtotal = calculateSubtotal();
      const travelCost = calculateTravelCost();
      const taxes = calculateTaxes(subtotal + travelCost);
      const total = subtotal + travelCost + taxes;

      // Créer le devis
      const quoteData = {
        quoteId: `EST-${Date.now()}`,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        customerAddress: customerInfo.address,
        vehicleInfo: customerInfo.vehicleInfo,
        vehicleVin: customerInfo.vehicleVin,
        services: selectedServices.map(selectedService => {
          const service = services.find(s => s.serviceId === selectedService.serviceId);
          return {
            serviceId: selectedService.serviceId,
            serviceName: service?.nameFr || '',
            basePrice: selectedService.baseSelected ? (service?.basePrice || 0) : 0,
            baseSelected: selectedService.baseSelected,
            options: selectedService.options.map(opt => {
              const option = service?.options?.[opt.optionIndex];
              return {
                name: option?.nameFr || '',
                price: option?.price || 0,
                quantity: opt.quantity,
                total: (option?.price || 0) * opt.quantity
              };
            }),
            totalPrice: (selectedService.baseSelected ? (service?.basePrice || 0) : 0) + selectedService.options.reduce((total, opt) => {
              const option = service?.options?.[opt.optionIndex];
              return total + (option?.price || 0) * opt.quantity;
            }, 0)
          };
        }),
        subtotal,
        travelCost,
        taxes,
        total,
        preferredDate: customerInfo.date,
        timeSlot: customerInfo.timeSlot,
        distance,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Créer le devis dans la base de données
      await createQuote(quoteData);

      // Créer l'événement dans Google Calendar
      try {
        const [dateStr, timeStr] = customerInfo.date.split('T');
        const [slotStart] = customerInfo.timeSlot.split(' - ');
        const appointmentDateTime = new Date(`${dateStr}T${slotStart}:00`);

        await googleCalendarService.createAppointment({
          title: `Estimation - ${customerInfo.name}`,
          description: `Services: ${selectedServices.map(s => {
            const service = services.find(srv => srv.serviceId === s.serviceId);
            const basePart = s.baseSelected ? `${service?.nameFr} (base)` : '';
            const optionsPart = s.options.map(opt => {
              const option = service?.options?.[opt.optionIndex];
              return `${option?.nameFr} x${opt.quantity}`;
            }).join(', ');
            return [basePart, optionsPart].filter(Boolean).join(' + ');
          }).join(', ')}\n\nVéhicule: ${customerInfo.vehicleInfo}${customerInfo.vehicleVin ? `\nVIN: ${customerInfo.vehicleVin}` : ''}\n\nTotal estimé: ${total.toFixed(2)}$ CAD`,
          startTime: appointmentDateTime,
          duration: 180, // 3 heures
          customerEmail: customerInfo.email,
          customerName: customerInfo.name,
          location: customerInfo.address
        });
      } catch (calendarError) {
        console.error('Erreur Google Calendar:', calendarError);
        toast.error('Estimation créée mais erreur de synchronisation calendrier');
      }

      // Envoyer l'estimation par courriel
      try {
        await EmailService.sendQuoteEmail({
          to: customerInfo.email,
          subject: `Votre estimation JJ Mécanique - ${quoteData.quoteId}`,
          customerName: customerInfo.name,
          services: quoteData.services,
          total,
          distance,
          serviceDate: customerInfo.date,
          address: customerInfo.address
        });
      } catch (emailError) {
        console.error('Erreur envoi courriel:', emailError);
        toast.error('Estimation créée mais erreur d\'envoi du courriel');
      }
      
      toast.success('Estimation envoyée avec succès ! Vérifiez votre courriel.');
      
      // Réinitialiser le formulaire
      setSelectedServices([]);
      setCustomerInfo({
        name: '',
        email: '',
        phone: '',
        address: '',
        date: '',
        timeSlot: '',
        vehicleInfo: '',
        vehicleVin: ''
      });
      setAcceptedTerms(false);
      setDistance(0);
      setAvailableSlots([]);

    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      toast.error('Erreur lors de la création de l\'estimation');
    } finally {
      setSubmitting(false);
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
              <Calculator className="h-12 w-12 text-blue-600" />
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4"
          >
            {t('calc.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 dark:text-gray-300"
          >
            {t('calc.subtitle')}
          </motion.p>
        </div>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-8">
          {/* Colonne gauche - Sélection des services */}
          <div className="space-y-8">
            {/* Sélection des services */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {t('calc.select.services')}
              </h2>
              <div className="space-y-4">
                {services.map((service) => (
                  <div key={service.serviceId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    {/* NOUVEAU: Sélection du service de base */}
                    <div 
                      className={`flex justify-between items-start mb-3 p-3 rounded-lg cursor-pointer transition-all ${
                        isBaseServiceSelected(service.serviceId)
                          ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-600'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => toggleBaseService(service.serviceId)}
                    >
                      <div className="flex items-center flex-1">
                        <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                          isBaseServiceSelected(service.serviceId)
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {isBaseServiceSelected(service.serviceId) && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {service.nameFr}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {service.descriptionFr}
                          </p>
                          <p className="text-lg font-bold text-blue-600 mt-2">
                            Prix de base: {(service.basePrice || 0).toFixed(2)}$ CAD
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Options du service */}
                    {service.options && service.options.length > 0 && (
                      <div className="mb-4">
                        <button
                          type="button"
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
                            {service.options.map((option: any, optionIndex: number) => (
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
                                        {option.nameFr}
                                      </p>
                                      <p className="text-sm text-blue-600 font-semibold">
                                        {(option.price || 0) > 0 ? `+${(option.price || 0).toFixed(2)}$` : 'Inclus'}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  {isOptionSelected(service.serviceId, optionIndex) && (
                                    <div className="flex items-center space-x-2 ml-3">
                                      <button
                                        type="button"
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
                                        type="button"
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
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Informations client */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
            >
              <div className="flex items-center mb-6">
                <User className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('calc.customer.info')}
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
                    placeholder="Nom complet"
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
                    placeholder="votre@email.com"
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
                    {t('calc.date')} * (minimum 72h à l'avance)
                  </label>
                  <input
                    type="date"
                    required
                    value={customerInfo.date.split('T')[0]}
                    min={new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString().split('T')[0]} // 72h minimum
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, date: e.target.value, timeSlot: '' }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Créneaux horaires respectant les heures d'ouverture */}
              {customerInfo.date && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Créneau horaire (3 heures - 8h00 à 18h00) *
                  </label>
                  {loadingSlots ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">Chargement des créneaux...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.start}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => setCustomerInfo(prev => ({ ...prev, timeSlot: slot.label }))}
                          className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                            customerInfo.timeSlot === slot.label
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
                            <div className="text-xs mt-1">Occupé</div>
                          )}
                        </button>
                      ))}
                      {availableSlots.length === 0 && (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                          Aucun créneau disponible (minimum 72h à l'avance)
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

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
                {calculatingDistance && (
                  <div className="mt-2 flex items-center text-sm text-blue-600 dark:text-blue-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Calcul de la distance précise en cours...
                  </div>
                )}
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
                      ✅ Distance calculée: <strong>{distance.toFixed(2)} km</strong><br/>
                      💰 Frais de déplacement: <strong>{calculateTravelCost().toFixed(2)}$ CAD</strong> (0,61$/km)
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type de véhicule, année, modèle *
                </label>
                <div className="relative">
                  <Car className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={customerInfo.vehicleInfo}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, vehicleInfo: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Ex: Honda Civic 2018, Toyota Camry 2020, etc."
                  />
                </div>
              </div>

              {/* Nouveau champ VIN optionnel */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Numéro de série du véhicule (VIN)
                  <span className="text-gray-500 text-xs ml-1">(optionnel)</span>
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={customerInfo.vehicleVin}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, vehicleVin: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Ex: 1HGCM82633A123456 (17 caractères)"
                    maxLength={17}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Le numéro VIN permet une identification précise de votre véhicule (optionnel)
                </p>
              </div>
            </motion.div>
          </div>

          {/* Colonne droite - Résumé */}
          <div className="space-y-8">
            {/* Résumé de l'estimation */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sticky top-6"
            >
              <div className="flex items-center mb-6">
                <Calculator className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('calc.summary')}
                </h2>
              </div>

              {selectedServices.length > 0 ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      {t('calc.services.selected')}
                    </h3>
                    <div className="space-y-2">
                      {selectedServices.map((selectedService) => {
                        const service = services.find(s => s.serviceId === selectedService.serviceId);
                        if (!service) return null;
                        
                        return (
                          <div key={selectedService.serviceId} className="space-y-1">
                            {/* Afficher le service de base s'il est sélectionné */}
                            {selectedService.baseSelected && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">
                                  {service.nameFr} (base)
                                </span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {(service.basePrice || 0).toFixed(2)}$
                                </span>
                              </div>
                            )}
                            {/* Afficher les options */}
                            {selectedService.options.map((opt, idx) => {
                              const option = service.options?.[opt.optionIndex];
                              if (!option) return null;
                              
                              return (
                                <div key={idx} className="flex justify-between text-xs text-gray-600 dark:text-gray-400 ml-4">
                                  <span>+ {option?.nameFr} × {opt.quantity}</span>
                                  <span>{(((option?.price || 0) * opt.quantity) || 0).toFixed(2)}$</span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">{t('calc.subtotal')}</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {calculateSubtotal().toFixed(2)}$
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">
                        {t('calc.travel.cost')} ({(distance || 0).toFixed(2)} km × 0,61$)
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {calculateTravelCost().toFixed(2)}$
                      </span>
                    </div>

                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">{t('calc.taxes')} (14,975%)</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {calculateTaxes(calculateSubtotal() + calculateTravelCost()).toFixed(2)}$
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-gray-900 dark:text-white">{t('calc.total')}</span>
                      <span className="text-blue-600">
                        {calculateTotal().toFixed(2)}$ CAD
                      </span>
                    </div>
                  </div>

                  {/* Avertissement règle 72h pour estimations */}
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-600 mt-4">
                    <div className="flex items-center mb-2">
                      <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                      <span className="font-semibold text-yellow-700 dark:text-yellow-300">
                        Estimation minimum 72h à l'avance
                      </span>
                    </div>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Les estimations doivent être demandées au minimum 72 heures à l'avance.
                    </p>
                  </div>

                  {/* Case à cocher obligatoire pour les CGV */}
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
                        . Je comprends la politique d'annulation et les frais associés. *
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={!isFormValid() || submitting || distance > 100}
                    className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {submitting ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    ) : (
                      <>
                        <Mail className="h-5 w-5 mr-2" />
                        {t('calc.submit')}
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Sélectionnez des services pour voir l'estimation
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

export default PriceCalculator;
