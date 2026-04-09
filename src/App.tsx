import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Login } from './pages/Login';
import { Monitor } from './pages/Monitor';
import { Coordenacao } from './pages/Coordenacao';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/monitor" element={<Monitor />} />
        <Route path="/coordenacao" element={<Coordenacao />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;