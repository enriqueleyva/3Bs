# Next.js + Google Apps Script (Google Sheets) — Registro de productos

Esta app es una sola página con:
- Barra de texto con **autocompletado** (lista local de productos)
- Botón **"Registrar"** que hace un **POST** a tu Web App de Google Apps Script (el que inserta en la hoja)
- Configurada para **exportarse como sitio estático**, generando `out/index.html`

## 1) Requisitos
- Node.js 18+ (recomendado)

## 2) Configurar la URL del Apps Script
1. Copia `.env.example` a `.env.local`.
2. En `.env.local`, pega tu URL del Web App:

```bash
NEXT_PUBLIC_GOOGLE_SCRIPT_URL="https://script.google.com/macros/s/XXXXXXXXXXXX/exec"
```

> Importante: En Next.js, para que una variable esté disponible en el navegador debe empezar con `NEXT_PUBLIC_`.

## 3) Instalar y ejecutar

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

## 4) Exportar a HTML (static export)

```bash
npm run build
```

Con `output: 'export'`, Next.js genera la salida estática en la carpeta:
- `out/index.html`
- `out/_next/...` (assets JS/CSS)

> Si te piden “un archivo HTML”, el principal es `out/index.html`, pero normalmente requiere la carpeta `_next` para funcionar.

## 5) Cambiar la lista de productos
Edita `PRODUCTOS` en `app/page.js` y reemplázalo por tu catálogo.

---

# Apps Script: ejemplo mínimo de doPost + CORS

Si tu endpoint ya existe, ignora esto. Si necesitas un ejemplo, aquí va un `Code.gs` típico:

```javascript
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents || "{}");

    // TODO: ajusta por tu hoja
    var ss = SpreadsheetApp.openById('TU_SPREADSHEET_ID');
    var sh = ss.getSheetByName('Hoja1');

    sh.appendRow([
      new Date(),
      data.producto || "",
      data.fechaISO || "",
      data.fuente || ""
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type');

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
}

// (Opcional) preflight CORS
function doOptions() {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
```

### Deploy recomendado
En Apps Script:
- **Deploy → New deployment → Web app**
- Execute as: **Me**
- Who has access: **Anyone** (o “Anyone with the link” según tu caso)

Si ves errores CORS en consola, revisa que tu respuesta incluya `Access-Control-Allow-Origin`.
