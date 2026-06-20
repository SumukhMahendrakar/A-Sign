import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Wallet, 
  ArrowUpRight, 
  TrendingUp, 
  Clock, 
  MapPin, 
  Play, 
  ChevronRight, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import api from '../api/client';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    vendor_id: "12t37211",
    name: "Rahul Luhar",
    avatar_url: "",
    current_balance: 3600,
    amount_withdrawn: 5400,
    orders_completed: 216,
    tokens_generated: 217,
    revenue_generated: 9000
  });

  const [orders, setOrders] = useState([]);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [stepping, setStepping] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch stats
      const statsRes = await api.get('/orders/stats');
      setStats(statsRes.data);

      // Fetch all orders
      const ordersRes = await api.get('/orders/');
      setOrders(ordersRes.data);

      // Find if there is a pending order
      const pending = ordersRes.data.find(o => o.status === 'Pending');
      setPendingOrder(pending || null);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAccept = async () => {
    if (!pendingOrder) return;
    setAccepting(true);
    try {
      await api.post(`/orders/${pendingOrder.ref_no}/accept`);
      await fetchData(); // reload stats and orders
    } catch (err) {
      console.error("Failed to accept order:", err);
      alert("Failed to accept order");
    } finally {
      setAccepting(false);
    }
  };

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
      await fetchData();
    } catch (err) {
      console.error("Error stepping simulation:", err);
    } finally {
      setStepping(false);
    }
  };

  // Find the active ongoing order (either Accepted or Out for Delivery)
  const ongoingOrder = orders.find(o => o.status === 'Accepted' || o.status === 'Out for Delivery') || orders.find(o => o.status === 'Completed');

  return (
    <div className="p-8 max-w-6xl mx-auto w-full flex-grow flex flex-col gap-8">
      {/* Top Header & Profile Bar */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-800">Home</h2>
        </div>
        
        {/* Profile Card */}
        <div className="flex items-center gap-3 bg-white border border-slate-100 py-1.5 pl-3 pr-4 rounded-full shadow-sm">
          <img 
            src={stats.avatar_url || "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&q=80"} 
            alt="Rahul Luhar" 
            className="w-10 h-10 rounded-full object-cover border border-slate-200"
          />
          <div>
            <h4 className="text-sm font-bold text-slate-800 leading-none">{stats.name}</h4>
            <span className="text-[11px] text-slate-400 font-semibold uppercase">Vendor ID: {stats.vendor_id}</span>
          </div>
        </div>
      </div>

      {loading && orders.length === 0 ? (
        <div className="flex-grow flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Incoming Pending Order Alert Capsule (Image 3) */}
          {pendingOrder && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-6 relative overflow-hidden transition-all duration-300 hover:shadow-lg">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    {pendingOrder.token_name}
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">Ref Id: {pendingOrder.ref_no}</span>
                </div>
                
                <div className="flex items-center gap-6 self-stretch md:self-auto justify-between md:justify-end">
                  <div className="text-right">
                    <span className="block text-xs text-slate-400 font-semibold uppercase">Payout</span>
                    <span className="text-2xl font-bold text-blue-600">Rs. {pendingOrder.amount}</span>
                  </div>
                  <button 
                    onClick={handleAccept}
                    disabled={accepting}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-8 rounded-lg shadow-lg hover:shadow-blue-200 transition-all flex items-center gap-2 pulse-button disabled:opacity-50"
                  >
                    {accepting ? 'Accepting...' : 'Accept'}
                  </button>
                </div>
              </div>

              {/* Progress Slider representing remaining acceptance window */}
              <div className="mt-6">
                <div className="relative h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-red-500 transition-all duration-500" 
                    style={{ width: '65%' }}
                  ></div>
                  <div 
                    className="absolute top-0 h-3 w-3 bg-red-500 border border-white rounded-full -translate-y-[2.5px] shadow"
                    style={{ left: '65%' }}
                  ></div>
                </div>
                <div className="flex justify-between items-center mt-2 text-xs text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock size={12} className="text-slate-400" />
                    {pendingOrder.time_received} Token received
                  </span>
                  <span className="text-red-500 font-bold flex items-center gap-1">
                    <AlertCircle size={12} />
                    {pendingOrder.time_left} left to Accept
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Balance Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Balance */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex justify-between items-center transition-all duration-200 hover:shadow-md">
              <div className="flex gap-4 items-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                  <Wallet size={24} />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Current Balance</span>
                  <h3 className="text-3xl font-extrabold text-slate-800 mt-1">₹ {stats.current_balance}</h3>
                </div>
              </div>
              <Link 
                to="/completed"
                className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center"
              >
                <ArrowUpRight size={18} />
              </Link>
            </div>

            {/* Amount Withdrawn */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex justify-between items-center transition-all duration-200 hover:shadow-md">
              <div className="flex gap-4 items-center">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Amount Withdrawn</span>
                  <h3 className="text-3xl font-extrabold text-slate-800 mt-1">₹ {stats.amount_withdrawn}</h3>
                </div>
              </div>
              <button className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors flex items-center justify-center">
                <ArrowUpRight size={18} />
              </button>
            </div>
          </div>

          {/* Statistics and Ongoing Timeline layout */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            
            {/* Left Column: Stats & Recent Orders Table (Col span 3) */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              
              {/* Statistics Panel */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 className="text-base font-bold text-slate-800 mb-4">Statistics</h3>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                    <span className="text-sm text-slate-500 font-medium">Orders completed</span>
                    <span className="text-sm font-bold text-slate-800">{stats.orders_completed}</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                    <span className="text-sm text-slate-500 font-medium">Tokens generated</span>
                    <span className="text-sm font-bold text-slate-800">{stats.tokens_generated}</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-sm text-slate-500 font-medium">Revenue Generated</span>
                    <span className="text-sm font-extrabold text-blue-600">₹{stats.revenue_generated}</span>
                  </div>
                </div>
              </div>

              {/* Recent Orders List Card */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 pb-2 flex justify-between items-center">
                  <h3 className="text-base font-bold text-slate-800">Recent Orders</h3>
                  <Link to="/completed" className="text-xs font-bold text-blue-600 hover:underline">
                    View all
                  </Link>
                </div>
                
                {/* Orders Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider border-y border-slate-100">
                        <th className="py-3 px-6">Token</th>
                        <th className="py-3 px-6">Ref. No.</th>
                        <th className="py-3 px-6">Date</th>
                        <th className="py-3 px-6 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 3).map(o => (
                        <tr 
                          key={o.ref_no} 
                          onClick={() => navigate(`/order/${o.ref_no}`)}
                          className="hover:bg-slate-50 border-b border-slate-100 cursor-pointer transition-colors"
                        >
                          <td className="py-4 px-6 text-sm font-bold text-slate-800">{o.token_name}</td>
                          <td className="py-4 px-6 text-sm text-slate-400 font-medium">{o.ref_no}</td>
                          <td className="py-4 px-6 text-sm text-slate-500">{o.date}</td>
                          <td className="py-4 px-6 text-center">
                            <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                              o.status === 'Completed' ? 'bg-green-50 text-green-600' :
                              o.status === 'Pending' ? 'bg-indigo-50 text-indigo-600' :
                              o.status === 'Accepted' ? 'bg-blue-50 text-blue-600' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {o.status === 'Out for Delivery' ? 'Out for Delivery' : o.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column: Ongoing Order Timeline Panel (Col span 2) */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-800 mb-6">Ongoing Order</h3>
                  
                  {ongoingOrder ? (
                    <div className="flex flex-col gap-6 relative before:absolute before:left-3 before:top-2 before:h-[calc(100%-16px)] before:w-0.5 before:bg-slate-100">
                      {JSON.parse(ongoingOrder.timeline_json || "[]").map((item, idx) => (
                        <div key={idx} className="flex gap-4 items-start relative z-10">
                          {/* Timeline dot */}
                          <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center border-4 border-white shadow ${
                            item.active ? 'bg-blue-600 text-white' : 'bg-slate-200'
                          }`}>
                            {item.active && <CheckCircle size={10} className="fill-current" />}
                          </div>
                          
                          <div className="flex-grow">
                            <span className="text-[11px] text-slate-400 font-bold block">{item.time}</span>
                            <h4 className="text-sm font-bold text-slate-800 mt-0.5">{item.title}</h4>
                            {item.subtext && (
                              <p className="text-xs text-slate-400 mt-1 leading-normal flex items-center gap-1 font-medium bg-slate-50 p-2 rounded-lg border border-dashed border-slate-100">
                                <MapPin size={10} className="text-slate-400" />
                                {item.subtext}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-slate-400 text-sm">
                      No active ongoing orders. Accept a pending order to view the live timeline tracking.
                    </div>
                  )}
                </div>

                {/* Simulated Order Walkthrough Trigger */}
                {ongoingOrder && ongoingOrder.status !== 'Completed' && (
                  <div className="mt-8 pt-4 border-t border-slate-100">
                    <button 
                      onClick={() => handleSimulateStep(ongoingOrder.ref_no, ongoingOrder.status)}
                      disabled={stepping}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 font-semibold py-2.5 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                    >
                      <Play size={14} />
                      {stepping ? 'Processing...' : 
                       ongoingOrder.status === 'Accepted' ? 'Simulate Dispatch' : 'Simulate Delivery Completion'}
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
