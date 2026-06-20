import { useState, useEffect } from 'react';
import { Send, Search, User, ShieldCheck, HelpCircle } from 'lucide-react';
import api from '../api/client';

export default function Inbox() {
  const [vendor, setVendor] = useState({ name: "Rahul Luhar", vendor_id: "12t37211" });
  const [activeContact, setActiveContact] = useState(0);
  const [contacts, setContacts] = useState([
    {
      name: "Aman (Client)",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
      role: "Client",
      lastMessage: "I signed the rental agreement canvas. Please review.",
      unread: true,
      messages: [
        { sender: "client", text: "Hello Rahul, is my Rental Agreement ready for stamping?", time: "10:15 AM" },
        { sender: "vendor", text: "Hello Aman! Yes, the token HJGJ7867868 has been received. I am verifying the details and will stamp it shortly.", time: "10:20 AM" },
        { sender: "client", text: "Great, let me know when I can draw my signature in the E-Sign app.", time: "10:22 AM" },
        { sender: "vendor", text: "Stamping is complete! I have uploaded it. You can now open the mobile simulator tab, click 'E-Sign', drop your PDF draft, and sign it.", time: "11:00 AM" },
        { sender: "client", text: "Awesome! I signed the rental agreement canvas. Please review.", time: "11:15 AM" }
      ]
    },
    {
      name: "Priyan (Stamping Desk)",
      avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=100&q=80",
      role: "Operations Assistant",
      lastMessage: "Non-judicial stamp rolls replenished for KL series.",
      unread: false,
      messages: [
        { sender: "vendor", text: "Priyan, are the ₹250 stamp roll sheets available?", time: "Yesterday" },
        { sender: "client", text: "Yes Rahul, the ₹250 stamp roll sheets are ready. Non-judicial stamp rolls replenished for KL series.", time: "Yesterday" }
      ]
    },
    {
      name: "Kerala Registrar Desk",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80",
      role: "State Portal API",
      lastMessage: "System alert: Schedule IV templates updated.",
      unread: false,
      messages: [
        { sender: "client", text: "System alert: Schedule IV templates updated. Please synchronize your local client templates for rental covenants.", time: "2 days ago" }
      ]
    }
  ]);

  const [inputVal, setInputVal] = useState('');

  useEffect(() => {
    // Fetch stats
    api.get('/orders/stats').then(res => {
      setVendor(res.data);
    }).catch(err => console.error(err));
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      sender: "vendor",
      text: inputVal,
      time: nowStr
    };

    const updated = [...contacts];
    updated[activeContact].messages.push(newMsg);
    updated[activeContact].lastMessage = inputVal;
    
    setContacts(updated);
    setInputVal('');

    // Simulate quick automated response from client for high-quality feel!
    if (activeContact === 0) {
      setTimeout(() => {
        const automatedMsg = {
          sender: "client",
          text: "Perfect! Thank you for the instant response. I appreciate your swift legal service.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        const resUpdated = [...contacts];
        resUpdated[0].messages.push(automatedMsg);
        resUpdated[0].lastMessage = automatedMsg.text;
        resUpdated[0].unread = true;
        setContacts(resUpdated);
      }, 1500);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto w-full flex-grow flex flex-col gap-8 h-screen max-h-[850px]">
      
      {/* Header Panel */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-800 font-display">Inbox</h2>
          <p className="text-xs text-slate-400 font-medium mt-1">Communicate with clients and stamp roll desks in real time</p>
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

      {/* Split Pane Chat Box */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex-grow flex h-0">
        
        {/* Left Pane: Contacts List */}
        <div className="w-80 border-r border-slate-100 flex flex-col">
          <div className="p-4 border-b border-slate-100 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search chats..." 
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-grow">
            {contacts.map((c, idx) => (
              <div 
                key={idx}
                onClick={() => {
                  setActiveContact(idx);
                  c.unread = false;
                }}
                className={`p-4 flex gap-3 items-center border-b border-slate-50 cursor-pointer transition-colors ${
                  activeContact === idx ? 'bg-blue-50/50' : 'hover:bg-slate-50/30'
                }`}
              >
                <img src={c.avatar} alt={c.name} className="w-11 h-11 rounded-full object-cover border border-slate-100" />
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h4 className="text-xs font-bold text-slate-800 truncate">{c.name}</h4>
                    {c.unread && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
                  </div>
                  <span className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider block">{c.role}</span>
                  <p className="text-[11px] text-slate-400 truncate mt-1">{c.lastMessage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Pane: Message Area */}
        <div className="flex-grow flex flex-col bg-slate-50/30">
          
          {/* Active Header */}
          <div className="p-4 bg-white border-b border-slate-100 flex justify-between items-center shrink-0">
            <div className="flex gap-3 items-center">
              <img src={contacts[activeContact].avatar} alt={contacts[activeContact].name} className="w-10 h-10 rounded-full object-cover" />
              <div>
                <h4 className="text-xs font-bold text-slate-800">{contacts[activeContact].name}</h4>
                <span className="text-[10px] text-slate-400 font-semibold">{contacts[activeContact].role} • Active Now</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-100 flex items-center justify-center text-slate-400">
                <HelpCircle size={16} />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-grow overflow-y-auto p-6 flex flex-col gap-4">
            {contacts[activeContact].messages.map((m, idx) => (
              <div 
                key={idx} 
                className={`max-w-[70%] flex flex-col gap-1 ${
                  m.sender === 'vendor' ? 'self-end items-end' : 'self-start items-start'
                }`}
              >
                <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'vendor' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-xs'
                }`}>
                  {m.text}
                </div>
                <span className="text-[9px] text-slate-400 font-semibold">{m.time}</span>
              </div>
            ))}
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex gap-3 shrink-0">
            <input 
              type="text" 
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              placeholder={`Write your reply to ${contacts[activeContact].name.split(' ')[0]}...`}
              className="flex-grow border border-slate-200 rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none bg-slate-50"
            />
            <button 
              type="submit"
              className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow transition-all shrink-0 cursor-pointer"
            >
              <Send size={16} />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
