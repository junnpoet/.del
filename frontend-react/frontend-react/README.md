# Sumayni – Frontend en React (Vite)

## Ejecutar
```bash
npm install
cp public/google-maps-config.example.js public/google-maps-config.js   # y pon tu API key
npm run dev
```
Abre http://localhost:5173

## Estructura
- `src/pages/` – una página React por pantalla (Sumayni, Servicios, Favores, Mapa), convertidas del HTML original.
- `src/components/LegacyPage.jsx` – aplica los atributos del `<body>` y carga la lógica JS de cada página.
- `public/legacy/` – lógica JS original de cada pantalla (aún sin migrar a hooks/estado de React).
- `src/colores.css`, `src/estilos.css` – estilos originales.
- `public/google-maps-config.js` – clave de Google Maps (ignorada por git).
