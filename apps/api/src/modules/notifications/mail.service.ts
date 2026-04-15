import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private resend: Resend;
  private fromEmail = 'VetClinic Pro <onboarding@resend.dev>';

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    
    if (!apiKey) {
      this.logger.warn('⚠️ RESEND_API_KEY no encontrada. Los correos no se enviarán.');
      return;
    }

    try {
      this.resend = new Resend(apiKey);
      this.logger.log('✅ Resend configurado correctamente');
    } catch (error) {
      this.logger.error('❌ Error al inicializar Resend:', error);
    }
  }

  async sendAppointmentReminder(to: string, clientName: string, date: string, petName: string) {
    if (!this.resend) return;

    const content = `
      <p>Hola <strong>${clientName}</strong>,</p>
      <p>Este es un recordatorio de tu cita para <strong>${petName}</strong> el día <strong>${date}</strong>.</p>
      <p>¡Te esperamos!</p>
    `;

    return this.sendMail(to, `Recordatorio de Cita: ${petName}`, content);
  }

  async sendVaccineReminder(to: string, clientName: string, vaccineName: string, petName: string) {
    if (!this.resend) return;

    const content = `
      <p>Hola <strong>${clientName}</strong>,</p>
      <p>A <strong>${petName}</strong> le toca su vacuna: <strong>${vaccineName}</strong>.</p>
      <p>Por favor, agenda una cita pronto.</p>
    `;

    return this.sendMail(to, `Alerta de Vacunación: ${petName}`, content);
  }

  async sendSaleReceipt(to: string, clientName: string, pdfBuffer: Buffer, saleId: string) {
    if (!this.resend) return;

    const content = `
      <p>Hola <strong>${clientName}</strong>,</p>
      <p>Gracias por tu visita a VetClinic Pro. Adjunto encontrarás el recibo de tu reciente transacción.</p>
      <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Número de Recibo:</strong> ${saleId.slice(0, 8).toUpperCase()}</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</p>
      </div>
      <p>¡Esperamos verlos pronto!</p>
    `;

    return this.sendMail(to, `Tu Recibo de VetClinic Pro - ${saleId.slice(0, 8).toUpperCase()}`, content, [
      {
        filename: `Recibo_VetClinic_${saleId.slice(0, 8)}.pdf`,
        content: pdfBuffer,
      },
    ]);
  }

  private async sendMail(to: string, subject: string, htmlContent: string, attachments?: any[]) {
    if (!this.resend) {
      this.logger.warn(`Intento de enviar correo a ${to} fallido: Resend no configurado.`);
      return;
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: [to],
        subject: subject,
        html: this.getBaseTemplate(htmlContent, subject),
        attachments: attachments,
      });

      if (error) {
        this.logger.error(`Error de Resend al enviar a ${to}:`, error);
        return;
      }

      this.logger.log(`Email enviado con éxito a ${to}. ID: ${data?.id}`);
      return data;
    } catch (error) {
      this.logger.error(`Error inesperado al enviar email a ${to}:`, error);
    }
  }

  private getBaseTemplate(content: string, title: string) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
          .btn { background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${title}</h1>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} VetClinic Pro. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
