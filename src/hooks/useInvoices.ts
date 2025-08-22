
import { useState, useEffect } from 'react';
import { lumi } from '../lib/lumi';
import toast from 'react-hot-toast';

interface Invoice {
  _id: string;
  invoiceId: string;
  invoiceNumber: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  serviceAddress: string;
  serviceName: string;
  services: any[];
  distance: number;
  subtotal: number;
  taxes: number;
  totalAmount: number;
  status: 'paid' | 'pending' | 'cancelled' | 'refunded';
  paymentMethod?: string;
  serviceDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const { list } = await lumi.entities.invoices.list();
      setInvoices(list);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des factures:', err);
      setError('Impossible de charger les factures');
      toast.error('Erreur lors du chargement des factures');
    } finally {
      setLoading(false);
    }
  };

  const searchInvoices = async (query: string): Promise<Invoice[]> => {
    try {
      setLoading(true);
      const { list } = await lumi.entities.invoices.list();
      
      const results = list.filter((invoice: Invoice) => 
        invoice.customerEmail?.toLowerCase().includes(query.toLowerCase()) ||
        invoice.customerPhone?.includes(query) ||
        invoice.invoiceNumber?.toLowerCase().includes(query.toLowerCase()) ||
        invoice.invoiceId?.toLowerCase().includes(query.toLowerCase())
      );
      
      setError(null);
      return results;
    } catch (err) {
      console.error('Erreur lors de la recherche des factures:', err);
      setError('Impossible de trouver les factures');
      toast.error('Erreur lors de la recherche des factures');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getInvoicesByEmail = async (email: string): Promise<Invoice[]> => {
    try {
      setLoading(true);
      const { list } = await lumi.entities.invoices.list();
      const customerInvoices = list.filter((invoice: Invoice) => 
        invoice.customerEmail?.toLowerCase() === email.toLowerCase()
      );
      setError(null);
      return customerInvoices;
    } catch (err) {
      console.error('Erreur lors de la recherche des factures:', err);
      setError('Impossible de trouver les factures');
      toast.error('Erreur lors de la recherche des factures');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createInvoice = async (invoiceData: Omit<Invoice, '_id' | 'createdAt' | 'updatedAt'>): Promise<Invoice | null> => {
    try {
      const newInvoice = await lumi.entities.invoices.create({
        ...invoiceData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      await fetchInvoices(); // Refresh list
      toast.success('Facture créée avec succès');
      return newInvoice;
    } catch (err) {
      console.error('Erreur lors de la création de la facture:', err);
      toast.error('Erreur lors de la création de la facture');
      return null;
    }
  };

  const updateInvoiceStatus = async (invoiceId: string, status: Invoice['status']): Promise<boolean> => {
    try {
      await lumi.entities.invoices.update(invoiceId, {
        status,
        updatedAt: new Date().toISOString()
      });
      
      await fetchInvoices(); // Refresh list
      toast.success('Statut de la facture mis à jour');
      return true;
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      toast.error('Erreur lors de la mise à jour du statut');
      return false;
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return {
    invoices,
    loading,
    error,
    fetchInvoices,
    searchInvoices,
    getInvoicesByEmail,
    createInvoice,
    updateInvoiceStatus
  };
};
