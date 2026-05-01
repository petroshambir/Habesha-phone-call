
import React, { useState, useEffect } from "react";
import axios from "axios";
import { PlusCircle, Globe } from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState([]);
  // Phone መጀመርታ "+" ንክህልዎ ንገብር
  const [manualData, setManualData] = useState({ phone: "+", minutes: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchStats(); }, []);

const fetchStats = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/admin/stats");
    if (res.data.success) {
      
      const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

      const formattedData = res.data.stats.map(item => {
        let countryName = "Unknown";
        try {
          // item._id እቲ "UG" ወይ "ET" ሒዙ ዝመጸ እዩ
          if (item._id && item._id !== "Unknown") {
            countryName = regionNames.of(item._id);
          }
        } catch (e) {
          countryName = item._id || "Other";
        }

        return {
          name: countryName,
          value: item.count || 0 // <--- ኣብዚኣ እያ እታ መፍትሒ (item.count)
        };
      });
      
      setStats(formattedData);
    }
  } catch (err) { 
    console.error("Error fetching stats", err); 
  }
};

  const handleManualUpdate = async () => {
    // ቼክ ንገብር እንተተመሊኡ
    if (manualData.phone === "+" || !manualData.minutes) return alert("በጃኻ ኩሉ መልእ!");
    setLoading(true);
    try {
      const res = await axios.put("http://localhost:5000/api/admin/manual-update", {
        phone: manualData.phone,
        minutesToAdd: manualData.minutes
      });
      if (res.data.success) {
        alert(`ተዓዊቱ! ሓድሽ ባላንስ: ${res.data.newBalance}`);
        setManualData({ phone: "+", minutes: "" }); // Reset ምስ "+"
        fetchStats();
      }
    } catch (err) { alert("ጌጋ ኣሎ!"); }
    setLoading(false);
  };

  // ጠቕላላ ተጠቐምቲ ንምፍላጥ (ንፐርሰንት ዝጠቅም)
  const totalUsers = stats.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8 font-sans">
      <h1 className="text-3xl font-black text-yellow-500 mb-8 italic uppercase tracking-tighter italic">Admin Control Panel</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* ጸጋም ወገን: በብሃገሩ ዘሎ ፐርሰንት (Voting Style) */}
        <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <Globe className="text-blue-400" />
            <h2 className="text-xl font-bold uppercase tracking-widest">User Distribution</h2>
          </div>

          <div className="space-y-6">
            {stats.length > 0 ? stats.map((item, i) => {
              const percentage = totalUsers > 0 ? Math.round((item.value / totalUsers) * 100) : 0;
              return (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="font-black text-yellow-500 uppercase tracking-tighter">{item.name}</span>
                    <span className="text-xs font-bold opacity-60">{percentage}% ({item.value} Users)</span>
                  </div>
                  {/* Progress Bar (መስመር) */}
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500 rounded-full transition-all duration-1000"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            }) : <p className="opacity-20 italic">No data yet...</p>}
          </div>
        </div>

        {/* የማን ወገን: Manual Update Card */}
        <div className="bg-white/5 p-6 rounded-3xl border border-white/10 h-fit">
          <div className="flex items-center gap-3 mb-6 text-green-400">
            <PlusCircle />
            <h2 className="text-xl font-bold uppercase">Manual Minutes Load</h2>
          </div>
          <div className="space-y-4">
            {/* Phone Input ምስ "+" Default */}
            <div className="relative">
              <input 
                type="text" 
                placeholder="Phone (e.g. 256...)" 
                className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl outline-none focus:border-yellow-500 font-mono text-lg"
                value={manualData.phone}
                onChange={(e) => {
                  const val = e.target.value;
                  // "+" ንከይድመሰስ ንከላኸል
                  if (val.startsWith("+")) {
                    setManualData({...manualData, phone: val});
                  }
                }} 
              />
            </div>

            <input 
              type="number" 
              placeholder="Minutes to add" 
              className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl outline-none focus:border-yellow-500 font-mono"
              value={manualData.minutes}
              onChange={(e) => setManualData({...manualData, minutes: e.target.value})} 
            />
            
            <button 
              onClick={handleManualUpdate} 
              disabled={loading} 
              className="w-full bg-yellow-500 text-black font-black p-4 rounded-2xl active:scale-95 transition-all uppercase tracking-widest shadow-lg shadow-yellow-500/10"
            >
              {loading ? "Updating..." : "Add Minutes Now"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;