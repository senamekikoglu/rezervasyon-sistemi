import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import TesisYapisi from './pages/TesisYapisi';
import Rezervasyonlar from './pages/Rezervasyonlar';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/tesis-yapisi"
          element={
            <ProtectedRoute>
              <TesisYapisi />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rezervasyonlar"
          element={
            <ProtectedRoute>
              <Rezervasyonlar />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;