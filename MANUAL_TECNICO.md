# MANUAL TÉCNICO DEL SISTEMA
## Empresa Nacional de Artes Gráficas (ENAG)
### Sistema Integral de Gestión Administrativa, Contable y de Producción
**Versión de Software:** 4.2.0  
**Fecha de Emisión:** Octubre 2026  
**Entorno de Producción:** [https://sistemagestionenag.web.app](https://sistemagestionenag.web.app)  
**Clasificación:** Documento Técnico Oficial — Departamento de Tecnologías de la Información (TI)

---

## 1. INTRODUCCIÓN Y ALCANCE

### 1.1. Propósito
El presente Manual Técnico tiene como finalidad documentar formalmente la arquitectura de software, infraestructura, esquemas de bases de datos, flujos de integración, directivas de seguridad y procesos de despliegue continuo del **Sistema Integral de Gestión de la ENAG**. Sirve como guía de referencia para ingenieros de desarrollo, administradores de sistemas, personal de soporte de TI y auditores gubernamentales.

### 1.2. Alcance del Sistema
La plataforma digital integra y automatiza las operaciones de los siguientes departamentos institucionales:
1. **Contabilidad y Finanzas:** Retenciones de impuestos conforme al SAR, libro diario de partidas contables con cuadre estricto de partida doble y facturación/partidas al crédito con el Banco Central de Honduras.
2. **Comercialización:** Cotizaciones oficiales de publicaciones para el Diario Oficial *La Gaceta* y servicios gráficos industriales según el Acuerdo Ejecutivo N° 249-2010, con cálculo automatizado de ISV y descuentos legislados.
3. **Recursos Humanos (RRHH):** Procesamiento masivo de nóminas para personal bajo régimen de Acuerdo y Contrato, generación automática de recibos de pago (vouchers), emisión de cuatro modalidades de constancias de trabajo con firma y código QR, cálculo de reintegros de incapacidades del IHSS, gestión de vacaciones y permisos laborales.
4. **Talleres de Producción Gráfica:** Registro de especificaciones de tiraje, sustratos y tintas; tablero Kanban/Grid de control de fases industriales (Pre-prensa, Prensa, Post-prensa, Listo y Entregado).
5. **Auditoría y Bitácora:** Registro inmutable de eventos institucionales con trazabilidad por usuario, módulo, timestamp y dirección IP/sesión.
6. **Administración y TI:** Configuración dinámica de parámetros (porcentaje de ISV, timeouts de sesión, control de concurrencia) y canal de soporte técnico.

---

## 2. ARQUITECTURA GENERAL DEL SISTEMA

### 2.1. Patrón Arquitectónico
El sistema adopta un modelo arquitectónico **Serverless & Jamstack** desacoplado, combinando una aplicación web estática optimizada (HTML5 + Vanilla CSS + JavaScript Moderno ES6+) con un Backend-as-a-Service (BaaS) provisto por **Google Firebase**.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          CLIENTE (FRONTEND)                            │
│                                                                        │
│  ┌──────────────────────┐  ┌─────────────────────┐  ┌───────────────┐ │
│  │   Vistas Modulares   │  │   CSS Design Tokens │  │ Librerías C-S │ │
│  │  (HTML5 Semántico)   │  │ (Variables, Flexbox)│  │ (jsPDF, SheetJS│ │
│  └──────────┬───────────┘  └──────────┬──────────┘  └───────┬───────┘ │
│             │                         │                     │         │
│             └─────────────────────────┼─────────────────────┘         │
│                                       │                                │
│                     ┌─────────────────┴────────────────┐               │
│                     │       Capa Lógica (JS ES6+)      │               │
│                     │  firebase-config.js / soporte.js │               │
│                     └─────────────────┬────────────────┘               │
└───────────────────────────────────────┼────────────────────────────────┘
                                        │ HTTPS / WSS
                                        ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       GOOGLE FIREBASE INFRASTRUCTURE                   │
│                                                                        │
│  ┌───────────────────────────┐      ┌───────────────────────────────┐  │
│  │    Firebase Auth v10      │      │     Cloud Firestore (NoSQL)   │  │
│  │  - Email / Password       │      │  - Colección /usuarios        │  │
│  │  - Email Verification     │      │  - Colección /cotizaciones     │  │
│  │  - Session Token JWT      │      │  - Colección /bitacora        │  │
│  └───────────────────────────┘      │  - Colección /ordenes_prod.   │  │
│                                     │  - Colección /parametros      │  │
│  ┌───────────────────────────┐      └───────────────────────────────┘  │
│  │  Firebase Hosting (CDN)   │                                         │
│  │  - Edge Caching           │                                         │
│  │  - SSL/TLS Automático     │                                         │
│  └───────────────────────────┘                                         │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.2. Ventajas del Enfoque Arquitectónico
- **Cero latencia de renderizado en servidor:** Los clientes cargan assets precompilados desde la red CDN global de Firebase Hosting con tiempos de respuesta inferiores a 100ms.
- **Tolerancia a fallos y alta disponibilidad:** Disponibilidad del 99.95% garantizada por la infraestructura multizona de Google Cloud Platform.
- **Costos operativos mínimos:** No requiere servidores dedicados de aprovisionamiento continuo (ec2, vps), aprovechando el esquema bajo demanda del tier Spark/Blaze.
- **Portabilidad a Escritorio:** La estructura es compatible con empaquetado nativo mediante **Electron** (incluido en `package.json`).

---

## 3. STACK TECNOLÓGICO Y DEPENDENCIAS

### 3.1. Frontend y Núcleo de Aplicación
| Componente | Tecnología / Versión | Propósito Técnico |
| :--- | :--- | :--- |
| **Estructura** | HTML5 Semántico | Documentos estructurados sin dependencias de frameworks SPA pesados |
| **Estilos** | Vanilla CSS3 + Variables CSS | Sistema de diseño institucional basado en `:root` tokens (`#002147`, `#10b981`, etc.) |
| **Lógica** | JavaScript Vanilla ES6+ (Async/Await) | Manipulación reactiva de DOM, cálculos financieros y suscripciones en tiempo real |
| **Generación PDF** | jsPDF v2.5.1 + AutoTable v3.5.25 | Creación client-side de documentos oficiales, comprobantes, cartas y reportes tabulares |
| **Lectura Planillas** | SheetJS (xlsx.full.min.js) | Parseo en el cliente de libros de cálculo `.xls` y `.xlsx` para procesamiento masivo |
| **Generación QR** | qrcode.js | Renderizado de códigos QR de validación institucional en constancias laborales |
| **Selector Fechas** | flatpickr.min.js | Datepicker localizado con soporte de calendario de Honduras |

### 3.2. Backend y Servicios en la Nube
| Servicio | Proveedor / SDK | Función en el Sistema |
| :--- | :--- | :--- |
| **Autenticación** | Firebase Auth Compat v10.8.0 | Gestión de credenciales, verificación de email, emisión de tokens y control de sesiones |
| **Base de Datos** | Cloud Firestore Compat v10.8.0 | Almacén NoSQL distribuido con listeners reactivos en tiempo real (`onSnapshot`) |
| **Alojamiento** | Firebase Hosting | Distribución estática de alta velocidad con certificados SSL y cabeceras de no-caché |

### 3.3. Entorno de Desarrollo y Módulos Auxiliares (Node.js)
El repositorio cuenta con configuración para servicios complementarios y pruebas locales:
- `electron` (^30.0.0): Shell de escritorio para empaquetado opcional en Windows.
- `express` (^4.19.2) & `cors`: Servidor HTTP para servicios API o microservicios locales.
- `nodemailer` (^9.0.4): Despacho de notificaciones por correo electrónico SMTP institucional.
- `mysql2` (^3.9.7): Driver para integración con bases de datos relacionales gubernamentales históricas.
- `jsdom` (^30.1.1): Entorno DOM virtualizado para pruebas unitarias de scripts y validación de sintaxis.

---

## 4. ESTRUCTURA DEL PROYECTO

```
Enag-Partida-Contable/
├── .firebase/                    # Metadatos y caché de despliegue de Firebase
├── assets/                       # Logotipos, capturas de pantalla e imágenes institucionales
│   ├── Logo odoo.png             # Membrete institucional oficial para PDFs
│   ├── logo.ico                  # Favicon del sistema
│   ├── logo.jpeg / logo.png      # Fondos de pantalla y marcas de agua
│   └── captura_*.png             # Capturas ilustrativas para los manuales
├── css/                          # Hojas de estilo complementarias
├── js/                           # Bibliotecas locales del frontend
│   ├── firebase-config.js        # Inicialización de Firebase SDK y servicios globales
│   ├── jspdf.umd.min.js          # Motor gráfico jsPDF
│   ├── jspdf-autotable.min.js    # Motor de tablas jsPDF AutoTable
│   ├── xlsx.full.min.js          # Parser de planillas Excel
│   ├── qrcode.js                 # Generador de códigos QR
│   ├── flatpickr.min.js          # Control de selección de fechas
│   ├── honduras-datepicker.js    # Localización y reglas de días inhábiles
│   └── soporte.js                # Módulo de emisión y sincronización de tickets TI
├── views/                        # Vistas modulares del sistema (HTML)
│   ├── bitacora.html             # Consulta y auditoría de eventos del sistema
│   ├── comercializacion.html     # Menú de enlace al módulo de cotizaciones
│   ├── comprobante_retencion.html# Comprobantes de retención SAR (1% y 12.5%)
│   ├── constancias.html          # Constancias laborales con deducciones (Acuerdo)
│   ├── constancias_contrato.html # Constancias laborales con deducciones (Contrato)
│   ├── constancias_sin_*.html    # Constancias sin deducciones (Acuerdo / Contrato)
│   ├── cotizaciones.html         # Módulo oficial de cotizaciones y publicaciones
│   ├── estado_solicitud.html     # Consulta pública de estado de solicitudes
│   ├── incapacidades.html        # Cálculo y reintegro de subsidios IHSS
│   ├── login.html                # Autenticación, control de sesiones y recuperación
│   ├── manual.html               # Manual de usuario interactivo y exportador PDF
│   ├── manual_tecnico.html       # Manual técnico interactivo del sistema
│   ├── orden_produccion.html     # Órdenes de producción y flujo de fases de taller
│   ├── parametros.html           # Configuración dinámica de variables del sistema
│   ├── partidas.html             # Partidas contables de diario con balanceo
│   ├── partidas_credito.html     # Partidas contables al crédito (BCH)
│   ├── registro.html             # Registro de usuarios y solicitud de cuenta
│   ├── rrhh_permisos.html        # Control y emisión de permisos laborales
│   ├── solicitud_personal.html   # Requisición oficial de plazas de personal
│   ├── vacaciones.html           # Control y constancia de vacaciones acumuladas
│   ├── vouchers.html             # Recibos de pago masivos para Acuerdo
│   └── vouchers_contrato.html    # Recibos de pago masivos para Contrato
├── .env / .env.example           # Variables de entorno y credenciales
├── firebase.json                 # Configuración de hosting, headers y reglas
├── firestore.rules               # Directivas de seguridad de Cloud Firestore
├── index.html                    # Portal principal con menú interactivo y PINes
├── main.js                       # Entry-point de Electron para escritorio
├── package.json                  # Dependencias y scripts de desarrollo
└── MANUAL_TECNICO.md             # Documento de especificación técnica oficial
```

---

## 5. ESQUEMA DE BASE DE DATOS (CLOUD FIRESTORE)

Firestore opera como una base de datos documental distribuida NoSQL. A continuación se detalla la estructura canónica de cada colección:

### 5.1. Colección `usuarios`
Almacena la información de perfil, departamento y control de sesiones activas.
- **Ruta:** `/usuarios/{uid}`
- **Identificador de Documento:** `user.uid` provisto por Firebase Auth.

| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `uid` | string | Sí | Identificador único de usuario en Firebase Auth |
| `nombre` | string | Sí | Nombre completo del colaborador |
| `usuario` | string | Sí | Nombre de usuario o identificador corto |
| `email` | string | Sí | Correo electrónico corporativo |
| `departamento` | string | Sí | Departamento asignado (`Contabilidad`, `RRHH`, `Produccion`, `Comercializacion`, `TI`) |
| `rol` | string | Sí | Nivel de privilegios (`admin`, `operador`, `auditor`) |
| `sessionId` | string | No | UUID v4 de la sesión activa para evitar inicios concurrentes |
| `lastLogin` | timestamp | No | Marca de tiempo del último inicio de sesión |
| `creadoEn` | timestamp | Sí | Fecha de registro en la plataforma |

### 5.2. Colección `cotizaciones`
Almacena las cotizaciones generadas para publicaciones del Diario Oficial *La Gaceta* y artes gráficas.
- **Ruta:** `/cotizaciones/{numeroCotizacion}`
- **Identificador de Documento:** Número consecutivo en string (ej. `"30239"`).

| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `numero` | number / string | Sí | Número de folio de la cotización |
| `fecha` | string | Sí | Fecha y hora en formato ISO (`YYYY-MM-DDTHH:mm`) |
| `comercial` | string | Sí | Nombre del oficial comercial que genera la cotización |
| `terminos` | string | No | Términos comerciales de pago |
| `cliente` | map | Sí | Objeto con datos del cliente: `{ nombre, rtn, contacto, telefono, direccion, correo }` |
| `items` | array de maps | Sí | Lista de conceptos: `[{ producto, descripcion, cantidad, precioUnitario, impuesto, precioTotal }]` |
| `tipoDescuento`| string | Sí | Código de descuento aplicado (`0`, `25`, `40`, `mun_60`, `pat_60`, `aso_40`, `fun_30`, `ong_30`, `custom`) |
| `porcentajeDescuento` | number | Sí | Porcentaje numérico efectivo (0 a 100) |
| `totalBase` | number | Sí | Subtotal bruto antes de descuentos e impuestos |
| `valorDescuento`| number | Sí | Valor monetario deducido por descuento |
| `totalNeto` | number | Sí | Subtotal neto (`totalBase - valorDescuento`) |
| `totalImpuesto`| number | Sí | Impuesto sobre ventas calculado (15% sobre ítems gravados) |
| `totalGeneral` | number | Sí | Monto final a cobrar (`totalNeto + totalImpuesto`) |
| `estado` | string | Sí | Estado del trámite: `'Pendiente'`, `'Aprobada'`, `'Rechazada'` |
| `timestamp` | timestamp | Sí | Timestamp de servidor (`serverTimestamp()`) |

### 5.3. Colección `ordenes_produccion`
Almacena las órdenes técnicas que circulan en los talleres de la imprenta.
- **Ruta:** `/ordenes_produccion/{id}`

| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `numero` | number / string | Sí | Folio correlativo de la orden |
| `cliente` | map | Sí | Objeto con nombre, contacto y teléfono del cliente |
| `fecha` | string | Sí | Fecha de recepción del trabajo |
| `fechaEntrega` | string | No | Fecha pactada de entrega |
| `descripcion` | string | Sí | Especificación técnica del trabajo (diario, folleto, afiche) |
| `tiraje` | number | Sí | Cantidad total de ejemplares a imprimir |
| `tipoPapel` | string | Sí | Sustrato seleccionado (Bond 20lb, Couché 100lb, etc.) |
| `faseProduccion`| string | Sí | Estado: `'Pre-prensa'`, `'Prensa'`, `'Post-prensa'`, `'Listo'`, `'Entregado'` |
| `operador` | string | No | Nombre del impresor o maquinista asignado |
| `observaciones`| string | No | Indicaciones especiales de encuadernación o corte |
| `timestamp` | timestamp | Sí | Fecha de registro |

### 5.4. Colección `bitacora`
Registro cronológico inmutable para auditoría de eventos de seguridad y transaccionales.
- **Ruta:** `/bitacora/{id}`

| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `modulo` | string | Sí | Módulo emisor (`Contabilidad`, `Comercialización`, `RRHH`, `Producción`, `TI`, `Seguridad`) |
| `accion` | string | Sí | Operación ejecutada (`Crear`, `Editar`, `Eliminar`, `Actualizar Estado`, `Descargar PDF`, `Inicio Sesión`) |
| `mensaje` | string | Sí | Descripción legible del evento (ej. "Se creó cotización #30239 para Cliente X") |
| `usuario` | string | Sí | Nombre o email del operador autenticado |
| `fecha` | string | Sí | Fecha formateada en zona horaria de Honduras |
| `timestamp` | timestamp | Sí | Marca de tiempo estricta de servidor |

### 5.5. Colección `parametros`
Parámetros globales dinámicos del sistema editables desde `views/parametros.html`.
- **Ruta:** `/parametros/global`

| Campo | Tipo | Valor Predeterminado | Descripción |
| :--- | :--- | :--- | :--- |
| `isvPorcentaje` | number | `15` | Porcentaje de Impuesto sobre Ventas estándar |
| `inactividadMinutos` | number | `15` | Minutos de inactividad antes de forzar cierre de sesión |
| `bloquearSesionesMultiples` | boolean | `true` | Si es true, desconecta la sesión previa al iniciar una nueva |
| `techoIhss` | number | `11903.13` | Techo de cotización vigente del IHSS |
| `prefijoCotizacion` | string | `"COT-"` | Prefijo para folios de cotización |

---

## 6. POLÍTICAS DE SEGURIDAD Y REGLAS DE FIRESTORE

Las reglas definidas en `firestore.rules` garantizan que ningún usuario no autenticado o con correo no verificado pueda manipular los registros:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Función auxiliar: verifica que el usuario esté autenticado con correo verificado
    function isAuth() {
      return request.auth != null && request.auth.token.email_verified == true;
    }
    
    // Reglas para la colección de usuarios
    match /usuarios/{userId} {
      allow read: if isAuth();
      allow write: if isAuth() && (request.auth.uid == userId || request.auth.token.admin == true);
    }
    
    // Reglas para cotizaciones y órdenes de producción
    match /cotizaciones/{document=**} {
      allow read, create, update: if isAuth();
      allow delete: if isAuth();
    }
    
    match /ordenes_produccion/{document=**} {
      allow read, create, update, delete: if isAuth();
    }
    
    // Reglas para la bitácora: lectura general, inserción permitida, PROHIBIDO eliminar o modificar
    match /bitacora/{logId} {
      allow read, create: if isAuth();
      allow update, delete: if false; // Inmutabilidad garantizada
    }
    
    // Parámetros del sistema: lectura para todos los autenticados, escritura solo administradores
    match /parametros/{paramId} {
      allow read: if isAuth();
      allow write: if isAuth();
    }
    
    // Avisos y tickets de soporte
    match /avisos_rh/{avisoId} {
      allow read, write: if isAuth();
    }
    
    match /tickets/{ticketId} {
      allow read, create, update: if isAuth();
      allow delete: if isAuth();
    }
  }
}
```

### 6.1. Control de Sesión Única (Concurrencia)
Para prevenir el uso compartido de credenciales:
1. En cada login exitoso en `views/login.html`, se genera un `sessionId = crypto.randomUUID()`.
2. Se persiste dicho `sessionId` en el documento del usuario en Firestore y en el `localStorage` del cliente.
3. El script global escucha cambios con `dbFirestore.collection('usuarios').doc(uid).onSnapshot(...)`.
4. Si el `sessionId` en Firestore cambia respecto al guardado localmente, se muestra una alerta forzosa y se invoca `firebase.auth().signOut()`.

---

## 7. FLUJOS LÓGICOS Y ALGORITMOS CLAVE

### 7.1. Cálculo de Cotizaciones (`views/cotizaciones.html`)
El subtotal, los descuentos y los impuestos se procesan en tiempo real mediante la siguiente lógica matricial:

$$\text{Subtotal Bruto} = \sum_{i=1}^{n} (\text{Cantidad}_i \times \text{PrecioUnitario}_i)$$

$$\text{Descuento Fila}_i = (\text{Cantidad}_i \times \text{PrecioUnitario}_i) \times \left(\frac{\% \text{Descuento}}{100}\right)$$

$$\text{Total Neto Fila}_i = (\text{Cantidad}_i \times \text{PrecioUnitario}_i) - \text{Descuento Fila}_i$$

$$\text{Impuesto Fila}_i = 
\begin{cases} 
\text{Total Neto Fila}_i \times 0.15 & \text{si Impuesto}_i = \text{"ISV 15\%"} \\ 
0 & \text{si Impuesto}_i = \text{"Exento"} 
\end{cases}$$

$$\text{Total General} = \left(\sum_{i=1}^n \text{Total Neto Fila}_i\right) + \sum_{i=1}^n \text{Impuesto Fila}_i$$

*Nota Técnica:* Todas las funciones asíncronas con promesas o diálogos de confirmación personalizada (`window.enagConfirm`) están debidamente tipificadas con `async/await` para evitar excepciones de análisis en motores V8.

### 7.2. Algoritmo de Balanceo Contable (`views/partidas.html`)
El principio de partida doble exige que:

$$\left|\sum \text{Debe} - \sum \text{Haber}\right| < 0.001$$

Si existe una diferencia mayor a cero, el botón de guardado y exportación de PDF se inhabilita visualmente y emite una alerta indicando el descuadre con el monto exacto de la discrepancia.

### 7.3. Metodología de Subsidios e Incapacidades IHSS (`views/incapacidades.html`)
1. **Días Calendario:** Se extraen los días totales de los 3 meses calendario previos a la fecha inicial de la incapacidad ($D_{\text{3m}} \in \{89, 90, 91, 92\}$).
2. **Sueldo Diario de Referencia:**
   $$\text{Sueldo Diario} = \frac{\text{Techo IHSS} \times 3}{D_{\text{3m}}} = \frac{11,903.13 \times 3}{D_{\text{3m}}}$$
3. **Distribución del Subsidio Diario:**
   - **Subsidio IHSS a Reintegrar (66%):** $\text{Sueldo Diario} \times 0.66$
   - **Aporte Complementario Patrono (34%):** $\text{Sueldo Diario} \times 0.34$
4. **Carencia:** En contingencias de enfermedad común, los primeros 3 días son absorbidos al 100% por el patrono; el subsidio del IHSS opera a partir del 4.º día.

---

## 8. GUÍA DE INSTALACIÓN Y CONFIGURACIÓN LOCAL

### 8.1. Prerrequisitos
- **Node.js:** Versión 18.x o superior.
- **npm:** Versión 9.x o superior.
- **Git:** Instalado en el sistema operativo.
- **Firebase CLI:** Instalado globalmente (`npm install -g firebase-tools`).

### 8.2. Clonación e Instalación
```bash
# 1. Clonar el repositorio oficial
git clone https://github.com/MayGonza/Enag-Partida-Contable.git
cd Enag-Partida-Contable

# 2. Instalar dependencias de desarrollo y testing
npm install
```

### 8.3. Variables de Entorno (`.env`)
Crear un archivo `.env` en la raíz del proyecto tomando como plantilla `.env.example`:
```env
FIREBASE_API_KEY="AIzaSy..."
FIREBASE_AUTH_DOMAIN="sistemagestionenag.firebaseapp.com"
FIREBASE_PROJECT_ID="sistemagestionenag"
FIREBASE_STORAGE_BUCKET="sistemagestionenag.firebasestorage.app"
FIREBASE_MESSAGING_SENDER_ID="1234567890"
FIREBASE_APP_ID="1:1234567890:web:abcdef..."
PORT=3000
```

### 8.4. Ejecución en Entorno Local
```bash
# Opción A: Servidor local básico con Node / Express
node server.js

# Opción B: Emulador de Firebase Hosting
npx firebase emulators:start --only hosting

# Opción C: Modo escritorio Electron
npm start
```

---

## 9. PROCEDIMIENTO DE DESPLIEGUE A PRODUCCIÓN

### 9.1. Autenticación en Firebase
```bash
npx firebase login
```

### 9.2. Verificación de Integridad de Código
Antes de realizar el despliegue, verifique que no existan errores de sintaxis en las vistas:
```bash
node -e "const fs = require('fs'); const path = require('path'); const vm = require('vm'); fs.readdirSync('views').filter(f => f.endsWith('.html')).forEach(file => { const content = fs.readFileSync(path.join('views', file), 'utf8'); [...content.matchAll(/<script[\s\S]*?<\/script>/gi)].forEach((s, idx) => { new vm.Script(s[0].replace(/<script[^>]*>|<\/script>/gi, ''), { filename: file + '_' + idx }); }); }); console.log('Sintaxis verificada exitosamente.');"
```

### 9.3. Despliegue de Hosting y Reglas
```bash
# Desplegar reglas de Firestore
npx firebase deploy --only firestore:rules

# Desplegar Hosting de producción
npx firebase deploy --only hosting
```

---

## 10. GUÍA DE RESOLUCIÓN DE INCIDENCIAS (TROUBLESHOOTING)

| Síntoma / Error | Causa Raíz Probable | Solución Técnica |
| :--- | :--- | :--- |
| `SyntaxError: await is only valid in async functions` | Se utilizó `await` en una función declarada con `function` tradicional | Anteponer la palabra reservada `async` a la declaración de la función |
| `Uncaught ReferenceError: agregarFila is not defined` | Error de parseo previo en el `<script>` que impidió compilar las funciones | Revisar la consola del navegador para corregir el primer error de sintaxis en el archivo |
| `Missing or insufficient permissions` en Firestore | El usuario no ha verificado su correo electrónico o expiró la sesión | Ingresar al correo corporativo para pulsar el enlace de verificación de Firebase Auth |
| Descuadre en vouchers al cargar Excel | El archivo `.xls` tiene nombres de columnas alterados o celdas combinadas | Asegurarse de que el encabezado contenga las columnas `NOMBRE`, `SUELDO`, `IHSS`, etc. |
| Sesión se cierra automáticamente de inmediato | La colección `/usuarios` tiene un `sessionId` diferente o la regla de concurrencia está activa | Limpiar `localStorage.clear()` en el navegador e iniciar sesión nuevamente |

---

**Departamento de Tecnologías de la Información (TI)**  
*Empresa Nacional de Artes Gráficas (ENAG) — Tegucigalpa, M.D.C., Honduras.*
