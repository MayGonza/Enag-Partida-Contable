require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmailInlineDesign() {
    console.log("Enviando correo de prueba con estilos en línea (Inline CSS para Gmail)...");

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    const numeroTicket = 1001;
    const nombre = "Iris Ramos";
    const departamento = "Contabilidad";
    const fechaHora = "05/08/2026 11:31 PM";
    const descripcion = "Prueba final de diseño con colores institucionales ENAG y formato de correo con estilos en línea.";

    try {
        const info = await transporter.sendMail({
            from: `"Sistema ENAG - Soporte" <${process.env.SMTP_USER}>`,
            to: process.env.SUPPORT_EMAIL,
            subject: `🎧 [TICKET #${numeroTicket}] Solicitud de Soporte Técnico - ${departamento}`,
            html: `
              <div style="font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background-color: #f1f5f9; padding: 20px; color: #1e293b;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,33,71,0.15); border: 1px solid #cbd5e1;">
                  <tr>
                    <td style="background-color: #002147; color: #ffffff; padding: 25px; text-align: center; border-bottom: 4px solid #d97706;">
                      <h1 style="margin: 0; font-size: 18px; letter-spacing: 1px; font-weight: 700; text-transform: uppercase; color: #ffffff;">EMPRESA NACIONAL DE ARTES GRÁFICAS</h1>
                      <p style="margin: 6px 0 0 0; font-size: 12px; color: #cbd5e1;">Sistema de Gestión Integral &bull; Notificación de Soporte Técnico</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 25px;">
                      <div style="text-align: center; margin-bottom: 20px;">
                        <span style="display: inline-block; background-color: #fff3dc; color: #b45309; border: 2px dashed #d97706; padding: 8px 22px; border-radius: 30px; font-size: 18px; font-weight: bold;">🎫 TICKET #${numeroTicket}</span>
                      </div>

                      <table border="0" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background-color: #f8fafc; border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0;">
                        <tr>
                          <td style="padding: 12px 16px; font-size: 14px; font-weight: 600; color: #002147; width: 35%; background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0;">👤 Solicitante:</td>
                          <td style="padding: 12px 16px; font-size: 14px; color: #334155; border-bottom: 1px solid #e2e8f0;"><strong>${nombre}</strong></td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 16px; font-size: 14px; font-weight: 600; color: #002147; background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0;">📅 Fecha y Hora:</td>
                          <td style="padding: 12px 16px; font-size: 14px; color: #334155; border-bottom: 1px solid #e2e8f0;">${fechaHora}</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 16px; font-size: 14px; font-weight: 600; color: #002147; background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0;">🏢 Departamento:</td>
                          <td style="padding: 12px 16px; font-size: 14px; color: #334155; border-bottom: 1px solid #e2e8f0;"><strong>${departamento}</strong></td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 16px; font-size: 14px; font-weight: 600; color: #002147; background-color: #f1f5f9;">📌 Estado:</td>
                          <td style="padding: 12px 16px; font-size: 14px; color: #15803d;"><span style="background-color: #dcfce7; color: #15803d; padding: 4px 10px; border-radius: 12px; font-weight: bold; font-size: 12px;">NUEVO / PENDIENTE</span></td>
                        </tr>
                      </table>

                      <p style="font-size: 14px; font-weight: bold; color: #002147; margin: 0 0 8px 0;">📝 Detalle del Inconveniente o Cambio Solicitado:</p>
                      <div style="background-color: #ffffff; border-left: 5px solid #002147; padding: 18px; border-radius: 6px; border: 1px solid #cbd5e1; line-height: 1.6; font-size: 14px; color: #1e293b;">
                        ${descripcion.replace(/\n/g, '<br>')}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: #f8fafc; text-align: center; padding: 16px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
                      <strong>Empresa Nacional de Artes Gráficas (ENAG)</strong> &bull; Correo Automático Generado por el Sistema
                    </td>
                  </tr>
                </table>
              </div>
            `
        });

        console.log("¡Correo enviado con estilos en línea totalmente funcional en Gmail! ID:", info.messageId);
    } catch (error) {
        console.error("Error al enviar correo:", error);
    }
}

testEmailInlineDesign();
