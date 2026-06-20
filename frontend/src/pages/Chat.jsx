import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, CheckCircle2, Bot, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/client';

export default function Chat() {
  const { docId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const [done, setDone] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Check if chat history exists, else start new
    api.get(`/ai/${docId}/history`).then(res => {
      if (res.data.length === 0) {
        api.post(`/ai/${docId}/start`).then(startRes => {
          setMessages([{ role: 'assistant', content: startRes.data.message }]);
          setLoading(false);
        });
      } else {
        setMessages(res.data);
        setLoading(false);
      }
    });
  }, [docId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || done) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setTyping(true);

    try {
      const res = await api.post(`/ai/${docId}/chat`, { message: userMsg });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.message }]);
      if (res.data.all_done) {
        setDone(true);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    }
    setTyping(false);
  };

  if (loading) return <div className="flex-grow flex items-center justify-center">Loading AI Assistant...</div>;

  return (
    <div className="flex-grow flex flex-col max-w-4xl mx-auto w-full bg-white shadow-sm border-x border-slate-200">
      <div className="bg-primary text-white py-4 px-6 shadow flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-full"><Bot size={24} /></div>
          <div>
            <h2 className="font-bold text-lg leading-tight">Legal Assistant</h2>
            <p className="text-xs text-slate-300">{docId}</p>
          </div>
        </div>
        {done && (
          <button onClick={() => navigate(`/review/${docId}`)} className="bg-accent text-primary px-4 py-2 rounded-lg font-bold text-sm shadow hover:bg-accent-light transition-colors">
            Review Draft
          </button>
        )}
      </div>

      <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-slate-50">
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={idx} 
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-slate-200 text-slate-700'}`}>
                {msg.role === 'user' ? <UserIcon size={20} /> : <Bot size={20} />}
              </div>
              <div className={`max-w-[75%] px-5 py-3 rounded-2xl shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-primary text-white rounded-tr-none' 
                  : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
              }`}>
                {msg.content.split('\n').map((line, i) => <p key={i} className="mb-1 last:mb-0">{line}</p>)}
              </div>
            </motion.div>
          ))}
          {typing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
               <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0"><Bot size={20} /></div>
               <div className="bg-white px-5 py-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex gap-1">
                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
               </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        {done ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-center gap-3 text-green-700">
            <CheckCircle2 size={24} />
            <span className="font-medium">All details collected! Please review your draft.</span>
            <button onClick={() => navigate(`/review/${docId}`)} className="ml-4 bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 transition">
              Review Draft Now
            </button>
          </div>
        ) : (
          <form onSubmit={handleSend} className="flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your answer here..."
              disabled={typing}
              className="flex-grow px-4 py-3 bg-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all disabled:opacity-50"
            />
            <button 
              type="submit" 
              disabled={typing || !input.trim()}
              className="bg-primary hover:bg-primary-light text-white w-12 h-12 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              <Send size={20} className="ml-1" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
