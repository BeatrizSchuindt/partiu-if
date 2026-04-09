import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Login } from './pages/Login';
import { Monitor } from './pages/Monitor';
import { Coordenacao } from './pages/Coordenacao';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route 
          path="/monitor" 
          element={
            <ProtectedRoute allowedRole="monitor">
              <Monitor />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/coordenacao" 
          element={
            <ProtectedRoute allowedRole="coordenacao">
              <Coordenacao />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;