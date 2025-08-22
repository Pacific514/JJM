
interface SquarePaymentRequest {
  amount: number; // en cents
  currency: string;
  sourceId: string; // Token de la carte
  customerEmail: string;
  customerName: string;
  orderId?: string;
  description?: string;
}

interface SquarePaymentResponse {
  success: boolean;
  paymentId?: string;
  receiptUrl?: string;
  error?: string;
}

class SquarePaymentService {
  private applicationId: string = process.env.VITE_SQUARE_APPLICATION_ID || '';
  private accessToken: string = process.env.VITE_SQUARE_ACCESS_TOKEN || '';
  private environment: 'sandbox' | 'production' = 'sandbox';

  private getBaseUrl(): string {
    return this.environment === 'sandbox' 
      ? 'https://connect.squareupsandbox.com'
      : 'https://connect.squareup.com';
  }

  // Initialiser le SDK Square Web Payments
  async initializePaymentForm(containerId: string, amount: number): Promise<any> {
    // Chargement dynamique du SDK Square
    if (!window.Square) {
      await this.loadSquareSDK();
    }

    const payments = window.Square.payments(this.applicationId, 'sandbox');
    
    const card = await payments.card();
    await card.attach(`#${containerId}`);

    return {
      card,
      payments,
      tokenize: async () => {
        const result = await card.tokenize();
        if (result.status === 'OK') {
          return result.token;
        } else {
          throw new Error(result.errors?.[0]?.message || 'Erreur de tokenisation');
        }
      }
    };
  }

  // Traiter un paiement
  async processPayment(paymentData: SquarePaymentRequest): Promise<SquarePaymentResponse> {
    try {
      const response = await fetch(`${this.getBaseUrl()}/v2/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'Square-Version': '2023-10-18'
        },
        body: JSON.stringify({
          source_id: paymentData.sourceId,
          amount_money: {
            amount: paymentData.amount,
            currency: paymentData.currency
          },
          buyer_email_address: paymentData.customerEmail,
          note: paymentData.description,
          order_id: paymentData.orderId,
          autocomplete: true
        })
      });

      const result = await response.json();

      if (response.ok && result.payment) {
        return {
          success: true,
          paymentId: result.payment.id,
          receiptUrl: result.payment.receipt_url
        };
      } else {
        return {
          success: false,
          error: result.errors?.[0]?.detail || 'Erreur de paiement'
        };
      }
    } catch (error) {
      console.error('Erreur traitement paiement Square:', error);
      return {
        success: false,
        error: 'Erreur de connexion au service de paiement'
      };
    }
  }

  // Rembourser un paiement
  async refundPayment(paymentId: string, amount?: number): Promise<SquarePaymentResponse> {
    try {
      const response = await fetch(`${this.getBaseUrl()}/v2/refunds`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'Square-Version': '2023-10-18'
        },
        body: JSON.stringify({
          payment_id: paymentId,
          amount_money: amount ? {
            amount: amount,
            currency: 'CAD'
          } : undefined,
          reason: 'Remboursement demandé par le client'
        })
      });

      const result = await response.json();

      if (response.ok && result.refund) {
        return {
          success: true,
          paymentId: result.refund.id
        };
      } else {
        return {
          success: false,
          error: result.errors?.[0]?.detail || 'Erreur de remboursement'
        };
      }
    } catch (error) {
      console.error('Erreur remboursement Square:', error);
      return {
        success: false,
        error: 'Erreur lors du remboursement'
      };
    }
  }

  private async loadSquareSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://sandbox.web.squarecdn.com/v1/square.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Impossible de charger Square SDK'));
      document.head.appendChild(script);
    });
  }
}

// Déclaration globale pour TypeScript
declare global {
  interface Window {
    Square: any;
  }
}

export const squarePaymentService = new SquarePaymentService();
