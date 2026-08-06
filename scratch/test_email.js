require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
    console.log("Probando envío de correo con Gmail SMTP...");
    console.log("Usuario:", process.env.SMTP_USER);

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    try {
        const info = await transporter.sendMail({
            from: `"Sistema ENAG - Soporte" <${process.env.SMTP_USER}>`,
            to: process.env.SUPPORT_EMAIL,
            subject: "[PRUEBA] Verificación de Sistema de Soporte ENAG",
            html: "<h3>¡Conexión de Correo Exitosa!</h3><p>El sistema de soporte técnico ha sido configurado correctamente y ya puede enviar notificaciones por correo automáticamente.</p>"
        });

        console.log("¡Correo enviado con éxito! ID de mensaje:", info.messageId);
    } catch (error) {
        console.error("Error al enviar el correo:", error);
    }
}

testEmail();
