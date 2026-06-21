import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckSquare, ArrowRight, BellRing } from 'lucide-react';
import api from '../api/client';

export default function CompletedOrders() {
  const navigate = useNavigate();
  const [completedOrders, setCompletedOrders] = useState([]);
  const [stats, setStats] = useState({
    name: "Rahul Luhar",
    vendor_id: "12t37211",
    avatar_url: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch stats
    api.get('/orders/stats').then(res => {
      setStats(res.data);
    }).catch(err => console.error(err));

    // Fetch completed orders
    api.get('/orders/').then(res => {
      // Filter for Completed ones
      const completed = res.data.filter(o => o.status === 'Completed');
      setCompletedOrders(completed);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto w-full flex-grow flex flex-col gap-8 relative min-h-screen pb-24">
      {/* Header Panel */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-blue-600 font-display">Completed</h2>
        </div>

        {/* Profile Card */}
        <div className="flex items-center gap-3 bg-white border border-slate-100 py-1.5 pl-3 pr-4 rounded-full shadow-sm">
          <img
            src={stats.avatar_url || "https://static.vecteezy.com/system/resources/thumbnails/009/734/564/small/default-avatar-profile-icon-of-social-media-user-vector.jpg"}
            alt="Rahul Luhar"
            className="w-10 h-10 rounded-full object-cover border border-slate-200"
          />
          <div>
            <h4 className="text-sm font-bold text-slate-800 leading-none">{stats.name}</h4>
            <span className="text-[11px] text-slate-400 font-semibold uppercase">Vendor ID: {stats.vendor_id}</span>
          </div>
        </div>
      </div>

      {/* Main List Box */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">Orders Completed</h3>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : completedOrders.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-sm">
            No completed orders found. Once you complete orders, they will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="py-3.5 px-6">Token</th>
                  <th className="py-3.5 px-6">Ref. No.</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {completedOrders.map((o, idx) => (
                  <tr
                    key={idx}
                    onClick={() => navigate(`/order/${o.ref_no}`)}
                    className="hover:bg-slate-50 border-b border-slate-100 cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-6 text-sm font-bold text-slate-800">{o.token_name}</td>
                    <td className="py-4 px-6 text-sm text-slate-400 font-medium">{o.ref_no}</td>
                    <td className="py-4 px-6 text-sm text-slate-500">{o.date}</td>
                    <td className="py-4 px-6 text-center">
                      <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-green-50 text-green-600">
                        Completed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Floating Notification Box at Bottom Right (Image 2) */}
      <Link
        to="/dashboard"
        className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-3 px-6 shadow-xl flex items-center gap-3 transition-transform hover:-translate-y-1 hover:shadow-blue-200 cursor-pointer max-w-[240px]"
      >
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
          <BellRing size={20} className="text-white animate-pulse" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white leading-tight">New Order</h4>
          <span className="text-[10px] text-blue-100 font-medium block">Accept before time runs out</span>
        </div>
        <ArrowRight size={16} className="text-blue-200 shrink-0" />
      </Link>
    </div>
  );
}
