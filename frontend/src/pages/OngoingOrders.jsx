import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Clock, MapPin, Play, CheckCircle } from 'lucide-react';
import api from '../api/client';

export default function OngoingOrders() {
  const navigate = useNavigate();
  const [ongoingOrders, setOngoingOrders] = useState([]);
  const [vendor, setVendor] = useState({
    name: "Rahul Luhar",
    vendor_id: "12t37211"
  });
  const [loading, setLoading] = useState(true);
  const [stepping, setStepping] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/');
      // Filter for Accepted or Out for Delivery
      const filtered = res.data.filter(o => o.status === 'Accepted' || o.status === 'Out for Delivery');
      setOngoingOrders(filtered);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch stats
    api.get('/orders/stats').then(res => {
      setVendor(res.data);
    }).catch(err => console.error(err));

    fetchOrders();
  }, []);

  const handleSimulateStep = async (ref_no, currentStatus) => {
    setStepping(true);
    try {
      let nextStatus = "Out for Delivery";
      let subtext = "";
      if (currentStatus === "Accepted") {
        nextStatus = "Out for Delivery";
        subtext = "Delivery address lorem ipsum de sans color";
      } else if (currentStatus === "Out for Delivery") {
        nextStatus = "Completed";
      } else {
        return;
      }

      await api.post(`/orders/${ref_no}/step`, {
        status: nextStatus,
        subtext: subtext
      });
      await fetchOrders();
    } catch (err) {
      console.error("Error stepping simulation:", err);
    } finally {
      setStepping(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto w-full flex-grow flex flex-col gap-8">
      {/* Header Panel */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-800 font-display">Ongoing Orders</h2>
          <p className="text-xs text-slate-400 font-medium mt-1">Manage and track your active estamp and signing workflows</p>
        </div>
        
        {/* Profile Card */}
        <div className="flex items-center gap-3 bg-white border border-slate-100 py-1.5 pl-3 pr-4 rounded-full shadow-sm">
          <img 
            src={vendor.avatar_url || "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&q=80"} 
            alt="Rahul" 
            className="w-10 h-10 rounded-full object-cover border border-slate-200"
          />
          <div>
            <h4 className="text-sm font-bold text-slate-800 leading-none">{vendor.name}</h4>
            <span className="text-[11px] text-slate-400 font-semibold uppercase">Vendor ID: {vendor.vendor_id}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : ongoingOrders.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm flex flex-col items-center gap-4 max-w-xl mx-auto mt-10">
          <div className="w-16 h-16 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center shadow-inner">
            <Layers size={28} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">All Caught Up!</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-sm">There are no ongoing orders right now. Accept an incoming order on the Home dashboard to begin.</p>
          </div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-all shadow-md hover:shadow-blue-100"
          >
            Go to Home
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ongoingOrders.map(o => (
            <div key={o.ref_no} className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
              
              <div>
                <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">{o.token_name}</h3>
                    <span className="text-[11px] text-slate-400 font-semibold">Ref: {o.ref_no}</span>
                  </div>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wide">
                    {o.status}
                  </span>
                </div>

                {/* Timeline */}
                <div className="flex flex-col gap-4 relative before:absolute before:left-3 before:top-2 before:h-[calc(100%-16px)] before:w-0.5 before:bg-slate-100 mt-2">
                  {o.timeline.map((t, idx) => (
                    <div key={idx} className="flex gap-4 items-start relative z-10">
                      <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center border-4 border-white shadow bg-blue-600 text-white">
                        <CheckCircle size={10} className="fill-current" />
                      </div>
                      <div className="flex-grow">
                        <span className="text-[10px] text-slate-400 font-bold block">{t.time}</span>
                        <h4 className="text-xs font-bold text-slate-800">{t.title}</h4>
                        {t.subtext && (
                          <p className="text-[10px] text-slate-400 mt-1 leading-normal bg-slate-50 p-1.5 rounded border border-dashed border-slate-100">
                            {t.subtext}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3">
                <button 
                  onClick={() => navigate(`/order/${o.ref_no}`)}
                  className="flex-grow bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold py-2 px-4 rounded-xl text-xs transition-colors"
                >
                  View Details
                </button>
                
                <button 
                  onClick={() => handleSimulateStep(o.ref_no, o.status)}
                  disabled={stepping}
                  className="flex-grow bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1"
                >
                  <Play size={12} />
                  <span>
                    {o.status === 'Accepted' ? 'Simulate Dispatch' : 'Complete Delivery'}
                  </span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
