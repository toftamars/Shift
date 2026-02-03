import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import PlannerPage from './pages/PlannerPage';
import { RequireAuth } from './components/RequireAuth';
import { AuthInit } from './components/AuthInit';

function App() {
  return (
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
  );
}

export default App;
