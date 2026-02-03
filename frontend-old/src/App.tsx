import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import PlannerPage from './pages/PlannerPage';
import { PersonelPage } from './pages/PersonelPage';
import { DepartmanlarPage } from './pages/DepartmanlarPage';
import { VardiyaTurleriPage } from './pages/VardiyaTurleriPage';
import { AyarlarPage } from './pages/AyarlarPage';
import { RequireAuth } from './components/RequireAuth';
import { AuthInit } from './components/AuthInit';

function App() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', pointerEvents: 'auto' }}>
      <div className="grain-overlay" aria-hidden="true" />
      <AuthInit>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RequireAuth><PlannerPage /></RequireAuth>} />
      <Route path="/personel" element={<RequireAuth><PersonelPage /></RequireAuth>} />
      <Route path="/departmanlar" element={<RequireAuth><DepartmanlarPage /></RequireAuth>} />
      <Route path="/vardiya-turleri" element={<RequireAuth><VardiyaTurleriPage /></RequireAuth>} />
      <Route path="/ayarlar" element={<RequireAuth><AyarlarPage /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </AuthInit>
    </div>
  );
}

export default App;
