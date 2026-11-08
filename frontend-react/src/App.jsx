import { Routes, Route, Navigate } from 'react-router-dom';
import Sumayni from './pages/Sumayni.jsx';
import Servicios from './pages/Servicios.jsx';
import Favores from './pages/Favores.jsx';
import Mapa from './pages/Mapa.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/sumayni" replace />} />
      <Route path="/sumayni" element={<Sumayni />} />
      <Route path="/servicios" element={<Servicios />} />
      <Route path="/favores" element={<Favores />} />
      <Route path="/mapa" element={<Mapa />} />
    </Routes>
  );
}
