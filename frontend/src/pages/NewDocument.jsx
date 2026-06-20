import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/client';

const DOC_TYPES = [
  { id: 'rental_agreement', name: 'Rental Agreement' },
  { id: 'affidavit', name: 'Affidavit' },
  { id: 'power_of_attorney', name: 'Power of Attorney' },
  { id: 'sale_agreement', name: 'Sale Agreement' },
  { id: 'loan_agreement', name: 'Loan Agreement / Bond' },
];

const STAMP_VALUES = [50, 100, 200, 500, 1000];

export default function NewDocument() {
  const navigate = useNavigate();
  const [docType, setDocType] = useState('rental_agreement');
  const [stampValue, setStampValue] = useState(100);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/documents/', { doc_type: docType, stamp_value: stampValue });
      navigate(`/chat/${res.data.doc_id}`);
    } catch (err) {
      console.error(err);
      alert('Failed to create document.');
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 rounded-2xl w-full max-w-lg shadow-lg"
      >
        <h2 className="text-2xl font-bold text-primary mb-6 border-b pb-2">Start New Document</h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Select Document Type</label>
            <select 
              value={docType} 
              onChange={e => setDocType(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-primary focus:outline-none"
            >
              {DOC_TYPES.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Stamp Paper Value (₹)</label>
            <div className="grid grid-cols-5 gap-2">
              {STAMP_VALUES.map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setStampValue(val)}
                  className={`py-2 rounded-md border font-medium transition-colors ${
                    stampValue === val 
                      ? 'bg-primary text-white border-primary' 
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mt-2">
            <p className="text-sm text-blue-800">
              You will be redirected to our AI Assistant who will guide you step-by-step to fill out the details.
            </p>
          </div>

          <button disabled={loading} type="submit" className="btn-primary py-3 text-lg mt-4 shadow-md">
            {loading ? 'Initializing...' : 'Proceed to AI Chat'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
