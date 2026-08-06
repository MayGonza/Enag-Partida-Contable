require('dotenv').config();
const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080' // ¡IMPORTANTE! Cambia 'http://localhost:8080' por la URL de tu frontend desplegado
}));
app.use(express.json());
// Servir archivos estáticos (HTML, JS, Imágenes) para que sean accesibles en la red
app.use(express.static(__dirname));


app.post("/partidas", async (req, res) => {
  const { fecha, concepto, detalles, usuario } = req.body;

  let totalDebe = 0;
  let totalHaber = 0;

  detalles.forEach(d => {
    totalDebe += Number(d.debe || 0);
    totalHaber += Number(d.haber || 0);
  });

  // Comparación usando un pequeño margen de error para evitar problemas de precisión decimal
  if (Math.abs(totalDebe - totalHaber) > 0.01) {
    return res.status(400).json({ error: "Partida descuadrada" });
  }

  try {
    const conn = await db.getConnection();
    await conn.beginTransaction();

    const [num] = await conn.query(
      "SELECT ultimo_numero FROM numerador_partidas FOR UPDATE"
    );

    const nuevoNumero = num[0].ultimo_numero + 1;

    await conn.query(
      "UPDATE numerador_partidas SET ultimo_numero = ?",
      [nuevoNumero]
    );

    const [partida] = await conn.query(
      `INSERT INTO partidas 
       (numero, fecha, concepto, total_debe, total_haber, creado_por)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nuevoNumero, fecha, concepto, totalDebe, totalHaber, usuario]
    );

    for (let d of detalles) {
      await conn.query(
        `INSERT INTO partida_detalle
         (id_partida, cuenta, descripcion, debe, haber)
         VALUES (?, ?, ?, ?, ?)`,
        [partida.insertId, d.cuenta, d.descripcion, d.debe, d.haber]
      );
    }

    await conn.query(
      `INSERT INTO bitacora (id_usuario, accion, descripcion)
       VALUES (?, 'CREAR PARTIDA', ?)`,
      [usuario, `Partida #${nuevoNumero} creada`]
    );

    await conn.commit();
    res.json({ mensaje: "Partida guardada", numero: nuevoNumero });

  } catch (e) {
    await conn.rollback();
    res.status(500).json({ error: e.message });
  } finally {
    if (typeof conn !== 'undefined') {
      conn.release();
    }
  }
});

const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

// Endpoint para crear ticket de soporte técnico
app.post("/api/soporte/ticket", async (req, res) => {
  const { nombre, fechaHora, departamento, descripcion } = req.body;

  if (!nombre || !departamento || !descripcion) {
    return res.status(400).json({ error: "Todos los campos obligatorios deben estar completos." });
  }

  let numeroTicket = 1001;
  let guardadoEnDb = false;

  // 1. Intentar guardar en MySQL
  try {
    const conn = await db.getConnection();
    try {
      await conn.query(`
        CREATE TABLE IF NOT EXISTS soporte_tickets (
          id INT AUTO_INCREMENT PRIMARY KEY,
          numero_ticket INT NOT NULL,
          nombre VARCHAR(255) NOT NULL,
          fecha_hora VARCHAR(100) NOT NULL,
          departamento VARCHAR(100) NOT NULL,
          descripcion TEXT NOT NULL,
          creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      const [maxRes] = await conn.query("SELECT MAX(numero_ticket) as maxNum FROM soporte_tickets");
      if (maxRes[0] && maxRes[0].maxNum) {
        numeroTicket = maxRes[0].maxNum + 1;
      }

      await conn.query(
        `INSERT INTO soporte_tickets (numero_ticket, nombre, fecha_hora, departamento, descripcion)
         VALUES (?, ?, ?, ?, ?)`,
        [numeroTicket, nombre, fechaHora || new Date().toISOString(), departamento, descripcion]
      );

      guardadoEnDb = true;
    } finally {
      conn.release();
    }
  } catch (errDb) {
    console.warn("MySQL no disponible para tickets, usando persistencia local tickets.json:", errDb.message);
  }

  // 2. Si no se guardó en MySQL, usar archivo JSON local
  if (!guardadoEnDb) {
    const ticketsFilePath = path.join(__dirname, 'tickets.json');
    let tickets = [];
    if (fs.existsSync(ticketsFilePath)) {
      try {
        const raw = fs.readFileSync(ticketsFilePath, 'utf8');
        tickets = JSON.parse(raw);
      } catch (e) {
        tickets = [];
      }
    }

    if (tickets.length > 0) {
      const maxLocalNum = Math.max(...tickets.map(t => t.numeroTicket || 1000));
      numeroTicket = maxLocalNum + 1;
    }

function getHondurasFormattedDate() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hoursStr = String(hours).padStart(2, '0');
  return `${day}/${month}/${year} ${hoursStr}:${minutes} ${ampm}`;
}

    const nuevoTicket = {
      id: tickets.length + 1,
      numeroTicket,
      nombre,
      fechaHora: fechaHora || getHondurasFormattedDate(),
      departamento,
      descripcion,
      creadoEn: getHondurasFormattedDate()
    };

    tickets.push(nuevoTicket);
    fs.writeFileSync(ticketsFilePath, JSON.stringify(tickets, null, 2), 'utf8');
  }

  // 3. Intentar envío de correo mediante Nodemailer si hay credenciales SMTP
  const targetEmail = process.env.SUPPORT_EMAIL || 'maygonza.cs@gmail.com';
  let emailEnviado = false;
  let mailError = null;

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      const mailOptions = {
        from: `"Sistema ENAG - Soporte" <${process.env.SMTP_USER}>`,
        to: targetEmail,
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
                    <td class="info-value">${fechaHora || getHondurasFormattedDate()}</td>
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
      };

      await transporter.sendMail(mailOptions);
      emailEnviado = true;
    } catch (e) {
      console.error("Error al enviar correo por SMTP:", e.message);
      mailError = e.message;
    }
  }

  // Crear también una URL de mailto preformateada por si se desea abrir el cliente de correo
  const mailtoSubject = encodeURIComponent(`[TICKET #${numeroTicket}] Solicitud de Soporte - ${departamento}`);
  const mailtoBody = encodeURIComponent(
    `Número de Ticket: #${numeroTicket}\n` +
    `Solicitante: ${nombre}\n` +
    `Fecha y Hora: ${fechaHora || new Date().toLocaleString()}\n` +
    `Departamento: ${departamento}\n\n` +
    `Detalle del Inconveniente / Solicitud:\n${descripcion}`
  );
  const mailtoUrl = `mailto:${targetEmail}?subject=${mailtoSubject}&body=${mailtoBody}`;

  return res.json({
    success: true,
    numeroTicket,
    mensaje: `Ticket #${numeroTicket} generado exitosamente.`,
    emailEnviado,
    mailtoUrl,
    destino: targetEmail
  });
});

// Endpoint para consultar el historial de tickets de soporte
app.get("/api/soporte/tickets", async (req, res) => {
  try {
    const conn = await db.getConnection();
    try {
      const [rows] = await conn.query("SELECT * FROM soporte_tickets ORDER BY id DESC");
      conn.release();
      return res.json(rows);
    } catch (e) {
      conn.release();
    }
  } catch (e) { }

  const ticketsFilePath = path.join(__dirname, 'tickets.json');
  if (fs.existsSync(ticketsFilePath)) {
    try {
      const raw = fs.readFileSync(ticketsFilePath, 'utf8');
      return res.json(JSON.parse(raw).reverse());
    } catch (e) { }
  }
  return res.json([]);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API contable activa en puerto ${PORT}`);
});

