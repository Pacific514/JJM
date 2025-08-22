
import { useState } from 'react';
import { lumi } from '../lib/lumi';
import toast from 'react-hot-toast';

interface QuoteService {
  serviceId: string;
  serviceName: string;
  price: number;
}

interface QuoteData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  selectedServices: QuoteService[];
  distance: number;
  preferredDate: string;
  notes: string;
  language: 'fr' | 'en';
}

export const useQuotes = () => {
  const [loading, setLoading] = useState(false);

  const calculateQuote = (services: QuoteService[], distance: number) => {
    const subtotal = services.reduce((sum, service) => sum + service.price, 0);
    const travelCost = distance * 1.5; // 1.50$ par km
    const servicesTotal = subtotal + travelCost;
    const taxes = servicesTotal * 0.15; // 15% taxes
    const total = servicesTotal + taxes;

    return {
      subtotal,
      travelCost,
      taxes: Math.round(taxes * 100) / 100,
      total: Math.round(total * 100) / 100
    };
  };

  const createQuote = async (quoteData: QuoteData) => {
    try {
      setLoading(true);
      
      const calculation = calculateQuote(quoteData.selectedServices, quoteData.distance);
      
      const quote = {
        quoteId: `QUO-${Date.now()}`,
        customerName: quoteData.customerName,
        customerEmail: quoteData.customerEmail,
        customerPhone: quoteData.customerPhone,
        customerAddress: quoteData.customerAddress,
        selectedServices: quoteData.selectedServices,
        distance: quoteData.distance,
        travelCost: calculation.travelCost,
        subtotal: calculation.subtotal + calculation.travelCost,
        taxes: calculation.taxes,
        totalPrice: calculation.total,
        preferredDate: quoteData.preferredDate,
        notes: quoteData.notes,
        status: 'pending',
        language: quoteData.language,
        creator: 'customer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await lumi.entities.quotes.create(quote);
      
      toast.success(quoteData.language === 'fr' ? 'Devis envoyé avec succès!' : 'Quote sent successfully!');
      return quote;
    } catch (error) {
      console.error('Erreur lors de la création du devis:', error);
      toast.error(quoteData.language === 'fr' ? 'Erreur lors de l\'envoi du devis' : 'Error sending quote');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    calculateQuote,
    createQuote
  };
};
