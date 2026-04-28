import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

function VerifyOTP() {
  const { state } = useLocation(); 
  const navigate = useNavigate();
  const [userOtp, setUserOtp] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!state || !state.email) {
      navigate('/'); 
    }
  }, [state, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // *** እዚኣ እታ ዝተስተኻኸለት መስመር ***
      // 'isExistingUser' ናብ Backend ክሓልፍ ኣለዎ፡ እንተዘይኮይኑ Database Error ይፈጥር
      const res = await axios.post("http://localhost:5000/api/auth/verify-otp", {
        email: state.email,
        phone: state.phone,
        userOtp: userOtp,
        actualOtp: state.otp,
        isExistingUser: state.isExistingUser // <--- እዚኣ እያ እታ ዝጎደለት!
      });

      if (res.data.success) {
        // localStorage.setItem("userPhone", state.phone); // እዚኣ እንተደለኻያ ወስኻያ
        navigate('/home', { state: { userPhone: state.phone } });
      }
    } catch (err) {
      alert(err.response?.data?.msg || "ዝኣተወ ኮድ ጌጋ እዩ፡ በጃኻ ደጊምካ ፈትን።");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#020617] flex items-center justify-center p-6 text-white text-center">
      <div className="w-full max-w-md bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-xl">
        <h2 className="text-2xl font-black text-yellow-500 mb-4 italic uppercase tracking-tighter">Verify Email</h2>
        
        <p className="text-white/50 mb-6 text-sm">
          ናብ <span className="text-white font-bold">{state?.email}</span> ዝተላእከ 4-ዲጂት ኮድ ኣእቱ
        </p>
        
        <form onSubmit={handleVerify} className="space-y-6">
          <input
            type="text"
            maxLength="4"
            placeholder="0000"
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-center text-4xl tracking-[1rem] outline-none focus:border-yellow-500 font-mono transition-all"
            value={userOtp}
            onChange={(e) => setUserOtp(e.target.value)}
            required
            autoFocus 
          />
          <button 
            type="submit" 
            disabled={loading} 
            className={`w-full bg-yellow-500 text-black font-black p-4 rounded-2xl active:scale-95 transition-all ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-yellow-400'}`}
          >
            {loading ? "VERIFYING..." : "VERIFY & CONTINUE"}
          </button>
        </form>
        
        <button 
          onClick={() => navigate('/')} 
          className="mt-6 text-xs text-white/30 hover:text-yellow-500 transition-colors uppercase font-bold"
        >
          Change Email / Phone
        </button>
      </div>
    </div>
  );
}

export default VerifyOTP;