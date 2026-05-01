import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Register from './pages/Register';
import Home from './pages/Home';
import Login from './pages/Login';
import VerifyOTP from './components/VerifyOTP';
import BuyCard from "./components/BuyCard";
import AdminDashboard from './components/AdminDashboard';

function App() {
  return (
    <Routes>
      {/* 1. ምዝገባ (Register) */}
      <Route path="/" element={<Register />} />
      
      {/* 2. ኮድ መረጋገጺ (Verify OTP) */}
      <Route path="/verify-otp" element={<VerifyOTP />} />
      
      {/* 3. ሎግ-ኢን (Login) */}
      <Route path="/login" element={<Login />} />
      
      {/* 4. ቀንዲ ገጽ (Home) - ካብ Login ወይ Verify ዝመጸ Phone ይጥቀም */}
      <Route path="/home" element={<HomeWithState />} />
      <Route path="/buy-card" element={<BuyCard />} />
      {/* ዘይፍለጥ Path እንተመጸ ናብ Register ክምለስ */}
      <Route path="*" element={<Navigate to="/" />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
    </Routes>
    
  );
}

// እዚ ንእሽቶ Helper Component እዩ፣ ነቲ Phone ካብ State ንምውሳድ
function HomeWithState() {
  const location = useLocation();
  const phone = location.state?.userPhone || "No Phone";
  
  return <Home phone={phone} onLogout={() => window.location.href = '/login'} />;
}

export default App;