// Collecto Payment & SMS Service Integration
// API Reference: https://collecto.cissytech.com/api/{username}/{method}

export interface RequestToPayRequest {
  paymentOption: 'mobilemoney';
  phone: string;
  amount: number;
  reference: string;
}

export interface RequestToPayResponse {
  success: boolean;
  transactionId: string;
  status: string;
  message?: string;
}

export interface RequestToPayStatusRequest {
  transactionId: string;
}

export interface PaymentStatusResponse {
  status: 'successful' | 'pending' | 'failed';
  transactionId: string;
  message?: string;
}

export interface SendSMSRequest {
  phone: string;
  message: string;
  reference: string;
}

export interface SendSMSResponse {
  success: boolean;
  transactionId: string;
  status: string;
  message?: string;
}

export interface VerifyPhoneNumberRequest {
  phone: string;
}

export interface VerifyPhoneNumberResponse {
  valid: boolean;
  registeredName?: string;
  phone: string;
  provider?: 'MTN' | 'Airtel';
  message?: string;
}

export class CollectoService {
  private apiKey: string = process.env.COLLECTO_API_KEY || '';
  private username: string = process.env.COLLECTO_USERNAME || '';
  private baseUrl: string = 'https://collecto.cissytech.com/api';

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
    };
  }

  /**
   * Request payment from a mobile money account
   */
  async requestToPay(request: RequestToPayRequest): Promise<RequestToPayResponse> {
    try {
      const url = `${this.baseUrl}/${this.username}/requestToPay`;
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Collecto API error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Collecto RequestToPay Response:', data);
      return {
        success: true,
        transactionId: data.transactionId || data.id,
        status: data.status || 'pending',
        message: data.message,
      };
    } catch (error) {
      console.error('❌ Collecto RequestToPay Error:', error);
      throw error;
    }
  }

  /**
   * Check the status of a payment request
   */
  async requestToPayStatus(request: RequestToPayStatusRequest): Promise<PaymentStatusResponse> {
    try {
      const url = `${this.baseUrl}/${this.username}/requestToPayStatus`;
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Collecto API error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        status: data.status || 'pending',
        transactionId: request.transactionId,
        message: data.message,
      };
    } catch (error) {
      console.error('❌ Collecto Payment Status Error:', error);
      throw error;
    }
  }

   /**
   * Verify phone number registration status on mobile money
   */
  async verifyPhoneNumber(request: VerifyPhoneNumberRequest): Promise<VerifyPhoneNumberResponse> {
    try {
      const url = `${this.baseUrl}/${this.username}/verifyPhoneNumber`;
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Collecto API error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        valid: data.valid || false,
        registeredName: data.registeredName,
        phone: request.phone,
        provider: data.provider,
        message: data.message,
      };
    } catch (error) {
      console.error('❌ Collecto Phone Verification Error:', error);
      throw error;
    }
  }
  
  /**
   * Send a single SMS message
   */
  async sendSingleSMS(request: SendSMSRequest): Promise<SendSMSResponse> {
    try {
      const url = `${this.baseUrl}/${this.username}/sendSingleSMS`;
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Collecto API error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        transactionId: data.transactionId || data.id,
        status: data.status || 'sent',
        message: data.message,
      };
    } catch (error) {
      console.error('❌ Collecto SMS Error:', error);
      throw error;
    }
  }

 
}

export const collectoService = new CollectoService();
