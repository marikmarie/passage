// Email Service Integration
export interface EmailRequest {
  to: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  cc?: string[];
  bcc?: string[];
}

export interface EmailResponse {
  success: boolean;
  messageId: string;
  status: string;
}

export class MailerService {
  private apiKey: string = process.env.MAILER_API_KEY || '';
  private fromEmail: string = process.env.MAILER_FROM_EMAIL || 'noreply@passage.local';

  async sendEmail(request: EmailRequest): Promise<EmailResponse> {
    try {
      // Mock email service for now
      console.log(`📧 Email sent to ${request.to}:`, {
        subject: request.subject,
      });

      return {
        success: true,
        messageId: `EMAIL_${Date.now()}`,
        status: 'sent',
      };
    } catch (error) {
      console.error('❌ Mailer Service Error:', error);
      throw error;
    }
  }

  async sendBulkEmail(recipients: string[], subject: string, htmlBody: string): Promise<EmailResponse[]> {
    try {
      return Promise.all(
        recipients.map(to =>
          this.sendEmail({
            to,
            subject,
            htmlBody,
          })
        )
      );
    } catch (error) {
      console.error('❌ Bulk Email Service Error:', error);
      throw error;
    }
  }
}

export const mailerService = new MailerService();
