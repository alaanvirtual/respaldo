// src/utils/email_util.ts
import nodemailer from 'nodemailer';

export const sendMail = async (to: string, subject: string, html: string): Promise<boolean> => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER || 'test@ethereal.email',
        pass: process.env.SMTP_PASS || 'testpassword'
      }
    });

    console.log(`[EMAIL DISPATCH] Enviando correo a: ${to} | Asunto: ${subject}`);
    // Si no está configurado un SMTP real, evitamos fallo de conexión simulando el envío en desarrollo
    if (!process.env.SMTP_HOST) {
      console.log(`[EMAIL SIMULATED] Contenido del correo:\n${html}`);
      return true;
    }

    await transporter.sendMail({
      from: '"Sistema PMS" <no-reply@pms.local>',
      to,
      subject,
      html
    });
    return true;
  } catch (error) {
    console.error('Error al enviar correo:', error);
    return false;
  }
};
