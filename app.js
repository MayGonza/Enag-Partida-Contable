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
                      <td style="padding: 12px 16px; font-size: 14px; color: #334155; border-bottom: 1px solid #e2e8f0;">${fechaHora || getHondurasFormattedDate()}</td>
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

// ==========================================
// ENDPOINTS PARA AVISOS Y COMUNICADOS DE RH
// ==========================================

// Consultar avisos de RH
app.get("/api/avisos/rh", async (req, res) => {
  try {
    const conn = await db.getConnection();
    try {
      await conn.query(`
        CREATE TABLE IF NOT EXISTS avisos_rh (
          id INT AUTO_INCREMENT PRIMARY KEY,
          titulo VARCHAR(255) NOT NULL,
          categoria VARCHAR(50) DEFAULT 'actualizacion',
          autor VARCHAR(150) DEFAULT 'Administrador',
          mensaje TEXT NOT NULL,
          fecha_hora VARCHAR(100) NOT NULL,
          creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      const [rows] = await conn.query("SELECT id, titulo, categoria, autor, mensaje, fecha_hora as fechaHora, creado_en FROM avisos_rh ORDER BY id DESC");
      conn.release();
      return res.json(rows);
    } catch (e) {
      conn.release();
    }
  } catch (e) { }

  const avisosFilePath = path.join(__dirname, 'avisos_rh.json');
  if (fs.existsSync(avisosFilePath)) {
    try {
      const raw = fs.readFileSync(avisosFilePath, 'utf8');
      const data = JSON.parse(raw);
      return res.json(Array.isArray(data) ? data : []);
    } catch (e) { }
  }
  return res.json([]);
});

// Publicar nuevo aviso de RH
app.post("/api/avisos/rh", async (req, res) => {
  const { titulo, categoria, autor, mensaje, fechaHora } = req.body;

  if (!titulo || !mensaje) {
    return res.status(400).json({ error: "El título y el mensaje son obligatorios." });
  }

  const horaFinal = fechaHora || (typeof getHondurasFormattedDate === 'function' ? getHondurasFormattedDate() : new Date().toLocaleString());
  let guardadoEnDb = false;
  let insertId = null;

  try {
    const conn = await db.getConnection();
    try {
      await conn.query(`
        CREATE TABLE IF NOT EXISTS avisos_rh (
          id INT AUTO_INCREMENT PRIMARY KEY,
          titulo VARCHAR(255) NOT NULL,
          categoria VARCHAR(50) DEFAULT 'actualizacion',
          autor VARCHAR(150) DEFAULT 'Administrador',
          mensaje TEXT NOT NULL,
          fecha_hora VARCHAR(100) NOT NULL,
          creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      const [resInsert] = await conn.query(
        `INSERT INTO avisos_rh (titulo, categoria, autor, mensaje, fecha_hora)
         VALUES (?, ?, ?, ?, ?)`,
        [titulo, categoria || 'actualizacion', autor || 'Administrador', mensaje, horaFinal]
      );
      insertId = resInsert.insertId;
      guardadoEnDb = true;
    } finally {
      conn.release();
    }
  } catch (e) {
    console.warn("MySQL no disponible para avisos RH, guardando en avisos_rh.json:", e.message);
  }

  // Guardar también / sincronizar en JSON
  const avisosFilePath = path.join(__dirname, 'avisos_rh.json');
  let avisos = [];
  if (fs.existsSync(avisosFilePath)) {
    try {
      avisos = JSON.parse(fs.readFileSync(avisosFilePath, 'utf8'));
    } catch (e) {
      avisos = [];
    }
  }

  const nuevoAviso = {
    id: guardadoEnDb ? insertId : (avisos.length > 0 ? Math.max(...avisos.map(a => a.id || 0)) + 1 : 1),
    titulo,
    categoria: categoria || 'actualizacion',
    autor: autor || 'Administrador',
    mensaje,
    fechaHora: horaFinal
  };

  // Agregar al inicio
  avisos.unshift(nuevoAviso);
  fs.writeFileSync(avisosFilePath, JSON.stringify(avisos, null, 2), 'utf8');

  return res.json({
    success: true,
    mensaje: "Aviso publicado exitosamente.",
    aviso: nuevoAviso
  });
});

// Eliminar aviso de RH por ID
app.delete("/api/avisos/rh/:id", async (req, res) => {
  const avisoId = parseInt(req.params.id);

  try {
    const conn = await db.getConnection();
    try {
      await conn.query("DELETE FROM avisos_rh WHERE id = ?", [avisoId]);
    } finally {
      conn.release();
    }
  } catch (e) { }

  const avisosFilePath = path.join(__dirname, 'avisos_rh.json');
  if (fs.existsSync(avisosFilePath)) {
    try {
      let avisos = JSON.parse(fs.readFileSync(avisosFilePath, 'utf8'));
      avisos = avisos.filter(a => a.id !== avisoId);
      fs.writeFileSync(avisosFilePath, JSON.stringify(avisos, null, 2), 'utf8');
    } catch (e) { }
  }

  return res.json({ success: true, mensaje: "Aviso eliminado correctamente." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API contable activa en puerto ${PORT}`);
});

