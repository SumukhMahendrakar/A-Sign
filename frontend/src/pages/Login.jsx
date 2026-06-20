import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/client';
import useAuthStore from '../store/useAuthStore';

export default function Login() {
  const [searchParams] = useSearchParams();
  const isNew = searchParams.get('type') === 'new';
  const navigate = useNavigate();
  const setAuth = useAuthStore(s => s.login);

  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/send-otp', { phone });
      alert(`Demo OTP: ${res.data.dev_otp}`);
      setStep(2);
    } catch (err) {
      setError('Failed to send OTP.');
    }
    setLoading(false);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/verify-otp', { phone, otp });
      setAuth(res.data.access_token, { customerId: res.data.customer_id, name: res.data.name });
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid OTP.');
    }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/login', { identifier });
      setAuth(res.data.access_token, { customerId: res.data.customer_id, name: res.data.name });
      navigate('/dashboard');
    } catch (err) {
      setError('User not found. Try signing up.');
    }
    setLoading(false);
  };

  return (
    <div className="flex-grow flex items-center justify-center p-4 bg-slate-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 rounded-2xl w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center text-primary mb-6">
          {isNew ? 'Create Account' : 'Welcome Back'}
        </h2>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}

        {isNew ? (
          step === 1 ? (
            <form onSubmit={handleSendOTP} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input 
                  type="tel" required
                  value={phone} onChange={e => setPhone(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="10-digit mobile number"
                />
              </div>
              <button disabled={loading} type="submit" className="btn-primary w-full mt-2">
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Enter OTP</label>
                <input 
                  type="text" required
                  value={otp} onChange={e => setOtp(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg tracking-widest text-center text-xl focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="------"
                />
              </div>
              <button disabled={loading} type="submit" className="btn-primary w-full mt-2">
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>
            </form>
          )
        ) : (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Customer ID or Phone</label>
              <input 
                type="text" required
                value={identifier} onChange={e => setIdentifier(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="e.g. KL0001 or 9876543210"
              />
            </div>
            <button disabled={loading} type="submit" className="btn-primary w-full mt-2">
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
