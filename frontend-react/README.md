# Sumayni – Frontend en React (Vite)

## Ejecutar

Desde la carpeta `frontend-react`:

```bash
npm install
test -f public/google-maps-config.js || cp public/google-maps-config.example.js public/google-maps-config.js
npm run dev
```

En PowerShell de Windows:

```powershell
npm install
if (-not (Test-Path public/google-maps-config.js)) {
  Copy-Item public/google-maps-config.example.js public/google-maps-config.js
}
npm run dev
```

Edita `public/google-maps-config.js` y configura una clave propia de Google Maps
con restricciones de dominio antes de usar el mapa. No sobrescribas ese archivo
si ya contiene tu clave.

Abre http://localhost:5173

## Estructura
- `src/pages/` – una página React por pantalla (Sumayni, Servicios, Favores, Mapa), convertidas del HTML original.
- `src/components/LegacyPage.jsx` – aplica los atributos del `<body>` y carga la lógica JS de cada página.
- `public/legacy/` – lógica JS original de cada pantalla (aún sin migrar a hooks/estado de React).
- `src/colores.css`, `src/estilos.css` – estilos originales.
- `public/google-maps-config.js` – clave de Google Maps (ignorada por git).
