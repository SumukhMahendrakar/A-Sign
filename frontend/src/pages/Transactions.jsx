import { useEffect, useState } from 'react';
import {
  CircleDollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  TrendingUp,
  ArrowUpCircle,
  X
} from 'lucide-react';
import api from '../api/client';

export default function Transactions() {
  const [vendor, setVendor] = useState({
    name: "Rahul Luhar",
    vendor_id: "12t37211",
    current_balance: 3600,
    amount_withdrawn: 5400,
    revenue_generated: 9000
  });

  const [ledger, setLedger] = useState([
    { id: "TXN-009", desc: "Rental Agreement Payout", ref: "HJGJ7867871", amount: 250, type: "credit", date: "2026-05-24", status: "Settled" },
    { id: "TXN-008", desc: "Rental Agreement Payout", ref: "HJGJ7867872", amount: 250, type: "credit", date: "2026-05-23", status: "Settled" },
    { id: "TXN-007", desc: "Estamp Rollover Settlement", ref: "HJGJ7867873", amount: 250, type: "credit", date: "2026-05-22", status: "Settled" },
    { id: "TXN-006", desc: "Wallet Disbursal to Bank", ref: "WITHDRAW-04", amount: 1500, type: "debit", date: "2026-05-21", status: "Settled" },
    { id: "TXN-005", desc: "Rental Agreement Payout", ref: "HJGJ7867874", amount: 250, type: "credit", date: "2026-05-20", status: "Settled" },
    { id: "TXN-004", desc: "Wallet Disbursal to Bank", ref: "WITHDRAW-03", amount: 2000, type: "debit", date: "2026-05-18", status: "Settled" }
  ]);

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      const res = await api.get('/orders/stats');
      setVendor(res.data);

      // Load credits dynamically from database completed orders!
      const ordersRes = await api.get('/orders/');
      const completed = ordersRes.data.filter(o => o.status === 'Completed');

      // Map completed orders to credit logs
      const credits = completed.map((o, idx) => ({
        id: `TXN-${strPad(completed.length - idx)}`,
        desc: `${o.token_name} Stamping Payout`,
        ref: o.ref_no,
        amount: o.amount,
        type: "credit",
        date: o.date.split('/').reverse().join('-'), // format date
        status: "Settled"
      }));

      // Merge credits and existing disbursals
      const disbursals = [
        { id: "TXN-DISB-01", desc: "Wallet Disbursal to Bank", ref: "WITHDRAW-02", amount: 1500, type: "debit", date: "2026-05-20", status: "Settled" },
        { id: "TXN-DISB-02", desc: "Wallet Disbursal to Bank", ref: "WITHDRAW-01", amount: 2400, type: "debit", date: "2026-05-15", status: "Settled" }
      ];

      setLedger([...credits, ...disbursals].sort((a, b) => b.id.localeCompare(a.id)));
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const strPad = (val) => {
    return String(val).padStart(3, '0');
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const amountNum = parseFloat(withdrawAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }

    if (amountNum > vendor.current_balance) {
      setError('Insufficient balance in wallet.');
      return;
    }

    setWithdrawing(true);
    setError('');
    try {
      await api.post('/orders/withdraw', { amount: amountNum });

      // Create local ledger debit log
      const newDisbursal = {
        id: `TXN-WDR-${strPad(ledger.length + 1)}`,
        desc: "Wallet Disbursal to Bank",
        ref: `WITHDRAW-${strPad(ledger.filter(l => l.type === 'debit').length + 1)}`,
        amount: amountNum,
        type: "debit",
        date: new Date().toISOString().split('T')[0],
        status: "Settled"
      };

      setLedger([newDisbursal, ...ledger]);
      setIsModalOpen(false);
      setWithdrawAmount('');

      // Reload stats
      await fetchStats();
    } catch (err) {
      console.error(err);
      setError('Withdrawal failed. Please try again.');
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto w-full flex-grow flex flex-col gap-8">

      {/* Header Panel */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-800 font-display">Transaction Log</h2>
          <p className="text-xs text-slate-400 font-medium mt-1">Audit trail of stamp payouts, ledger credits, and cashouts</p>
        </div>

        {/* Profile Card */}
        <div className="flex items-center gap-3 bg-white border border-slate-100 py-1.5 pl-3 pr-4 rounded-full shadow-sm">
          <img
            src={vendor.avatar_url || "https://static.vecteezy.com/system/resources/thumbnails/009/734/564/small/default-avatar-profile-icon-of-social-media-user-vector.jpg"}
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
      ) : (
        <>
          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Balance Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Wallet Balance</span>
                  <h3 className="text-3xl font-extrabold text-slate-800 mt-1">₹ {vendor.current_balance}</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Wallet size={20} />
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow hover:shadow-blue-200 flex items-center justify-center gap-1 cursor-pointer"
              >
                <ArrowUpCircle size={14} />
                <span>Withdraw Funds</span>
              </button>
            </div>

            {/* Total Withdrawn Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Total Cashouts</span>
                  <h3 className="text-3xl font-extrabold text-slate-800 mt-1">₹ {vendor.amount_withdrawn}</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <TrendingUp size={20} />
                </div>
              </div>
              <div className="text-[11px] text-slate-400 font-semibold mt-4">
                Transferred to verified primary bank account.
              </div>
            </div>

            {/* Total Earnings Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Gross Earnings</span>
                  <h3 className="text-3xl font-extrabold text-blue-600 mt-1">₹ {vendor.revenue_generated}</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                  <CircleDollarSign size={20} />
                </div>
              </div>
              <div className="text-[11px] text-slate-400 font-semibold mt-4">
                Accumulated revenue from stamped tokens.
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">Ledger Statement</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                    <th className="py-3.5 px-6">Transaction ID</th>
                    <th className="py-3.5 px-6">Description</th>
                    <th className="py-3.5 px-6">Reference</th>
                    <th className="py-3.5 px-6">Amount</th>
                    <th className="py-3.5 px-6">Date</th>
                    <th className="py-3.5 px-6 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.map((txn, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 border-b border-slate-100 transition-colors">
                      <td className="py-4 px-6 text-xs font-mono font-bold text-slate-700">{txn.id}</td>
                      <td className="py-4 px-6 text-xs font-bold text-slate-800">{txn.desc}</td>
                      <td className="py-4 px-6 text-xs text-slate-400 font-semibold">{txn.ref}</td>
                      <td className="py-4 px-6 text-xs font-bold">
                        <span className={`flex items-center gap-0.5 ${txn.type === 'credit' ? 'text-green-600' : 'text-red-500'
                          }`}>
                          {txn.type === 'credit' ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                          ₹{txn.amount}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-500">{txn.date}</td>
                      <td className="py-4 px-6 text-center">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-600">
                          {txn.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Withdrawal Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-sm w-full p-6 relative">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setWithdrawAmount('');
                setError('');
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg"
            >
              <X size={16} />
            </button>

            <h3 className="text-lg font-bold text-slate-800 font-display">Withdraw Funds</h3>
            <p className="text-xs text-slate-400 mt-1">Disburse wallet balances directly to your primary savings bank.</p>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-100 text-red-600 text-xs p-3 rounded-xl font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleWithdraw} className="mt-6 flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Amount (INR)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 500"
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none bg-slate-50 font-bold"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Available balance: ₹{vendor.current_balance}</span>
              </div>

              <button
                type="submit"
                disabled={withdrawing || !withdrawAmount}
                className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-md disabled:opacity-50 flex items-center justify-center"
              >
                {withdrawing ? 'Processing Disbursal...' : 'Disburse to Bank'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
