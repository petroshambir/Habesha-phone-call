import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, ArrowRight } from 'lucide-react';
import axios from 'axios';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 1. ናብ Backend (Port 5000) ዳታ ንሰድድ
      const response = await axios.post("http://localhost:5000/api/auth/register", {
        email: formData.email,
        phone: formData.phone
      });

      if (response.data.success) {
        // 2. ምስ ተዓወተ፡ ነቲ ካብ ሰርቨር ዝመጸ 'otp' ን ዳታን ሒዝና ናብ Verify ገጽ ንከይድ
        navigate('/verify-otp', { 
          state: { 
            email: formData.email, 
            phone: formData.phone, 
            otp: response.data.otp 
          } 
        });
      }
    } catch (err) {
      // ኢመይል እንተዘይተሰዲዱ ወይ ተጠቓሚ ድሮ እንተሃልዩ ዝመጽእ Error
      const errorMsg = err.response?.data?.msg || "ምዝገባ ኣይተዓወተን። በጃኻ ዳግም ፈትን።";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#020617] flex items-center justify-center p-6 text-white font-sans">
      <div className="w-full max-w-md space-y-8 bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-xl">
        
        <div className="text-center">
          <h1 className="text-3xl font-black text-yellow-500 italic uppercase tracking-tighter">Habesha Tele</h1>
          <p className="text-white/50 text-sm mt-2 font-medium uppercase tracking-widest">Create New Account</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-4">
            {/* Email Input */}
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-white/30" size={20} />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-3.5 pl-12 outline-none focus:border-yellow-500 transition-all"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>

            {/* Phone Number Input */}
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 text-white/30" size={20} />
              <input
                type="tel"
                placeholder="Phone Number"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-3.5 pl-12 outline-none focus:border-yellow-500 transition-all"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
              />
            </div>
          </div>

          {/* Register Button */}
          <button 
            type="submit"
            disabled={loading}
            className={`w-full bg-yellow-500 hover:bg-yellow-600 text-black font-black p-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-pulse">SENDING CODE...</span>
              </span>
            ) : (
              <>REGISTER NOW <ArrowRight size={20} /></>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-white/30 font-medium">
          Already have an account?{" "}
          <span 
            className="text-yellow-500 cursor-pointer font-bold hover:underline" 
            onClick={() => navigate('/login')}
          >
            Login Here
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;