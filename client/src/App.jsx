

// import React from 'react';
// import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
// import Register from './pages/Register';
// import Home from './pages/Home';
// import Login from './pages/Login';
// import VerifyOTP from './components/VerifyOTP';
// import BuyCard from "./components/BuyCard";
// import AdminDashboard from './components/AdminDashboard';

// function App() {
//   return (
//     <Routes>
//       {/* 1. ምዝገባ (Register) */}
//       <Route path="/" element={<Register />} />
      
//       {/* 2. ኮድ መረጋገጺ (Verify OTP) */}
//       <Route path="/verify-otp" element={<VerifyOTP />} />
      
//       {/* 3. ሎግ-ኢን (Login) */}
//       <Route path="/login" element={<Login />} />
      
//       {/* 4. ቀንዲ ገጽ (Home) - ካብ Login ወይ Verify ዝመጸ Phone ይጥቀም */}
//       <Route path="/home" element={<HomeWithState />} />
//       <Route path="/buy-card" element={<BuyCard />} />
//       {/* ዘይፍለጥ Path እንተመጸ ናብ Register ክምለስ */}
//       <Route path="*" element={<Navigate to="/" />} />
//       <Route path="/admin-dashboard" element={<AdminDashboard />} />
//     </Routes>
//   );
// }

// // እዚ ንእሽቶ Helper Component እዩ፣ ነቲ Phone ካብ State ንምውሳድ
// function HomeWithState() {
//   const location = useLocation();
//   const phone = location.state?.userPhone || "No Phone";
  
//   // 🔄 እታ ዝተስተኻኸለት ክፍሊ፦ ሎግኣውት ክንጭብጥ ከለኻ ነቲ deviceId ከይተንከፍና፣ ቁጽሪ ስልኪ ጥራሕ ካብ localStorage ተወግድ
//   const handleLogout = () => {
//     localStorage.removeItem("userPhone"); // 👈 ቁጽሪ ስልኪ ጥራሕ ኣልግስ
//     // ⚠️ ነታ localStorage.getItem("deviceId") ፍጹም ከይነካእካያ ንሓልፋ!
//     window.location.href = '/login'; // ናብ ሎጊን ገጽ ምምላስ
//   };
  
//   return <Home phone={phone} onLogout={handleLogout} />;
// }

// export default App;


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
      {/* 1. መጀመርታ Login ገጽ */}
      <Route path="/" element={<Login />} />

      {/* 2. Register ገጽ */}
      <Route path="/register" element={<Register />} />

      {/* 3. OTP መረጋገጺ */}
      <Route path="/verify-otp" element={<VerifyOTP />} />

      {/* 4. Login */}
      <Route path="/login" element={<Login />} />

      {/* 5. Home */}
      <Route path="/home" element={<HomeWithState />} />

      {/* 6. Buy Card */}
      <Route path="/buy-card" element={<BuyCard />} />

      {/* 7. Admin Dashboard */}
      <Route path="/admin-dashboard" element={<AdminDashboard />} />

      {/* 8. ዘይፍለጥ URL ናብ Login ይመለስ */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function HomeWithState() {
  const location = useLocation();
  const phone =
    location.state?.userPhone ||
    localStorage.getItem("userPhone") ||
    "No Phone";

  const handleLogout = () => {
    localStorage.removeItem("userPhone");
    window.location.href = '/login';
  };

  return <Home phone={phone} onLogout={handleLogout} />;
}

export default App;
