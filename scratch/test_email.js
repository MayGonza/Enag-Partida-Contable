require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmailDesign() {
    console.log("Enviando correo de prueba con nuevo diseño visual...");

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
    const fechaHora = "05/08/2026 11:22 PM";
    const descripcion = "Solicitud de revisión en módulo contable y habilitación de reporte en formato de Honduras.";

    try {
        const info = await transporter.sendMail({
            from: `"Sistema ENAG - Soporte" <${process.env.SMTP_USER}>`,
            to: process.env.SUPPORT_EMAIL,
            subject: `🎧 [TICKET #${numeroTicket}] Solicitud de Soporte Técnico - ${departamento}`,
            html: `
              <!DOCTYPE html>
              <html lang="es">
              <head>
                <meta charset="UTF-8">
                <style>
                  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }
                  .card { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,33,71,0.15); border: 1px solid #e2e8f0; }
                  .header { background: linear-gradient(135deg, #002147 0%, #003470 100%); color: #ffffff; padding: 28px 25px; text-align: center; border-bottom: 4px solid #d97706; }
                  .header h1 { margin: 0; font-size: 20px; letter-spacing: 1px; font-weight: 700; text-transform: uppercase; }
                  .header p { margin: 6px 0 0 0; font-size: 13px; opacity: 0.85; }
                  .ticket-badge { display: inline-block; background: #fff3dc; color: #b45309; border: 2px dashed #d97706; padding: 8px 20px; border-radius: 30px; font-size: 18px; font-weight: bold; margin: 20px 0 10px 0; }
                  .content { padding: 25px; }
                  .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; background-color: #f8fafc; border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0; }
                  .info-table td { padding: 12px 16px; font-size: 14px; border-bottom: 1px solid #e2e8f0; }
                  .info-table tr:last-child td { border-bottom: none; }
                  .info-label { font-weight: 600; color: #002147; width: 35%; background-color: #f1f5f9; }
                  .info-value { color: #334155; }
                  .status-badge { background-color: #dcfce7; color: #15803d; padding: 4px 10px; border-radius: 12px; font-weight: bold; font-size: 12px; }
                  .detail-box { background: #ffffff; border-left: 5px solid #002147; padding: 18px; border-radius: 6px; box-shadow: inset 0 0 0 1px #e2e8f0; margin-top: 10px; line-height: 1.6; font-size: 14px; color: #1e293b; }
                  .footer { background-color: #f8fafc; text-align: center; padding: 16px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
                </style>
              </head>
              <body>
                <div class="card">
                  <div class="header">
                    <h1>EMPRESA NACIONAL DE ARTES GRÁFICAS</h1>
                    <p>Sistema de Gestión Integral &bull; Notificación de Soporte Técnico</p>
                  </div>
                  <div class="content">
                    <div style="text-align: center;">
                      <div class="ticket-badge">🎫 TICKET #${numeroTicket}</div>
                    </div>

                    <table class="info-table">
                      <tr>
                        <td class="info-label">👤 Solicitante:</td>
                        <td class="info-value"><strong>${nombre}</strong></td>
                      </tr>
                      <tr>
                        <td class="info-label">📅 Fecha y Hora:</td>
                        <td class="info-value">${fechaHora}</td>
                      </tr>
                      <tr>
                        <td class="info-label">🏢 Departamento:</td>
                        <td class="info-value"><strong>${departamento}</strong></td>
                      </tr>
                      <tr>
                        <td class="info-label">📌 Estado:</td>
                        <td class="info-value"><span class="status-badge">NUEVO / PENDIENTE</span></td>
                      </tr>
                    </table>

                    <p style="font-size: 14px; font-weight: bold; color: #002147; margin-bottom: 6px;">📝 Detalle del Inconveniente o Cambio Solicitado:</p>
                    <div class="detail-box">
                      ${descripcion.replace(/\n/g, '<br>')}
                    </div>
                  </div>
                  <div class="footer">
                    <strong>Empresa Nacional de Artes Gráficas (ENAG)</strong> &bull; Correo Automático Generado por el Sistema
                  </div>
                </div>
              </body>
              </html>
            `
        });

        console.log("¡Correo HTML con diseño premium enviado con éxito! ID:", info.messageId);
    } catch (error) {
        console.error("Error al enviar correo:", error);
    }
}

testEmailDesign();
