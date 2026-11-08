import { useEffect } from 'react';

const BODY_CLASS = 'bg-slate-900 text-slate-800 font-sans min-h-screen flex items-center justify-center p-0 sm:p-4';

// Aplica los atributos del <body> y carga la lógica JS de la página una vez que el JSX ya está en el DOM.
export default function LegacyPage({ page, scripts, children }) {
  useEffect(() => {
    document.body.dataset.page = page;
    document.body.className = BODY_CLASS;
    const added = [];
    let cancelled = false;

    const load = (i) => {
      if (cancelled) return;
      if (i >= scripts.length) {
        // Los scripts originales esperan DOMContentLoaded, que ya ocurrió: se dispara de nuevo.
        document.dispatchEvent(new Event('DOMContentLoaded'));
        return;
      }
      const s = document.createElement('script');
      s.src = scripts[i];
      s.async = false;
      s.onload = () => load(i + 1);
      s.onerror = () => { console.error('No se pudo cargar', scripts[i]); load(i + 1); };
      document.body.appendChild(s);
      added.push(s);
    };
    load(0);

    return () => {
      cancelled = true;
      added.forEach((s) => s.remove());
    };
  }, [page]);

  return children;
}
