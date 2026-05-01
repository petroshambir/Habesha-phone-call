
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Phone, ArrowRight } from 'lucide-react';
// import axios from 'axios';

// function Login() {
//   const navigate = useNavigate();
//   const [phone, setPhone] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
    
//     // + ምስቲ ተጠቓሚ ዝጸሓፎ ቁጽሪ ንመዝግቦ
//     const fullPhoneNumber = `+${phone}`;

//     try {
//       const response = await axios.post("http://localhost:5000/api/auth/login", { 
//         phone: fullPhoneNumber // ምሉእ ቁጽሪ ምስ + ይሰድድ
//       });

//       if (response.data.success) {
//         navigate('/home', { state: { userPhone: fullPhoneNumber } });
//       }
//     } catch (err) {
//       if (err.response && err.response.status === 404) {
//         alert("እዚ ቁጽሪ እዚ ኣይተመዝገበን። በጃኻ ቅድሚ ሎጊን ምግባርካ ተመዝገብ!");
//         navigate('/'); 
//       } else {
//         alert("ገለ ጸገም ተፈጢሩ። በጃኻ ደሓር ፈትን።");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };
//   const handleLogin = async (e) => {
//     // ... logic
//     const response = await axios.post("http://localhost:5000/api/auth/login-admin", { email, password });

//     if (response.data.isAdmin) {
//         // Admin እንተኾይኑ ናብ Dashboard ይሰዶ
//         navigate("/admin-dashboard");
//     } else {
//         // ተራ ተጠቓሚ እንተኾይኑ ናብ Home ይሰዶ
//         navigate("/home");
//     }
// };

//   return (
//     <div className="fixed inset-0 bg-[#020617] flex items-center justify-center p-6 text-white">
//       <div className="w-full max-w-md bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-xl">
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-black text-yellow-500 italic uppercase leading-none">Habesha Tele</h1>
//           <p className="text-white/50 text-[10px] mt-2 font-bold uppercase tracking-widest">Login with Phone</p>
//         </div>

//         <form onSubmit={handleLogin} className="space-y-6">
//           <div className="relative flex items-center">
//             <Phone className="absolute left-4 text-yellow-500/50" size={20} />
//             {/* እዛ span እያ ነቲ + ምልክት እተርእዮ */}
//             <span className="absolute left-12 text-lg font-bold text-white/50">+</span>
//             <input
//               type="tel"
//               placeholder="251..."
//               className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-16 outline-none focus:border-yellow-500 text-lg font-mono tracking-wider"
//               value={phone}
//               onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} // ቁጽሪ ጥራይ ንኪጸሕፍ
//               required
//             />
//           </div>
//           <button 
//             type="submit" 
//             disabled={loading}
//             className={`w-full bg-yellow-500 text-black font-black p-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
//           >
//             {loading ? "CHECKING..." : "LOGIN"} <ArrowRight size={20} />
//           </button>
//         </form>
//         <p className="text-center text-xs text-white/30 mt-6 font-medium">
//           New here? <span className="text-yellow-500 cursor-pointer font-bold hover:underline" onClick={() => navigate('/')}>Create Account First</span>
//         </p>
//       </div>
//     </div>
//   );
// }

// export default Login;


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, ArrowRight, Lock, Mail, User } from 'lucide-react';
import axios from 'axios';

function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Admin States
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPass, setAdminPass] = useState('');

  // 1. ተራ ተጠቓሚ ሎጊን (Phone)
  const handleUserLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fullPhoneNumber = `+${phone}`;
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", { 
        phone: fullPhoneNumber 
      });
      if (response.data.success) {
        localStorage.setItem("userPhone", fullPhoneNumber);
        navigate('/home', { state: { userPhone: fullPhoneNumber } });
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        alert("እዚ ቁጽሪ እዚ ኣይተመዝገበን። በጃኻ ቅድሚ ሎጊን ምግባርካ ተመዝገብ!");
        navigate('/'); 
      } else {
        alert("ገለ ጸገም ተፈጢሩ።");
      }
    } finally { setLoading(false); }
  };

  // 2. ኣድሚን ሎጊን (Email & Password)
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login-admin", { 
        email: adminEmail, 
        password: adminPass 
      });
      if (response.data.isAdmin) {
        navigate("/admin-dashboard");
      }
    } catch (err) {
      alert(err.response?.data?.msg || "ኣድሚን ኣይኮንካን!");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-[#020617] flex items-center justify-center p-6 text-white font-sans">
      <div className="w-full max-w-md bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-xl shadow-2xl">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-yellow-500 italic uppercase leading-none">Habesha Tele</h1>
          <p className="text-white/50 text-[10px] mt-2 font-bold uppercase tracking-widest">
            {isAdminMode ? "Admin Control Access" : "Login with Phone"}
          </p>
        </div>

        {/* ፎርም ምስቲ Mode ይቀያየር */}
        {!isAdminMode ? (
          <form onSubmit={handleUserLogin} className="space-y-6">
            <div className="relative flex items-center">
              <Phone className="absolute left-4 text-yellow-500/50" size={20} />
              <span className="absolute left-12 text-lg font-bold text-white/50">+</span>
              <input
                type="tel"
                placeholder="251..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-16 outline-none focus:border-yellow-500 text-lg font-mono tracking-wider transition-all"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-yellow-500 text-black font-black p-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-yellow-500/20"
            >
              {loading ? "CHECKING..." : "LOGIN"} <ArrowRight size={20} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-4 text-white/30" size={20} />
              <input
                type="email"
                placeholder="Admin Email"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 outline-none focus:border-yellow-500"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-4 text-white/30" size={20} />
              <input
                type="password"
                placeholder="Password"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 outline-none focus:border-yellow-500"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-red-600 text-white font-black p-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              {loading ? "VERIFYING..." : "ENTER DASHBOARD"}
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-4 text-center">
          {!isAdminMode ? (
            <>
              <p className="text-xs text-white/30 font-medium">
                New here? <span className="text-yellow-500 cursor-pointer font-bold hover:underline" onClick={() => navigate('/')}>Create Account</span>
              </p>
              <button 
                onClick={() => setIsAdminMode(true)}
                className="text-[10px] text-white/20 uppercase tracking-[0.2em] hover:text-white transition-colors"
              >
                — Admin Portal —
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsAdminMode(false)}
              className="text-xs text-yellow-500 font-bold hover:underline"
            >
              Back to User Login
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

export default Login;