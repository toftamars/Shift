import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import PlannerPage from './pages/PlannerPage';
import { RequireAuth } from './components/RequireAuth';
import { AuthInit } from './components/AuthInit';

function App() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', pointerEvents: 'auto' }}>
      <div className="grain-overlay" aria-hidden="true" />
      <AuthInit>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <PlannerPage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </AuthInit>
    </div>
  );
}

export default App;
