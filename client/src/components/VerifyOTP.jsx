// import React, { useState, useEffect } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import axios from 'axios';

// function VerifyOTP() {
//   const { state } = useLocation(); 
//   const navigate = useNavigate();
//   const [userOtp, setUserOtp] = useState('');
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (!state || !state.email) {
//       navigate('/'); 
//     }
//   }, [state, navigate]);

//   const handleVerify = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       // *** እዚኣ እታ ዝተስተኻኸለት መስመር ***
//       // 'isExistingUser' ናብ Backend ክሓልፍ ኣለዎ፡ እንተዘይኮይኑ Database Error ይፈጥር
//       const res = await axios.post("https://habesha-phone-call-4.onrender.com/api/auth/verify-otp", {
//         email: state.email,
//         phone: state.phone,
//         userOtp: userOtp,
//         actualOtp: state.otp,
//         isExistingUser: state.isExistingUser // <--- እዚኣ እያ እታ ዝጎደለት!
//       });

//       if (res.data.success) {
//         // localStorage.setItem("userPhone", state.phone); // እዚኣ እንተደለኻያ ወስኻያ
//         navigate('/home', { state: { userPhone: state.phone } });
//       }
//     } catch (err) {
//       alert(err.response?.data?.msg || "ዝኣተወ ኮድ ጌጋ እዩ፡ በጃኻ ደጊምካ ፈትን።");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-[#020617] flex items-center justify-center p-6 text-white text-center">
//       <div className="w-full max-w-md bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-xl">
//         <h2 className="text-2xl font-black text-yellow-500 mb-4 italic uppercase tracking-tighter">Verify Email</h2>
        
//         <p className="text-white/50 mb-6 text-sm">
//           ናብ <span className="text-white font-bold">{state?.email}</span> ዝተላእከ 4-ዲጂት ኮድ ኣእቱ
//         </p>
        
//         <form onSubmit={handleVerify} className="space-y-6">
//           <input
//             type="text"
//             maxLength="4"
//             placeholder="0000"
//             className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-center text-4xl tracking-[1rem] outline-none focus:border-yellow-500 font-mono transition-all"
//             value={userOtp}
//             onChange={(e) => setUserOtp(e.target.value)}
//             required
//             autoFocus 
//           />
//           <button 
//             type="submit" 
//             disabled={loading} 
//             className={`w-full bg-yellow-500 text-black font-black p-4 rounded-2xl active:scale-95 transition-all ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-yellow-400'}`}
//           >
//             {loading ? "VERIFYING..." : "VERIFY & CONTINUE"}
//           </button>
//         </form>
        
//         <button 
//           onClick={() => navigate('/')} 
//           className="mt-6 text-xs text-white/30 hover:text-yellow-500 transition-colors uppercase font-bold"
//         >
//           Change Email / Phone
//         </button>
//       </div>
//     </div>
//   );
// }

// export default VerifyOTP;



// import React, { useState, useEffect } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import axios from 'axios';

// function VerifyOTP() {
//   const { state } = useLocation();
//   const navigate = useNavigate();

//   const [userOtp, setUserOtp] = useState('');
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (!state || !state.email || !state.phone) {
//       navigate('/', { replace: true });
//     }
//   }, [state, navigate]);

//   const handleVerify = async (e) => {
//     e.preventDefault();

//     if (!state?.email || !state?.phone) {
//       navigate('/', { replace: true });
//       return;
//     }

//     if (!/^\d{4}$/.test(userOtp)) {
//       alert('Please enter the complete 4-digit verification code.');
//       return;
//     }

//     setLoading(true);

//     try {
//       const res = await axios.post(
//         'https://habesha-phone-call-4.onrender.com/api/auth/verify-otp',
//         {
//           email: state.email,
//           phone: state.phone,
//           userOtp,
//           currency: state.currency || 'USD'
//         }
//       );

//       if (res.data.success) {
//         navigate('/home', {
//           replace: true,
//           state: {
//             userPhone: res.data.user?.phoneNumber || state.phone
//           }
//         });
//       } else {
//         alert(
//           res.data.msg ||
//           'Verification failed. Please try again.'
//         );
//       }
//     } catch (err) {
//       alert(
//         err.response?.data?.msg ||
//         'ዝኣተወ ኮድ ጌጋ እዩ፡ በጃኻ ደጊምካ ፈትን።'
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-[#020617] flex items-center justify-center p-6 text-white text-center">
//       <div className="w-full max-w-md bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-xl">
//         <h2 className="text-2xl font-black text-yellow-500 mb-4 italic uppercase tracking-tighter">
//           Verify Email
//         </h2>

//         <p className="text-white/50 mb-6 text-sm">
//           ናብ{' '}
//           <span className="text-white font-bold">
//             {state?.email}
//           </span>{' '}
//           ዝተላእከ 4-ዲጂት ኮድ ኣእቱ
//         </p>

//         <div className="mb-6 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-left">
//           <p className="text-sm font-bold text-yellow-400 mb-2">
//             📧 Email Verification Notice
//           </p>

//           <p className="text-sm leading-6 text-white/80">
//             ናብ ኢመይልካ ናይ መረጋገጺ ኮድ ሰዲድናልካ ኣለና። ኣብ ኢመይልካ እቲ ኮድ ርአ እሞ ኣብዚ ኣእትዎ። እቲ ኮድ ን10 ደቂቕ ጥራይ እዩ ዝሰርሕ።
//           </p>

//           <p className="mt-3 text-xs leading-5 text-white/50">
//             ኣብ Inbox እንተዘይረኺብካዮ፣ Spam ወይ Junk folder እውን ኣረጋግጽ።
//           </p>
//         </div>

//         <form onSubmit={handleVerify} className="space-y-6">
//           <input
//             type="text"
//             inputMode="numeric"
//             pattern="[0-9]{4}"
//             maxLength={4}
//             placeholder="0000"
//             className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-center text-4xl tracking-[1rem] outline-none focus:border-yellow-500 font-mono transition-all"
//             value={userOtp}
//             onChange={(e) =>
//               setUserOtp(
//                 e.target.value.replace(/\D/g, '').slice(0, 4)
//               )
//             }
//             required
//             autoFocus
//           />

//           <button
//             type="submit"
//             disabled={loading || userOtp.length !== 4}
//             className={`w-full bg-yellow-500 text-black font-black p-4 rounded-2xl active:scale-95 transition-all ${
//               loading || userOtp.length !== 4
//                 ? 'opacity-50 cursor-not-allowed'
//                 : 'hover:bg-yellow-400'
//             }`}
//           >
//             {loading ? 'VERIFYING...' : 'VERIFY & CONTINUE'}
//           </button>
//         </form>

//         <button
//           type="button"
//           onClick={() => navigate('/')}
//           className="mt-6 text-xs text-white/30 hover:text-yellow-500 transition-colors uppercase font-bold"
//         >
//           Change Email / Phone
//         </button>
//       </div>
//     </div>
//   );
// }

// export default VerifyOTP;


import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

function VerifyOTP() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [userOtp, setUserOtp] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (
      !state ||
      !state.email ||
      !state.phone ||
      !state.actualOtp
    ) {
      navigate('/', { replace: true });
    }
  }, [state, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();

    if (
      !state?.email ||
      !state?.phone ||
      !state?.actualOtp
    ) {
      alert('Verification information is missing. Please register again.');
      navigate('/', { replace: true });
      return;
    }

    if (!/^\d{4}$/.test(userOtp)) {
      alert('Please enter the complete 4-digit verification code.');
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        'https://habesha-phone-call-4.onrender.com/api/auth/verify-otp',
        {
          email: state.email,
          phone: state.phone,
          userOtp: String(userOtp),
          actualOtp: String(state.actualOtp),
          isExistingUser: Boolean(state.isExistingUser),
          currency: state.currency || 'USD'
        }
      );

      if (res.data.success) {
        navigate('/home', {
          replace: true,
          state: {
            userPhone:
              res.data.user?.phoneNumber || state.phone
          }
        });
      } else {
        alert(
          res.data.msg ||
          'Verification failed. Please try again.'
        );
      }
    } catch (err) {
      console.error(
        'OTP Verification Error:',
        err.response?.data || err.message
      );

      alert(
        err.response?.data?.msg ||
        'ዝኣተወ ኮድ ጌጋ እዩ፡ በጃኻ ደጊምካ ፈትን።'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#020617] flex items-center justify-center p-6 text-white text-center">
      <div className="w-full max-w-md bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-xl">
        <h2 className="text-2xl font-black text-yellow-500 mb-4 italic uppercase tracking-tighter">
          Verify Email
        </h2>

        <p className="text-white/50 mb-6 text-sm">
          ናብ{' '}
          <span className="text-white font-bold">
            {state?.email}
          </span>{' '}
          ዝተላእከ 4-ዲጂት ኮድ ኣእቱ
        </p>

        <div className="mb-6 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-left">
          <p className="text-sm font-bold text-yellow-400 mb-2">
            📧 Email Verification Notice
          </p>

          <p className="text-sm leading-6 text-white/80">
            ናብ ኢመይልካ ናይ መረጋገጺ ኮድ ሰዲድናልካ ኣለና።
            ኣብ ኢመይልካ እቲ ኮድ ርአ እሞ ኣብዚ ኣእትዎ።
            እቲ ኮድ ን10 ደቂቕ ጥራይ እዩ ዝሰርሕ።
          </p>

          <p className="mt-3 text-xs leading-5 text-white/50">
            ኣብ Inbox እንተዘይረኺብካዮ፣ Spam ወይ Junk folder እውን ኣረጋግጽ።
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{4}"
            maxLength={4}
            placeholder="0000"
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-center text-4xl tracking-[1rem] outline-none focus:border-yellow-500 font-mono transition-all"
            value={userOtp}
            onChange={(e) =>
              setUserOtp(
                e.target.value.replace(/\D/g, '').slice(0, 4)
              )
            }
            required
            autoFocus
          />

          <button
            type="submit"
            disabled={
              loading ||
              userOtp.length !== 4 ||
              !state?.actualOtp
            }
            className={`w-full bg-yellow-500 text-black font-black p-4 rounded-2xl active:scale-95 transition-all ${
              loading || userOtp.length !== 4 || !state?.actualOtp
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-yellow-400'
            }`}
          >
            {loading ? 'VERIFYING...' : 'VERIFY & CONTINUE'}
          </button>
        </form>

        <button
          type="button"
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