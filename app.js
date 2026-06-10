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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API contable activa en puerto ${PORT}`);
});
