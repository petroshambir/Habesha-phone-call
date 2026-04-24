import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, ArrowRight } from 'lucide-react';
import axios from 'axios'; // Axios ክንጥቀም ኣለና

function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 1. ናብቲ Backend (Node.js) Request ንሰድድ
      // እቲ URL ምስቲ ኣብ server.js ዘሎ Route (api/auth/login) ዝሰማማዕ ክኸውን ኣለዎ
      const response = await axios.post("http://localhost:5000/api/auth/login", { 
        phone: phone 
      });

      // 2. እቲ Backend ተጠቃሚ ረኺቡ እንተኾይኑ (success: true)
      if (response.data.success) {
        // ናብ Home ይለፍ፣ ነቲ ካብ DB ዝመጸ ስልኪ (phone) ከኣ ይለኣኽ
        navigate('/home', { state: { userPhone: phone } });
      }
    } catch (err) {
      // 3. እቲ ቁጽሪ ኣብ ዳታቤዝ እንተዘየለ (Backend 404 ወይ 400 እንተሰዲዱ)
      if (err.response && err.response.status === 404) {
        alert("እዚ ቁጽሪ እዚ ኣይተመዝገበን። በጃኻ ቅድሚ ሎጊን ምግባርካ ተመዝገብ!");
        navigate('/'); // ናብ Register ገጽ ይወስዶ
      } else {
        alert("ገለ ጸገም ተፈጢሩ። በጃኻ ደሓር ፈትን።");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#020617] flex items-center justify-center p-6 text-white">
      <div className="w-full max-w-md bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-yellow-500 italic uppercase">Habesha Tele</h1>
          <p className="text-white/50 text-[10px] mt-2 font-bold uppercase tracking-widest">Login with Phone</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <Phone className="absolute left-4 top-4 text-yellow-500/50" size={20} />
            <input
              type="tel"
              placeholder="Enter Registered Phone"
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 outline-none focus:border-yellow-500 text-lg"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full bg-yellow-500 text-black font-black p-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? "CHECKING..." : "LOGIN"} <ArrowRight size={20} />
          </button>
        </form>
        <p className="text-center text-xs text-white/30 mt-6 font-medium">
          New here? <span className="text-yellow-500 cursor-pointer font-bold" onClick={() => navigate('/')}>Create Account First</span>
        </p>
      </div>
    </div>
  );
}

export default Login;