import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;
  private readonly logger = new Logger(MailService.name);
  private readonly fromEmail = 'VetClinic Pro <onboarding@resend.dev>'; // Resend permite este email para pruebas

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.resend = new Resend(apiKey);
  }

  private getBaseTemplate(content: string, title: string) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f7f6; }
            .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; color: white; }
            .header h1 { margin: 0; font-size: 24px; letter-spacing: 1px; }
            .content { padding: 40px; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
            .button { display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
            .pet-info { background: #f3f4f6; border-radius: 8px; padding: 15px; margin: 20px 0; border-left: 4px solid #10b981; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>VetClinic Pro</h1>
            </div>
            <div class="content">
              <h2 style="color: #111827;">${title}</h2>
              ${content}
              <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
              <a href="${this.configService.get<string>('FRONTEND_URL')}" class="button">Ver en Dashboard</a>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} VetClinic Pro - Sistema de Gestión Veterinaria</p>
              <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  async sendAppointmentReminder(to: string, clientName: string, petName: string, date: Date) {
    const formattedDate = date.toLocaleString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    const content = `
      <p>Hola <strong>${clientName}</strong>,</p>
      <p>Te recordamos que tienes una cita programada para tu mascota.</p>
      <div class="pet-info">
        <p><strong>Paciente:</strong> ${petName}</p>
        <p><strong>Fecha y Hora:</strong> ${formattedDate}</p>
      </div>
      <p>Por favor, intenta llegar 10 minutos antes de tu cita.</p>
    `;

    return this.sendMail(to, `Recordatorio: Cita de ${petName} en VetClinic`, content);
  }

  async sendVaccineReminder(to: string, clientName: string, petName: string, vaccineName: string, dueDate: Date) {
    const formattedDate = dueDate.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const content = `
      <p>Hola <strong>${clientName}</strong>,</p>
      <p>La salud de <strong>${petName}</strong> es nuestra prioridad. Te recordamos que su próxima vacuna está cerca.</p>
      <div class="pet-info">
        <p><strong>Vacuna:</strong> ${vaccineName}</p>
        <p><strong>Fecha límite:</strong> ${formattedDate}</p>
      </div>
      <p>Mantener sus vacunas al día previene enfermedades graves.</p>
    `;

    return this.sendMail(to, `Alerta de Vacunación: ${petName}`, content);
  }

  async sendSaleReceipt(to: string, clientName: string, pdfBuffer: Buffer, saleId: string) {
    const content = `
      <p>Hola <strong>${clientName}</strong>,</p>
      <p>Gracias por tu visita a VetClinic Pro. Adjunto encontrarás el recibo de tu reciente transacción.</p>
      <div class="pet-info">
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
    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: [to],
        subject: subject,
        html: this.getBaseTemplate(htmlContent, subject),
        attachments: attachments,
      });

      if (error) {
        this.logger.error(`Error enviando email a ${to}:`, error);
        return false;
      }

      this.logger.log(`Email enviado con éxito a ${to}. ID: ${data?.id}`);
      return true;
    } catch (err) {
      this.logger.error(`Excepción enviando email a ${to}:`, err);
      return false;
    }
  }
}
