import { Resend } from 'resend';

const resend = new Resend('re_DVmEa5R2_LQgJFzaNhzFcFnMmsofedjGM');

async function testMail() {
  console.log('🚀 Iniciando prueba de envío a: ivan.serrano@alumno.buap.mx');
  
  const { data, error } = await resend.emails.send({
    from: 'VetClinic Pro <onboarding@resend.dev>',
    to: ['ivan.serrano@alumno.buap.mx'],
    subject: '🐾 Prueba de Notificación - VetClinic Pro',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
        <h2 style="color: #10b981; text-align: center;">¡Conexión Exitosa!</h2>
        <p>Hola <strong>Ivan</strong>,</p>
        <p>Este es un correo de prueba de <strong>VetClinic Pro</strong> para confirmar que tu integración con Resend está funcionando perfectamente.</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981;">
          <p><strong>Estado:</strong> Producción Generada ✅</p>
          <p><strong>Servicio:</strong> Notificaciones Automáticas activadas</p>
        </div>
        <p>Ahora tu clínica puede enviar recordatorios de vacunas y citas automáticamente a tus clientes.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #666; text-align: center;">© 2026 VetClinic Pro - Sistema de Gestión</p>
      </div>
    `,
  });

  if (error) {
    console.error('❌ Error enviando email:', error);
  } else {
    console.log('✅ Email enviado con éxito! ID:', data?.id);
  }
}

testMail();
