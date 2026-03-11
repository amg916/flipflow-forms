import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly apiKey: string | undefined;
  private readonly fromEmail: string;

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.get<string>('SENDGRID_API_KEY');
    this.fromEmail = this.config.get<string>('SENDGRID_FROM_EMAIL') || 'noreply@flipflow.io';
  }

  async sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
    const resetUrl = `${this.config.get('CORS_ORIGIN') || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    if (!this.apiKey) {
      // Dev stub - log instead of sending
      this.logger.warn(`[DEV STUB] Password reset email for ${to}`);
      this.logger.warn(`[DEV STUB] Reset URL: ${resetUrl}`);
      return;
    }

    // SendGrid API call
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: this.fromEmail, name: 'FlipFlow' },
        subject: 'Reset Your Password',
        content: [
          {
            type: 'text/html',
            value: `
              <h2>Password Reset</h2>
              <p>Click the link below to reset your password. This link expires in 1 hour.</p>
              <p><a href="${resetUrl}">Reset Password</a></p>
              <p>If you didn't request this, you can safely ignore this email.</p>
            `,
          },
        ],
      }),
    });

    if (!response.ok) {
      this.logger.error(`SendGrid error: ${response.status} ${await response.text()}`);
      throw new Error('Failed to send email');
    }

    this.logger.log(`Password reset email sent to ${to}`);
  }
}
