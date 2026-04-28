
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, ArrowRight } from 'lucide-react';
import axios from 'axios';

function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // + ምስቲ ተጠቓሚ ዝጸሓፎ ቁጽሪ ንመዝግቦ
    const fullPhoneNumber = `+${phone}`;

    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", { 
        phone: fullPhoneNumber // ምሉእ ቁጽሪ ምስ + ይሰድድ
      });

      if (response.data.success) {
        navigate('/home', { state: { userPhone: fullPhoneNumber } });
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        alert("እዚ ቁጽሪ እዚ ኣይተመዝገበን። በጃኻ ቅድሚ ሎጊን ምግባርካ ተመዝገብ!");
        navigate('/'); 
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
          <h1 className="text-3xl font-black text-yellow-500 italic uppercase leading-none">Habesha Tele</h1>
          <p className="text-white/50 text-[10px] mt-2 font-bold uppercase tracking-widest">Login with Phone</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative flex items-center">
            <Phone className="absolute left-4 text-yellow-500/50" size={20} />
            {/* እዛ span እያ ነቲ + ምልክት እተርእዮ */}
            <span className="absolute left-12 text-lg font-bold text-white/50">+</span>
            <input
              type="tel"
              placeholder="251..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-16 outline-none focus:border-yellow-500 text-lg font-mono tracking-wider"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} // ቁጽሪ ጥራይ ንኪጸሕፍ
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full bg-yellow-500 text-black font-black p-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? "CHECKING..." : "LOGIN"} <ArrowRight size={20} />
          </button>
        </form>
        <p className="text-center text-xs text-white/30 mt-6 font-medium">
          New here? <span className="text-yellow-500 cursor-pointer font-bold hover:underline" onClick={() => navigate('/')}>Create Account First</span>
        </p>
      </div>
    </div>
  );
}

export default Login;