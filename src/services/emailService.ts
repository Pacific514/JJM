
// Service d'envoi d'emails pour JJ Mécanique
export class EmailService {
  private static apiUrl = 'https://api.emailjs.com/api/v1.0/email/send';
  private static serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID || '';
  private static publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY || '';

  // Envoyer un devis par email
  static async sendQuoteEmail(emailData: {
    to: string;
    subject: string;
    customerName: string;
    services: any[];
    total: number;
    distance: number;
    serviceDate: string;
    address: string;
  }) {
    const templateParams = {
      to_email: emailData.to,
      to_name: emailData.customerName,
      subject: emailData.subject,
      customer_name: emailData.customerName,
      services_list: emailData.services.map(s => 
        `${s.serviceName} x${s.quantity} - ${s.totalPrice.toFixed(2)}$`
      ).join('\n'),
      total_amount: emailData.total.toFixed(2),
      distance: emailData.distance.toFixed(2),
      service_date: new Date(emailData.serviceDate).toLocaleDateString('fr-CA'),
      service_address: emailData.address,
      company_name: 'JJ Mécanique',
      company_phone: '(514) 555-0123',
      company_email: 'info@jjmecanique.ca'
    };

    return this.sendEmail('quote_template', templateParams);
  }

  // Envoyer une confirmation de réservation
  static async sendBookingConfirmationEmail(emailData: {
    to: string;
    subject: string;
    customerName: string;
    services: any[];
    total: number;
    serviceDate: string;
    timeSlot: string;
    address: string;
    partsOption: any;
    invoiceId: string;
  }) {
    const templateParams = {
      to_email: emailData.to,
      to_name: emailData.customerName,
      subject: emailData.subject,
      customer_name: emailData.customerName,
      invoice_id: emailData.invoiceId,
      services_list: emailData.services.map(s => 
        `${s.serviceName} x${s.quantity} - ${s.totalPrice.toFixed(2)}$`
      ).join('\n'),
      total_amount: emailData.total.toFixed(2),
      service_date: new Date(emailData.serviceDate).toLocaleDateString('fr-CA'),
      time_slot: emailData.timeSlot,
      service_address: emailData.address,
      parts_option: emailData.partsOption.label,
      parts_warranty: emailData.partsOption.warrantyNote,
      next_steps: emailData.partsOption.type === 'search' 
        ? 'Un agent du service clientèle vous contactera sous 2 heures pour confirmer le prix des pièces.'
        : 'Votre réservation est confirmée. Nous vous contacterons 24h avant le rendez-vous.',
      company_name: 'JJ Mécanique',
      company_phone: '(514) 555-0123',
      company_email: 'info@jjmecanique.ca',
      client_portal_url: `${window.location.origin}/client-portal`
    };

    return this.sendEmail('booking_confirmation_template', templateParams);
  }

  // Envoyer une facture pour les pièces
  static async sendPartsInvoiceEmail(emailData: {
    to: string;
    subject: string;
    customerName: string;
    originalBookingId: string;
    partsDetails: any[];
    partsTotal: number;
    paymentUrl: string;
  }) {
    const templateParams = {
      to_email: emailData.to,
      to_name: emailData.customerName,
      subject: emailData.subject,
      customer_name: emailData.customerName,
      original_booking_id: emailData.originalBookingId,
      parts_list: emailData.partsDetails.map(p => 
        `${p.name} - ${p.price.toFixed(2)}$`
      ).join('\n'),
      parts_total: emailData.partsTotal.toFixed(2),
      payment_url: emailData.paymentUrl,
      company_name: 'JJ Mécanique',
      company_phone: '(514) 555-0123',
      company_email: 'info@jjmecanique.ca'
    };

    return this.sendEmail('parts_invoice_template', templateParams);
  }

  // Envoyer une notification de remboursement
  static async sendRefundNotificationEmail(emailData: {
    to: string;
    subject: string;
    customerName: string;
    refundAmount: number;
    refundReason: string;
    originalBookingId: string;
  }) {
    const templateParams = {
      to_email: emailData.to,
      to_name: emailData.customerName,
      subject: emailData.subject,
      customer_name: emailData.customerName,
      refund_amount: emailData.refundAmount.toFixed(2),
      refund_reason: emailData.refundReason,
      original_booking_id: emailData.originalBookingId,
      processing_time: '3-5 jours ouvrables',
      company_name: 'JJ Mécanique',
      company_phone: '(514) 555-0123',
      company_email: 'info@jjmecanique.ca'
    };

    return this.sendEmail('refund_notification_template', templateParams);
  }

  // Méthode générique d'envoi d'email
  private static async sendEmail(templateId: string, templateParams: any) {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: this.serviceId,
          template_id: templateId,
          user_id: this.publicKey,
          template_params: templateParams
        })
      });

      if (!response.ok) {
        throw new Error(`Email API error: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Erreur envoi email:', error);
      throw error;
    }
  }

  // Envoyer un email de contact du formulaire
  static async sendContactEmail(contactData: {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
  }) {
    const templateParams = {
      from_name: contactData.name,
      from_email: contactData.email,
      from_phone: contactData.phone,
      subject: contactData.subject,
      message: contactData.message,
      to_email: 'info@jjmecanique.ca',
      company_name: 'JJ Mécanique'
    };

    return this.sendEmail('contact_form_template', templateParams);
  }
}
