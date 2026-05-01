

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, ArrowRight } from 'lucide-react';
import axios from 'axios';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [userCountry, setUserCountry] = useState({ code: 'US', currency: 'USD' });

  // 1. ተጠቓሚ ካበይ ምዃኑ ባዕሉ የለሊ (CORS ጸገም ዘይብሉ API)
  useEffect(() => {
    axios.get('https://demo.ip-api.com/json/') 
      .then(res => {
        const countryCode = res.data.countryCode; 
        let detectedCurrency = 'USD';

        // ንኣፍሪቃውያን ሃገራት ብቐሊሉ የለሊ
        if (countryCode === 'UG') detectedCurrency = 'UGX';
        else if (countryCode === 'ET') detectedCurrency = 'ETB';
        else if (countryCode === 'KE') detectedCurrency = 'KES';

        setUserCountry({ code: countryCode, currency: detectedCurrency });
        console.log("Region Detected Successfully:", detectedCurrency);
      })
      .catch(() => {
        console.log("Detection failed, defaulting to USD");
        setUserCountry({ code: 'US', currency: 'USD' });
      });
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fullPhoneNumber = `+${formData.phone}`; 

    try {
      const response = await axios.post("http://localhost:5000/api/auth/register", {
        email: formData.email,
        phone: fullPhoneNumber,
        currency: userCountry.currency 
      });

      if (response.data.success) {
        navigate('/verify-otp', { 
          state: { 
            email: formData.email, 
            phone: fullPhoneNumber, 
            otp: response.data.otp,
            isExistingUser: response.data.isExistingUser, 
            currency: userCountry.currency 
          } 
        });
      }
    } catch (err) { 
      alert(err.response?.data?.msg || "Error occurred during registration!"); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="fixed inset-0 bg-[#020617] flex items-center justify-center p-6 text-white font-sans">
      <div className="w-full max-w-md space-y-8 bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-xl">
        <div className="text-center">
          <h1 className="text-3xl font-black text-yellow-500 italic uppercase leading-none">Habesha Tele</h1>
          <p className="text-white/50 text-sm mt-3 font-medium uppercase tracking-widest">Create New Account</p>
          <p className="text-[10px] opacity-30 mt-1 uppercase tracking-widest italic">Region: {userCountry.currency}</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-4 text-white/30" size={20} />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 outline-none focus:border-yellow-500 transition-all"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            
            <div className="relative flex items-center">
              <Phone className="absolute left-4 text-white/30" size={20} />
              <span className="absolute left-12 text-lg font-bold text-white/50">+</span>
              <input
                type="tel"
                placeholder="256..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-16 outline-none focus:border-yellow-500 transition-all font-mono tracking-wider"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full bg-yellow-500 hover:bg-yellow-600 text-black font-black p-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? <span className="animate-pulse text-xs uppercase font-bold">Processing...</span> : <>REGISTER NOW <ArrowRight size={20} /></>}
          </button>
        </form>

        <p className="text-center text-sm text-white/30 font-medium">
          Already have an account?{" "}
          <span className="text-yellow-500 cursor-pointer font-bold hover:underline italic" onClick={() => navigate('/login')}>
            Login Here
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;