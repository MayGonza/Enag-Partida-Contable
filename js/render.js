window.addEventListener("DOMContentLoaded", () => {

  const detalle = document.getElementById("detalle");
  const totales = document.getElementById("totales");
  const btnAgregar = document.getElementById("btnAgregar");

  btnAgregar.addEventListener("click", agregarFila);

  function agregarFila() {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td><input placeholder="Cuenta"></td>
      <td><input placeholder="Descripción"></td>
      <td><input type="number" step="0.01"></td>
      <td><input type="number" step="0.01"></td>
    `;

    tr.querySelectorAll("input").forEach(input => {
      input.addEventListener("input", calcular);
    });

    detalle.appendChild(tr);
  }

  function calcular() {
    let totalDebe = 0;
    let totalHaber = 0;

    [...detalle.rows].forEach(row => {
      totalDebe += parseFloat(row.cells[2].querySelector("input").value) || 0;
      totalHaber += parseFloat(row.cells[3].querySelector("input").value) || 0;
    });

    const estado =
      totalDebe === totalHaber && totalDebe > 0
        ? `<span class="ok">✔ BALANCEADA</span>`
        : `<span class="error">✘ DESCUADRADA</span>`;

    totales.innerHTML = `
      Total Debe: L ${totalDebe.toFixed(2)} |
      Total Haber: L ${totalHaber.toFixed(2)} |
      Estado: ${estado}
    `;
  }

  // Filas iniciales
  agregarFila();
  agregarFila();
  agregarFila();

});
