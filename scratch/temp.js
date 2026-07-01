
        let empleados = [];
        const dropZone = document.getElementById('drop-zone');

        // Inicializar mes y fecha
        window.addEventListener('DOMContentLoaded', () => {
            const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
            const fechaActual = new Date();
            const mesActual = meses[fechaActual.getMonth()] + " " + fechaActual.getFullYear();
            document.getElementById('mesVoucher').value = mesActual;

            // Fecha de hoy formateada de forma natural en español
            const dia = fechaActual.getDate();
            const mesLetras = meses[fechaActual.getMonth()];
            const anio = fechaActual.getFullYear();
            document.getElementById('fechaEmision').value = `${dia} de ${mesLetras} del ${anio}`;
        });

        // Drag and drop event handlers
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                dropZone.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                dropZone.classList.remove('dragover');
            }, false);
        });

        dropZone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files.length > 0) {
                procesarArchivo(files[0]);
            }
        });

        function handleFileSelect(e) {
            const files = e.target.files;
            if (files.length > 0) {
                procesarArchivo(files[0]);
            }
        }

        function formatMoneda(valor) {
            return "L. " + Number(valor).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }

        function normalize(str) {
            if (!str) return "";
            return str.toString().toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remover acentos
                .replace(/[^a-z0-9]/g, ""); // conservar solo alfanuméricos
        }

        function parseCleanFloat(val) {
            if (val === undefined || val === null || val === "") return 0;
            if (typeof val === 'number') return val;
            const cleaned = val.toString()
                .replace(/L\s*/gi, "") // remover L de Lempiras
                .replace(/[^0-9.-]/g, ""); // remover comas, espacios y otros caracteres
            const num = parseFloat(cleaned);
            return isNaN(num) ? 0 : num;
        }

        async function debugLocalExcel() {
            try {
                const response = await fetch('./planilla.xls');
                if (!response.ok) {
                    throw new Error("No se pudo cargar planilla.xls desde el servidor local (código " + response.status + "). Asegúrate de estar corriendo Live Server.");
                }
                const arrayBuffer = await response.arrayBuffer();
                const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
                
                let out = "HOJAS ENCONTRADAS EN EL LIBRO:\n" + JSON.stringify(workbook.SheetNames) + "\n\n";
                
                workbook.SheetNames.forEach(sheetName => {
                    const sheet = workbook.Sheets[sheetName];
                    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
                    out += `=========================================\n`;
                    out += `HOJA: "${sheetName}" (Total filas: ${rows.length})\n`;
                    out += `=========================================\n`;
                    rows.slice(0, 15).forEach((row, idx) => {
                        const rowSlice = row.map(cell => cell !== undefined ? cell.toString().trim() : "");
                        out += `Fila ${idx + 1}: [${rowSlice.join(" | ")}]\n`;
                    });
                    out += "\n\n";
                });
                
                const dbg = document.getElementById('debugOutput');
                dbg.innerText = out;
                dbg.style.display = 'block';
            } catch (err) {
                alert("Error al analizar planilla.xls: " + err.message);
            }
        }

        function construirMapaEmpleados(workbook) {
            window.empleadoCargoMap = {};
            window.empleadoNumeroPuestoMap = {};
            window.empleadoIngresoMap = {};

            workbook.SheetNames.forEach(sheetName => {
                try {
                    const sheet = workbook.Sheets[sheetName];
                    const rowsData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
                    if (rowsData.length < 5) return;

                    // Buscar fila de cabecera
                    let headerRowIndex = -1;
                    for (let r = 0; r < Math.min(rowsData.length, 15); r++) {
                        const row = rowsData[r] || [];
                        const hasNombre = row.some(cell => {
                            const val = normalize(cell);
                            return val === "nombre" || val === "nombredelempleado";
                        });
                        if (hasNombre) {
                            headerRowIndex = r;
                            break;
                        }
                    }
                    if (headerRowIndex === -1) return;

                    // Determinar si hay doble cabecera
                    const h1 = rowsData[headerRowIndex] || [];
                    const h2 = rowsData[headerRowIndex + 1] || [];
                    const maxCols = Math.max(h1.length, h2.length);
                    const headers = [];
                    for (let c = 0; c < maxCols; c++) {
                        const val1 = h1[c] ? h1[c].toString().trim() : "";
                        const val2 = h2[c] ? h2[c].toString().trim() : "";
                        if (val1 && val2) headers.push(val1 + " - " + val2);
                        else if (val1) headers.push(val1);
                        else if (val2) headers.push(val2);
                        else headers.push("");
                    }

                    // Determinar índices
                    let nombreIdx = -1, puestoIdx = -1, numeroPuestoIdx = -1, ingresoIdx = -1;
                    headers.forEach((header, index) => {
                        const norm = normalize(header);
                        if (norm.includes("nombre") && nombreIdx === -1) nombreIdx = index;
                        if ((norm.includes("cargo") || norm.includes("puesto")) && !norm.includes("numero")) puestoIdx = index;
                        if (norm.includes("numerodepuesto") || (norm.includes("puesto") && norm.includes("num"))) numeroPuestoIdx = index;
                        if (norm.includes("ingreso")) ingresoIdx = index;
                    });

                    if (nombreIdx === -1) return;

                    // Ver si es doble fila
                    let esDobleFila = false;
                    for (let k = headerRowIndex + 2; k < Math.min(rowsData.length, headerRowIndex + 14); k++) {
                        const rowVal = rowsData[k] || [];
                        const nextRowVal = rowsData[k + 1] || [];
                        const numStr = rowVal[0] ? rowVal[0].toString().trim() : "";
                        if (/^\d+$/.test(numStr)) {
                            const nextCol0 = nextRowVal[0] ? nextRowVal[0].toString().trim() : "";
                            const nextCol1 = nextRowVal[1] ? nextRowVal[1].toString().trim() : "";
                            const nextCol2 = nextRowVal[2] ? nextRowVal[2].toString().trim() : "";
                            if (nextCol0 === "" && nextCol2 !== "" && nextCol1 !== "") {
                                esDobleFila = true;
                                break;
                            }
                        }
                    }

                    let startRow = headerRowIndex + 2;
                    if (esDobleFila) {
                        let i = startRow;
                        while (i < rowsData.length) {
                            const rowA = rowsData[i];
                            if (!rowA) { i++; continue; }
                            const numStr = rowA[0] ? rowA[0].toString().trim() : "";
                            if (/^\d+$/.test(numStr)) {
                                const rowB = rowsData[i + 1];
                                if (rowB) {
                                    const empName = rowA[nombreIdx] ? rowA[nombreIdx].toString().trim().toUpperCase() : "";
                                    if (empName) {
                                        const cargo = puestoIdx !== -1 && rowB[puestoIdx] ? rowB[puestoIdx].toString().trim().toUpperCase() : "";
                                        const numPuesto = numeroPuestoIdx !== -1 && rowB[numeroPuestoIdx] ? rowB[numeroPuestoIdx].toString().trim() : "";
                                        const ingreso = ingresoIdx !== -1 && rowA[ingresoIdx] ? rowA[ingresoIdx].toString().trim() : "";
                                        
                                        if (cargo) window.empleadoCargoMap[empName] = cargo;
                                        if (numPuesto) window.empleadoNumeroPuestoMap[empName] = numPuesto;
                                        if (ingreso) window.empleadoIngresoMap[empName] = ingreso;
                                    }
                                    i += 2;
                                } else {
                                    i++;
                                }
                            } else {
                                i++;
                            }
                        }
                    } else {
                        for (let i = startRow; i < rowsData.length; i++) {
                            const row = rowsData[i];
                            if (!row) continue;
                            const empName = row[nombreIdx] ? row[nombreIdx].toString().trim().toUpperCase() : "";
                            if (empName) {
                                const cargo = puestoIdx !== -1 && row[puestoIdx] ? row[puestoIdx].toString().trim().toUpperCase() : "";
                                const numPuesto = numeroPuestoIdx !== -1 && row[numeroPuestoIdx] ? row[numeroPuestoIdx].toString().trim() : "";
                                const ingreso = ingresoIdx !== -1 && row[ingresoIdx] ? row[ingresoIdx].toString().trim() : "";
                                
                                if (cargo) window.empleadoCargoMap[empName] = cargo;
                                if (numPuesto) window.empleadoNumeroPuestoMap[empName] = numPuesto;
                                if (ingreso) window.empleadoIngresoMap[empName] = ingreso;
                            }
                        }
                    }
                } catch (e) {
                    console.error("Error al indexar hoja: " + sheetName, e);
                }
            });
        }

        let currentWorkbook = null;

        function procesarArchivo(file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                try {
                    const data = new Uint8Array(e.target.result);
                    currentWorkbook = XLSX.read(data, { type: 'array' });
                    construirMapaEmpleados(currentWorkbook);
                    
                    const sheetSelect = document.getElementById('sheetSelect');
                    sheetSelect.innerHTML = '';
                    
                    currentWorkbook.SheetNames.forEach(name => {
                        const opt = document.createElement('option');
                        opt.value = name;
                        opt.innerText = name;
                        sheetSelect.appendChild(opt);
                    });
                    
                    if (currentWorkbook.SheetNames.length > 1) {
                        document.getElementById('sheetSelectorContainer').style.display = 'block';
                    } else {
                        document.getElementById('sheetSelectorContainer').style.display = 'none';
                    }
                    
                    cargarHoja(currentWorkbook.SheetNames[0]);
                } catch (err) {
                    alert("Error al abrir el archivo Excel: " + err.message);
                    console.error(err);
                }
            };
            reader.readAsArrayBuffer(file);
            document.getElementById('excelFile').value = '';
        }

        function cambiarHoja() {
            if (!currentWorkbook) return;
            const sheetName = document.getElementById('sheetSelect').value;
            cargarHoja(sheetName);
        }

        function cargarHoja(sheetName) {
            try {
                const sheet = currentWorkbook.Sheets[sheetName];
                const rowsData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

                if (rowsData.length < 2) {
                    alert("La hoja de Excel '" + sheetName + "' no tiene suficientes filas de datos.");
                    return;
                }

                // Escanear las primeras 15 filas para encontrar la fila de cabeceras reales
                let headerRowIndex = -1;
                for (let i = 0; i < Math.min(rowsData.length, 15); i++) {
                    const row = rowsData[i] || [];
                    const normalizedRow = row.map(cell => normalize(cell));
                    
                    // La fila debe contener la palabra nombre/empleado y además tener múltiples columnas ocupadas
                    // para evitar confundirla con banners de sección como "EMPLEADOS POR ACUERDO"
                    const tieneNombre = normalizedRow.some(cell => 
                        cell.includes("nombre") || cell.includes("empleado") || cell.includes("colaborador")
                    );
                    const tieneMultiplesColumnas = row.filter(cell => cell !== undefined && cell.toString().trim() !== "").length >= 3;
                    
                    if (tieneNombre && tieneMultiplesColumnas) {
                        headerRowIndex = i;
                        break;
                    }
                }

                if (headerRowIndex === -1) {
                    const firstRowsSample = rowsData.slice(0, 5).map((row, idx) => `Fila ${idx + 1}: [${row.slice(0, 10).join(", ")}]`).join("\n");
                    alert("No se pudo encontrar una fila de encabezados válida en la hoja '" + sheetName + "' (debe contener una columna como 'Nombre' y al menos 3 columnas llenas).\n\nPrimeras filas leídas:\n" + firstRowsSample + "\n\nPor favor, verifica el formato de tu archivo.");
                    return;
                }

                let startRow = headerRowIndex + 1;
                let headers = rowsData[headerRowIndex];

                // Detectar si hay una segunda fila de cabecera (celdas combinadas)
                const rowSiguiente = rowsData[headerRowIndex + 1] || [];
                const rowSiguienteNorm = rowSiguiente.map(h => normalize(h));
                const tieneSegundaCabecera = rowSiguienteNorm.some(h => 
                    h === "cargo" || h.includes("ihss") || h.includes("seguro") || h.includes("retiro") || h.includes("sindicato")
                );

                if (tieneSegundaCabecera) {
                    startRow = headerRowIndex + 2; // Los datos empiezan en la fila subsiguiente
                    const h1 = rowsData[headerRowIndex];
                    const h2 = rowsData[headerRowIndex + 1];
                    headers = [];
                    const maxCols = Math.max(h1.length, h2.length);
                    for (let c = 0; c < maxCols; c++) {
                        const val1 = h1[c] ? h1[c].toString().trim() : "";
                        const val2 = h2[c] ? h2[c].toString().trim() : "";
                        
                        if (val1 && val2) {
                            headers.push(val1 + " - " + val2);
                        } else if (val1) {
                            headers.push(val1);
                        } else if (val2) {
                            headers.push(val2);
                        } else {
                            headers.push("");
                        }
                    }
                }

                let nombreIdx = -1, puestoIdx = -1, ingresoIdx = -1, tipoIdx = -1, mesIdx = -1, asignadoIdx = -1, devengadoIdx = -1;
                let numeroPuestoIdx = -1, totalDeduccionesIdx = -1;

                // Mapear cabeceras
                headers.forEach((header, index) => {
                    const norm = normalize(header);
                    if (norm.includes("nombre") && nombreIdx === -1) nombreIdx = index;
                    if ((norm.includes("cargo") || norm.includes("puesto")) && !norm.includes("numero")) {
                        puestoIdx = index;
                    }
                    if (norm.includes("ingreso")) ingresoIdx = index;
                    if (norm.includes("tipo") || norm.includes("acuerdo") || norm.includes("contrato")) tipoIdx = index;
                    if (norm.includes("mes") || norm.includes("periodo")) mesIdx = index;
                    if (norm.includes("asignado")) asignadoIdx = index;
                    if (norm.includes("devengado")) devengadoIdx = index;
                    if (norm.includes("numerodepuesto") || (norm.includes("puesto") && norm.includes("num"))) numeroPuestoIdx = index;
                    if (norm.includes("totaldededucciones") || (norm.includes("total") && norm.includes("deduc"))) totalDeduccionesIdx = index;
                });

                // Si no se mapearon adecuadamente por nombre completo, forzar defaults para el formato ENAG
                if (nombreIdx === -1) nombreIdx = 2;
                if (puestoIdx === -1) puestoIdx = 2;
                if (numeroPuestoIdx === -1) numeroPuestoIdx = 1;
                if (asignadoIdx === -1) asignadoIdx = 3;
                if (devengadoIdx === -1) devengadoIdx = 4;

                // Encontrar total deducciones dinámicamente
                if (totalDeduccionesIdx === -1) {
                    headers.forEach((header, index) => {
                        const norm = normalize(header);
                        if (norm.includes("neto") || norm.includes("liquido") || norm.includes("sueldoneto")) {
                            totalDeduccionesIdx = index - 1;
                        }
                    });
                }
                if (totalDeduccionesIdx === -1) {
                    totalDeduccionesIdx = headers.length - 2;
                }

                // Determinar si la hoja usa el formato de doble fila por empleado
                let esDobleFila = false;
                for (let k = startRow; k < Math.min(rowsData.length, startRow + 12); k++) {
                    const rowVal = rowsData[k] || [];
                    const nextRowVal = rowsData[k + 1] || [];
                    const numStr = rowVal[0] ? rowVal[0].toString().trim() : "";
                    
                    if (/^\d+$/.test(numStr)) {
                        const nextCol0 = nextRowVal[0] ? nextRowVal[0].toString().trim() : "";
                        const nextCol1 = nextRowVal[1] ? nextRowVal[1].toString().trim() : "";
                        const nextCol2 = nextRowVal[2] ? nextRowVal[2].toString().trim() : "";
                        
                        if (nextCol0 === "" && nextCol2 !== "" && nextCol1 !== "") {
                            esDobleFila = true;
                            break;
                        }
                    }
                }

                empleados = [];
                if (esDobleFila) {
                    let i = startRow;
                    while (i < rowsData.length) {
                        const rowA = rowsData[i];
                        if (!rowA) { i++; continue; }

                        const numStr = rowA[0] ? rowA[0].toString().trim() : "";
                        const isEmployeeRow = /^\d+$/.test(numStr);

                        if (isEmployeeRow) {
                            const rowB = rowsData[i + 1];
                            if (rowB) {
                                const sueldoAsignado = parseCleanFloat(rowA[asignadoIdx]);
                                const sueldoDevengado = parseCleanFloat(rowA[devengadoIdx]);
                                const deducciones = [];

                                // Las deducciones se encuentran entre la columna "Sueldo Devengado" y "Total de Deducciones"
                                headers.forEach((header, index) => {
                                    if (index > devengadoIdx && index < totalDeduccionesIdx) {
                                        const val = parseCleanFloat(rowA[index]);
                                        if (val && !isNaN(val) && val > 0) {
                                            // Reemplazar múltiples espacios internos por uno solo y limpiar prefijos
                                            const cleanName = header.toString().replace(/\s+/g, ' ').trim()
                                                .replace(/^(Deducciones|Deducción|Deduccion)\s*-\s*/i, "")
                                                .replace(/\bI\s+H\s+S\s+S\b/gi, "I.H.S.S.");
                                            if (cleanName && cleanName.trim() !== "") {
                                                deducciones.push({
                                                    nombre: cleanName,
                                                    monto: val
                                                });
                                            }
                                        }
                                    }
                                });
                                const totalDeducciones = deducciones.reduce((sum, d) => sum + d.monto, 0);
                                const netoPagar = sueldoDevengado - totalDeducciones;

                                const empName = rowA[nombreIdx] ? rowA[nombreIdx].toString().trim().toUpperCase() : "";
                                let empPuesto = puestoIdx !== -1 && rowB[puestoIdx] ? rowB[puestoIdx].toString().trim().toUpperCase() : "";
                                if (!empPuesto && window.empleadoCargoMap && window.empleadoCargoMap[empName]) {
                                    empPuesto = window.empleadoCargoMap[empName];
                                }
                                if (!empPuesto) empPuesto = "AUXILIAR DE CONTABILIDAD";

                                let empNumPuesto = numeroPuestoIdx !== -1 && rowB[numeroPuestoIdx] ? rowB[numeroPuestoIdx].toString().trim() : "";
                                if (!empNumPuesto && window.empleadoNumeroPuestoMap && window.empleadoNumeroPuestoMap[empName]) {
                                    empNumPuesto = window.empleadoNumeroPuestoMap[empName];
                                }
                                if (!empNumPuesto) empNumPuesto = "N/D";

                                let empIngreso = ingresoIdx !== -1 && rowA[ingresoIdx] ? rowA[ingresoIdx].toString().trim() : "";
                                if (!empIngreso && window.empleadoIngresoMap && window.empleadoIngresoMap[empName]) {
                                    empIngreso = window.empleadoIngresoMap[empName];
                                }
                                if (!empIngreso) empIngreso = "N/D";

                                const empTipo = tipoIdx !== -1 && rowA[tipoIdx] ? (rowA[tipoIdx].toString().toUpperCase().includes("CONTRATO") ? "Contrato" : "Acuerdo") : "Acuerdo";

                                // Solo agregarlo si el nombre no está vacío
                                if (empName !== "") {
                                    empleados.push({
                                        id: i,
                                        nombre: empName,
                                        puesto: empPuesto,
                                        numeroPuesto: empNumPuesto,
                                        ingreso: empIngreso,
                                        tipo: empTipo,
                                        mes: mesIdx !== -1 && rowA[mesIdx] ? rowA[mesIdx].toString().trim() : "marzo 2026",
                                        sueldoAsignado: sueldoAsignado,
                                        sueldoDevengado: sueldoDevengado,
                                        deducciones: deducciones,
                                        totalDeducciones: totalDeducciones,
                                        netoPagar: netoPagar,
                                        selected: true
                                    });
                                }
                                i += 2; // Avanzar 2 filas (hemos procesado A y B)
                            } else {
                                i++;
                            }
                        } else {
                            i++;
                        }
                    }
                } else {
                    // Formato de una sola fila estándar
                    for (let i = startRow; i < rowsData.length; i++) {
                        const row = rowsData[i];
                        if (!row || !row[nombreIdx] || row[nombreIdx].toString().trim() === "") continue;

                        const sueldoAsignado = parseCleanFloat(row[asignadoIdx]);
                        const sueldoDevengado = parseCleanFloat(row[devengadoIdx]);
                        const deducciones = [];

                        headers.forEach((header, index) => {
                            if (index > devengadoIdx && index < totalDeduccionesIdx) {
                                const val = parseCleanFloat(row[index]);
                                if (val && !isNaN(val) && val > 0) {
                                    const cleanName = header.toString().replace(/\s+/g, ' ').trim()
                                        .replace(/^(Deducciones|Deducción|Deduccion)\s*-\s*/i, "")
                                        .replace(/\bI\s+H\s+S\s+S\b/gi, "I.H.S.S.");
                                    if (cleanName && cleanName.trim() !== "") {
                                        deducciones.push({
                                            nombre: cleanName,
                                            monto: val
                                        });
                                    }
                                }
                            }
                        });

                        const totalDeducciones = deducciones.reduce((sum, d) => sum + d.monto, 0);
                        const netoPagar = sueldoDevengado - totalDeducciones;

                        const empName = row[nombreIdx].toString().trim().toUpperCase();
                        let empPuesto = puestoIdx !== -1 && row[puestoIdx] ? row[puestoIdx].toString().trim().toUpperCase() : "";
                        if (!empPuesto && window.empleadoCargoMap && window.empleadoCargoMap[empName]) {
                            empPuesto = window.empleadoCargoMap[empName];
                        }
                        if (!empPuesto) empPuesto = "AUXILIAR DE CONTABILIDAD";

                        let empNumPuesto = numeroPuestoIdx !== -1 && row[numeroPuestoIdx] ? row[numeroPuestoIdx].toString().trim() : "";
                        if (!empNumPuesto && window.empleadoNumeroPuestoMap && window.empleadoNumeroPuestoMap[empName]) {
                            empNumPuesto = window.empleadoNumeroPuestoMap[empName];
                        }
                        if (!empNumPuesto) empNumPuesto = "N/D";

                        let empIngreso = ingresoIdx !== -1 && row[ingresoIdx] ? row[ingresoIdx].toString().trim() : "";
                        if (!empIngreso && window.empleadoIngresoMap && window.empleadoIngresoMap[empName]) {
                            empIngreso = window.empleadoIngresoMap[empName];
                        }
                        if (!empIngreso) empIngreso = "N/D";

                        const empTipo = tipoIdx !== -1 && row[tipoIdx] ? (row[tipoIdx].toString().toUpperCase().includes("CONTRATO") ? "Contrato" : "Acuerdo") : "Acuerdo";

                        empleados.push({
                            id: i,
                            nombre: empName,
                            puesto: empPuesto,
                            numeroPuesto: empNumPuesto,
                            ingreso: empIngreso,
                            tipo: empTipo,
                            mes: mesIdx !== -1 && row[mesIdx] ? row[mesIdx].toString().trim() : "marzo 2026",
                            sueldoAsignado: sueldoAsignado,
                            sueldoDevengado: sueldoDevengado,
                            deducciones: deducciones,
                            totalDeducciones: totalDeducciones,
                            netoPagar: netoPagar,
                            selected: true
                        });
                    }
                }

                if (empleados.length === 0) {
                    alert("No se cargaron registros válidos de la hoja '" + sheetName + "'.");
                    return;
                }

                renderPlanilla();
            } catch (err) {
                alert("Error al procesar la hoja '" + sheetName + "': " + err.message);
                console.error(err);
            }
        }

        function limpiarLista() {
            empleados = [];
            currentWorkbook = null;
            document.getElementById('sheetSelectorContainer').style.display = 'none';
            document.getElementById('sheetSelect').innerHTML = '';
            document.getElementById('dataSection').style.display = 'none';
            document.getElementById('emptyState').style.display = 'block';
            document.getElementById('btnGenerateBulk').disabled = true;
            document.getElementById('btnClearList').disabled = true;
            document.getElementById('excelFile').value = '';
        }

        function cambiarTipo(id, nuevoTipo) {
            const emp = empleados.find(e => e.id === id);
            if (emp) emp.tipo = nuevoTipo;
        }

        function renderPlanilla() {
            const body = document.getElementById('planillaBody');
            body.innerHTML = '';

            empleados.forEach(emp => {
                const tr = document.createElement('tr');
                tr.setAttribute('data-id', emp.id);

                tr.innerHTML = `
                    <td class="checkbox-cell"><input type="checkbox" class="emp-checkbox" ${emp.selected ? 'checked' : ''} onchange="toggleSelect(${emp.id}, this.checked)"></td>
                    <td><strong>${emp.nombre}</strong></td>
                    <td style="color: #475569; font-size: 0.9em;">${emp.puesto}</td>
                    <td style="text-align: center;">
                        <select onchange="cambiarTipo(${emp.id}, this.value)" style="padding: 4px; border-radius: 4px; border: 1px solid #cbd5e1; font-weight: bold;">
                            <option value="Acuerdo" ${emp.tipo === 'Acuerdo' ? 'selected' : ''}>Acuerdo</option>
                            <option value="Contrato" ${emp.tipo === 'Contrato' ? 'selected' : ''}>Contrato</option>
                        </select>
                    </td>
                    <td style="color: #475569; font-size: 0.9em; text-align: center;">${emp.numeroPuesto}</td>
                    <td style="color: #64748b; font-size: 0.9em;">${emp.ingreso}</td>
                    <td style="text-align: right; font-family: monospace;">${formatMoneda(emp.sueldoDevengado)}</td>
                    <td style="text-align: right; font-family: monospace; color: #ef4444;">${formatMoneda(emp.totalDeducciones)}</td>
                    <td style="text-align: right; font-family: monospace; font-weight: bold; color: #16a34a;">${formatMoneda(emp.netoPagar)}</td>
                    <td style="text-align: center;">
                        <button type="button" class="btn-action-small" onclick="generarPDFIndividual(${emp.id})">Generar PDF</button>
                    </td>
                `;
                body.appendChild(tr);
            });

            document.getElementById('totalImportados').innerText = empleados.length;
            document.getElementById('emptyState').style.display = 'none';
            document.getElementById('dataSection').style.display = 'block';

            document.getElementById('btnGenerateBulk').disabled = false;
            document.getElementById('btnClearList').disabled = false;

            actualizarContadorSeleccionados();
        }

        function toggleSelect(id, selected) {
            const emp = empleados.find(e => e.id === id);
            if (emp) emp.selected = selected;
            actualizarContadorSeleccionados();
        }

        function toggleSelectAll(checkbox) {
            const visibleRows = document.querySelectorAll('#planillaBody tr');
            visibleRows.forEach(tr => {
                const id = parseInt(tr.getAttribute('data-id'));
                const emp = empleados.find(e => e.id === id);
                if (emp) {
                    emp.selected = checkbox.checked;
                    tr.querySelector('.emp-checkbox').checked = checkbox.checked;
                }
            });
            actualizarContadorSeleccionados();
        }

        function actualizarContadorSeleccionados() {
            const count = empleados.filter(e => e.selected).length;
            document.getElementById('selectedCount').innerText = count;
            document.getElementById('btnGenerateBulk').disabled = count === 0;

            const allCheckbox = document.getElementById('selectAll');
            if (count === 0) {
                allCheckbox.checked = false;
                allCheckbox.indeterminate = false;
            } else if (count === empleados.length) {
                allCheckbox.checked = true;
                allCheckbox.indeterminate = false;
            } else {
                allCheckbox.checked = false;
                allCheckbox.indeterminate = true;
            }
        }

        function filtrarTabla() {
            const query = normalize(document.getElementById('searchInput').value);
            const rows = document.querySelectorAll('#planillaBody tr');

            rows.forEach(tr => {
                const id = parseInt(tr.getAttribute('data-id'));
                const emp = empleados.find(e => e.id === id);
                if (emp) {
                    const match = normalize(emp.nombre).includes(query) || normalize(emp.puesto).includes(query);
                    tr.style.display = match ? '' : 'none';
                }
            });
        }

        function descargarPlantilla() {
            // Generar plantilla de Excel con todos los campos exactos de la imagen
            const headers = [
                "No.",
                "Numero de Puesto",
                "Nombre",
                "Cargo",
                "Fecha de Ingreso",
                "Tipo",
                "Sueldo Asignado",
                "Sueldo Devengado",
                "I.H.S.S.",
                "Plan de Retiro INJUPEMP 9.5%",
                "INJUPEMP Prestamo Hipot",
                "INJUPEMP Prestamo Personal.",
                "INJUPEMP Reingreso",
                "Impuesto Sobre la Renta",
                "Embargo",
                "Sindicato 1%",
                "ANDEPH",
                "Otras Deducciones (Ayudas Economicas/ Multas/Devoluciones /Subsidios por Incapacidad",
                "Deduccion Tiempo",
                "Optica",
                "Colegio de Periodistas",
                "Deduccion Partido (Partido Nacional)",
                "Cooperativa Elga",
                "Banco Cuscatlan",
                "Cooperativa Sagrada Familia",
                "Cooperativa 15 de Septiembre",
                "Cooperativa \"Fe y Esperanza\"",
                "Cooperativa Prosperidad Ltda",
                "Total de Deducciones",
                "Sueldo Neto"
            ];

            const data = [
                headers,
                [
                    1,
                    "1024",
                    "DANIA MARÍA COLINDRES BARAHONA",
                    "AUXILIAR DE CONTABILIDAD",
                    "02 de enero del 2013",
                    "Acuerdo",
                    18000.00,
                    18000.00,
                    297.58,
                    1710.00,
                    0.00,
                    4933.47,
                    0.00,
                    0.00,
                    0.00,
                    180.00,
                    0.00,
                    0.00,
                    0.00,
                    0.00,
                    0.00,
                    0.00,
                    0.00,
                    4096.33,
                    0.00,
                    0.00,
                    0.00,
                    0.00,
                    11207.38,
                    6792.62
                ],
                [
                    2,
                    "1025",
                    "PEDRO ANTONIO GÓMEZ REYES",
                    "DISEÑADOR GRÁFICO",
                    "15 de marzo del 2018",
                    "Contrato",
                    15000.00,
                    15000.00,
                    247.98,
                    0.00,
                    0.00,
                    0.00,
                    0.00,
                    0.00,
                    0.00,
                    150.00,
                    0.00,
                    0.00,
                    0.00,
                    0.00,
                    0.00,
                    0.00,
                    0.00,
                    0.00,
                    0.00,
                    0.00,
                    0.00,
                    0.00,
                    397.98,
                    14602.02
                ]
            ];

            const ws = XLSX.utils.aoa_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Planilla Ejemplo");
            XLSX.writeFile(wb, "Plantilla_Vouchers_ENAG.xlsx");
        }

        const getBase64FromUrl = (url) => new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width; canvas.height = img.height;
                canvas.getContext("2d").drawImage(img, 0, 0);
                resolve(canvas.toDataURL("image/png"));
            };
            img.onerror = () => resolve(null);
            img.src = url;
        });

        async function generarPDFEmpleado(emp, doc, isBulk = false) {
            const { jsPDF } = window.jspdf;

            if (!doc) {
                doc = new jsPDF('p', 'mm', 'a4');
            } else if (isBulk) {
                doc.addPage();
            }

            const logoBgUrl = await getBase64FromUrl('Logo odoo.png');
            if (logoBgUrl) {
                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();
                doc.addImage(logoBgUrl, 'PNG', 0, 0, pageWidth, pageHeight);
            }

            // Configurar fuentes y título principal
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(13);
            doc.text("Empresa Nacional de Artes Graficas", 105, 50, { align: "center" });
            doc.text("Departamento de Recursos Humanos", 105, 56, { align: "center" });

            // Datos del empleado
            doc.setFontSize(10.5);
            doc.text(`Nombre del Empleado: ${emp.nombre}`, 25, 66);
            doc.text(`Puesto: ${emp.puesto}`, 25, 72);
            if (emp.numeroPuesto && emp.numeroPuesto !== "N/D") {
                doc.text(`N° de Puesto: ${emp.numeroPuesto}`, 25, 78);
                doc.text(`Fecha de Ingreso: ${emp.ingreso}`, 25, 84);
            } else {
                doc.text(`Fecha de Ingreso: ${emp.ingreso}`, 25, 78);
            }

            // Mes del Voucher
            const mesSeleccionado = document.getElementById('mesVoucher').value || "marzo 2026";
            doc.setFontSize(11);
            doc.text(`Voucher de Pago Correspondiente al Mes de ${mesSeleccionado}`, 105, 91, { align: "center" });

            // Checkboxes Acuerdo/Contrato
            doc.setFontSize(10);
            const checkAcuerdo = emp.tipo === 'Acuerdo' ? '(X)' : '( )';
            const checkContrato = emp.tipo === 'Contrato' ? '(X)' : '( )';
            doc.text(`Acuerdo ${checkAcuerdo}`, 55, 97);
            doc.text(`Contrato ${checkContrato}`, 125, 97);

            // Tabla de Pagos y Deducciones (Dibujada manualmente para coincidir exactamente con el diseño provisto)
            const tableLeft = 25;
            const tableRight = 185;
            const middleX = 145;
            const labelX = 28;
            const valueX = 182; // Alineado a la derecha
            const rowHeight = 6.5;
            let y = 103;

            const tableRows = [];
            tableRows.push({ type: 'normal', label: 'Sueldo Asignado', val: emp.sueldoAsignado });
            tableRows.push({ type: 'normal', label: 'Sueldo Devengado', val: emp.sueldoDevengado });
            tableRows.push({ type: 'header', label: 'Deducciones', val: null });

            emp.deducciones.forEach(d => {
                tableRows.push({ type: 'normal', label: d.nombre, val: d.monto });
            });

            tableRows.push({ type: 'total_deduc', label: 'Total Deducciones', val: emp.totalDeducciones });
            tableRows.push({ type: 'total_pagar', label: 'Total a Pagar', val: emp.netoPagar });

            tableRows.forEach(row => {
                // Dibujar el cuadro y línea divisoria
                doc.setLineWidth(0.3);
                doc.setDrawColor(0, 0, 0);
                doc.rect(tableLeft, y, tableRight - tableLeft, rowHeight);
                doc.line(middleX, y, middleX, y + rowHeight);

                if (row.type === 'header') {
                    doc.setFont('helvetica', 'bold');
                    doc.text(row.label, (tableLeft + middleX) / 2, y + 4.5, { align: 'center' });
                } else if (row.type === 'total_deduc') {
                    doc.setFont('helvetica', 'bold');
                    doc.text("Total Deducciones", middleX - 3, y + 4.5, { align: 'right' });
                    doc.text(formatMoneda(row.val), valueX, y + 4.5, { align: 'right' });
                } else if (row.type === 'total_pagar') {
                    doc.setFont('helvetica', 'bold');
                    doc.text("Total a Pagar", middleX - 3, y + 4.5, { align: 'right' });
                    doc.text(formatMoneda(row.val), valueX, y + 4.5, { align: 'right' });
                } else {
                    doc.setFont('helvetica', 'normal');
                    doc.text(row.label, labelX, y + 4.5);
                    doc.text(formatMoneda(row.val), valueX, y + 4.5, { align: 'right' });
                }
                y += rowHeight;
            });

            // Pie de Firma
            y += 12;
            doc.setFont('helvetica', 'bold');
            const fechaEmisionStr = document.getElementById('fechaEmision').value || "";
            if (fechaEmisionStr) {
                doc.setFontSize(9.5);
                doc.setFont('helvetica', 'normal');
                doc.text(`Fecha de emisión: Tegucigalpa M.D.C., ${fechaEmisionStr}`, tableLeft, y);
                y += 12;
            }
            doc.setFontSize(10.5);
            doc.setFont('helvetica', 'bold');
            doc.text("Firma Autorizada: ___________________________", tableLeft, y);

            return doc;
        }

        async function generarPDFIndividual(id) {
            const emp = empleados.find(e => e.id === id);
            if (!emp) return;

            const doc = await generarPDFEmpleado(emp, null, false);
            doc.save(`Voucher_${emp.nombre.replace(/\s+/g, '_')}.pdf`);
        }

        async function generarPDFsSeleccionados() {
            const seleccionados = empleados.filter(e => e.selected);
            if (seleccionados.length === 0) {
                alert("Por favor, selecciona al menos un empleado de la lista.");
                return;
            }

            const { jsPDF } = window.jspdf;
            let doc = new jsPDF('p', 'mm', 'a4');

            for (let i = 0; i < seleccionados.length; i++) {
                doc = await generarPDFEmpleado(seleccionados[i], doc, i > 0);
            }

            doc.save(`Vouchers_Pago_Seleccionados.pdf`);
        }
    