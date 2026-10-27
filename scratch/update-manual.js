const fs = require('fs');
let manual = fs.readFileSync('MANUAL_TECNICO.md', 'utf8');

// 1. Add detector_espacio.html to tree
const treeTarget = `│   ├── constancias_sin_*.html    # Constancias sin deducciones (Acuerdo / Contrato)
│   ├── cotizaciones.html         # Módulo oficial de cotizaciones y publicaciones`;

const treeReplacement = `│   ├── constancias_sin_*.html    # Constancias sin deducciones (Acuerdo / Contrato)
│   ├── cotizaciones.html         # Módulo oficial de cotizaciones y publicaciones
│   ├── detector_espacio.html     # Detector inteligente de espacio y tarifas para publicaciones`;

if (manual.includes(treeTarget)) {
   manual = manual.replace(treeTarget, treeReplacement);
}

// 2. Add Section 7.4
const targetSection = `### 7.3. Metodología de Subsidios e Incapacidades IHSS (\`views/incapacidades.html\`)
1. **Días Calendario:** Se extraen los días totales de los 3 meses calendario previos a la fecha inicial de la incapacidad ($D_{\\text{3m}} \\in \\{89, 90, 91, 92\\}$).
2. **Sueldo Diario de Referencia:**
   $$\\text{Sueldo Diario} = \\frac{\\text{Techo IHSS} \\times 3}{D_{\\text{3m}}} = \\frac{11,903.13 \\times 3}{D_{\\text{3m}}}$$
3. **Distribución del Subsidio Diario:**
   - **Subsidio IHSS a Reintegrar (66%):** $\\text{Sueldo Diario} \\times 0.66$
   - **Aporte Complementario Patrono (34%):** $\\text{Sueldo Diario} \\times 0.34$
4. **Carencia:** En contingencias de enfermedad común, los primeros 3 días son absorbidos al 100% por el patrono; el subsidio del IHSS opera a partir del 4.º día.

---`;

const newSection = `### 7.3. Metodología de Subsidios e Incapacidades IHSS (\`views/incapacidades.html\`)
1. **Días Calendario:** Se extraen los días totales de los 3 meses calendario previos a la fecha inicial de la incapacidad ($D_{\\text{3m}} \\in \\{89, 90, 91, 92\\}$).
2. **Sueldo Diario de Referencia:**
   $$\\text{Sueldo Diario} = \\frac{\\text{Techo IHSS} \\times 3}{D_{\\text{3m}}} = \\frac{11,903.13 \\times 3}{D_{\\text{3m}}}$$
3. **Distribución del Subsidio Diario:**
   - **Subsidio IHSS a Reintegrar (66%):** $\\text{Sueldo Diario} \\times 0.66$
   - **Aporte Complementario Patrono (34%):** $\\text{Sueldo Diario} \\times 0.34$
4. **Carencia:** En contingencias de enfermedad común, los primeros 3 días son absorbidos al 100% por el patrono; el subsidio del IHSS opera a partir del 4.º día.

### 7.4. Algoritmo de Detección Automática de Espacio y Diagramación (\`views/detector_espacio.html\`)
Permite predecir de forma automatizada y exacta la fracción física que ocupará un texto legal en el Diario Oficial *La Gaceta*, vinculándolo de inmediato con el tarifario del **Acuerdo Ejecutivo N° 249-2010**:

1. **Parámetros de Calibración Tipográfica:**
   - Base de palabras por página completa: $W_{\\text{pág}} = 1,050$ palabras (calibrable).
   - Ancho promedio de columna en caracteres: $C_{\\text{col}} = 40$ caracteres por línea.
   - Margen de holgura y seguridad para diagramación/firmas: $M_{\\text{seg}} = 10\\%$.

2. **Cálculo de Ocupación Efectiva:**
   $$\\text{Palabras Efectivas} = N_{\\text{palabras}} \\times \\left(1 + \\frac{M_{\\text{seg}}}{100}\\right)$$
   $$\\% \\text{ Ocupación} = \\left(\\frac{\\text{Palabras Efectivas}}{W_{\\text{pág}}}\\right) \\times 100$$

3. **Matriz de Clasificación de Espacio Oficial:**
   | Ocupación ($\\%$) | Espacio Asignado | Tarifa Oficial (L.) |
   | :--- | :--- | :--- |
   | $0\\% - 20\\%$ | **1/5 Página** | L. 800.00 |
   | $20.01\\% - 25\\%$ | **1/4 Página** | L. 1,200.00 |
   | $25.01\\% - 33.33\\%$ | **1/3 Página** | L. 1,400.00 |
   | $33.34\\% - 50\\%$ | **1/2 Página** | L. 1,800.00 |
   | $50.01\\% - 66.67\\%$ | **2/3 Página** | L. 2,800.00 |
   | $66.68\\% - 100\\%$ | **1 Página Completa** | L. 3,200.00 |
   | $> 100\\%$ | **Multi-Página** ($\\lceil \\% / 100 \\rceil$ páginas) | L. 3,200.00 $\\times$ Páginas |

4. **Integración con Cotizaciones:** Mediante \`sessionStorage\` (\`enag_item_transferido\`), el operador puede transferir el concepto detectado, la cantidad de páginas calculadas, el precio base y los descuentos legislados con un solo clic hacia \`views/cotizaciones.html\`.

---`;

if (manual.includes(targetSection)) {
   manual = manual.replace(targetSection, newSection);
   fs.writeFileSync('MANUAL_TECNICO.md', manual, 'utf8');
   console.log('✓ MANUAL_TECNICO.md actualizado con la documentación del Detector de Espacio');
} else {
   console.log('⚠ No se encontró targetSection en MANUAL_TECNICO.md');
}
