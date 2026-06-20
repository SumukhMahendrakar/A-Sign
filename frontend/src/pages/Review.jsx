import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, FileText, Download } from 'lucide-react';
import api from '../api/client';

export default function Review() {
  const { docId } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    api.get(`/documents/${docId}`).then(res => {
      setDoc(res.data);
      setLoading(false);
    });
  }, [docId]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await api.post(`/pdf/${docId}/generate`);
      const res = await api.get(`/documents/${docId}`);
      setDoc(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to generate PDF');
    }
    setGenerating(false);
  };

  if (loading) return <div className="flex-grow flex items-center justify-center">Loading Document Data...</div>;

  const isGenerated = doc.status === 'generated';

  return (
    <div className="max-w-4xl mx-auto w-full p-4 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-primary p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">{doc.doc_label}</h2>
            <p className="text-slate-300 mt-1">Review your details before generation</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-300">Document ID</p>
            <p className="font-mono font-bold bg-white/10 px-3 py-1 rounded mt-1">{doc.doc_id}</p>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 mb-8">
            {Object.entries(doc.form_data).map(([key, value]) => (
              <div key={key} className="border-b border-slate-100 pb-2">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {key.replace(/_/g, ' ')}
                </span>
                <span className="block font-medium text-slate-800 text-lg">
                  {value || <span className="text-slate-300 italic">Not provided</span>}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-500 mb-1">STAMP PAPER VALUE</p>
              <p className="text-2xl font-bold text-primary">₹{doc.stamp_value}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-slate-500 mb-1">STATUS</p>
              <p className={`font-bold inline-block px-3 py-1 rounded-full text-sm ${
                isGenerated ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {doc.status.toUpperCase()}
              </p>
            </div>
          </div>

          {isGenerated ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-center gap-3">
                <CheckCircle2 size={24} className="text-green-600 flex-shrink-0" />
                <p className="font-medium">Documents generated successfully! Ready to download.</p>
              </div>
              <div className="flex gap-4">
                <a 
                  href={`http://localhost:8000/pdf/${docId}/download/en`} 
                  target="_blank" rel="noreferrer"
                  className="flex-1 btn-primary flex items-center justify-center gap-2 py-3 text-lg"
                >
                  <Download size={20} /> Download English PDF
                </a>
                <a 
                  href={`http://localhost:8000/pdf/${docId}/download/ml`} 
                  target="_blank" rel="noreferrer"
                  className="flex-1 btn-outline flex items-center justify-center gap-2 py-3 text-lg"
                >
                  <Download size={20} /> Download Malayalam PDF
                </a>
              </div>
              <button onClick={() => navigate('/dashboard')} className="w-full text-center text-slate-500 hover:text-primary mt-4 font-medium">
                Back to Dashboard
              </button>
            </div>
          ) : (
            <div className="flex gap-4">
              <button 
                onClick={() => navigate(`/chat/${docId}`)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <FileText size={20} /> Edit / Back to Chat
              </button>
              <button 
                onClick={handleGenerate}
                disabled={generating}
                className="flex-1 btn-primary py-3 px-4 text-lg flex items-center justify-center gap-2"
              >
                {generating ? 'Generating PDFs...' : 'Confirm & Generate PDFs'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
