
import { useState, useEffect } from 'react';
import { lumi } from '../lib/lumi';
import toast from 'react-hot-toast';

interface Service {
  _id: string;
  serviceId: string;
  categoryFr: string;
  categoryEn: string;
  nameFr: string;
  nameEn: string;
  descriptionFr: string;
  descriptionEn: string;
  basePrice: number;
  pricePerKm: number;
  duration: number;
  isActive: boolean;
  imageUrl: string;
}

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { list } = await lumi.entities.services.list();
      const activeServices = list.filter((service: Service) => service.isActive);
      setServices(activeServices);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des services:', err);
      setError('Impossible de charger les services');
      toast.error('Erreur lors du chargement des services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const getServicesByCategory = (category: string, language: 'fr' | 'en') => {
    const categoryKey = language === 'fr' ? 'categoryFr' : 'categoryEn';
    return services.filter(service => service[categoryKey] === category);
  };

  const getServiceById = (serviceId: string) => {
    return services.find(service => service.serviceId === serviceId);
  };

  return {
    services,
    loading,
    error,
    fetchServices,
    getServicesByCategory,
    getServiceById
  };
};
