import { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  PenTool, 
  Stamp, 
  Bed, 
  FileText, 
  Tag, 
  Users, 
  ShieldCheck, 
  Grid,
  Home,
  Wallet,
  User,
  ArrowLeft,
  Upload,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import api from '../api/client';

export default function MobileSimulator() {
  const [screen, setScreen] = useState('welcome'); // welcome, esign, signed_success
  const [activeTab, setActiveTab] = useState('menu'); // menu, docs, wallet, account
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signing, setSigning] = useState(false);
  const [vaultDocs, setVaultDocs] = useState([]);
  
  const canvasRef = useRef(null);

  // Load mobile vault docs
  const loadVault = () => {
    api.get('/orders/mobile/documents').then(res => {
      setVaultDocs(res.data);
    }).catch(err => console.error(err));
  };

  useEffect(() => {
    loadVault();
  }, []);

  // Drawing Canvas functions
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = '#2563eb'; // blue-600 ink
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile({
        name: file.name,
        size: (file.size / 1024).toFixed(0) + ' KB'
      });
    }
  };

  const handleSignDocument = async () => {
    if (!uploadedFile || !hasSignature) return;
    setSigning(true);
    try {
      const canvas = canvasRef.current;
      const signature_svg = canvas ? canvas.toDataURL() : 'M 0 0';

      // 1. Upload
      const uploadRes = await api.post(`/orders/mobile/upload?doc_name=${uploadedFile.name}&file_size=${uploadedFile.size}`);
      
      // 2. Sign
      await api.post('/orders/mobile/sign', {
        id: uploadRes.data.document.id,
        signature_svg: signature_svg
      });

      setScreen('signed_success');
      loadVault();
    } catch (err) {
      console.error(err);
      alert('Error signing document');
    } finally {
      setSigning(false);
    }
  };

  return (
    <div className="p-8 flex-grow flex flex-col lg:flex-row justify-center items-center gap-12 bg-slate-100 min-h-screen">
      
      {/* Informative Left Panel */}
      <div className="max-w-md flex flex-col gap-4 text-center lg:text-left">
        <span className="bg-indigo-100 text-indigo-700 font-bold text-xs uppercase px-3 py-1 rounded-full self-center lg:self-start">
          Interactive Mockup
        </span>
        <h2 className="text-3xl font-extrabold text-slate-800 font-display">Simulated Mobile App</h2>
        <p className="text-slate-600 leading-relaxed">
          Interact directly with the mobile view designed by your team! Toggle between tabs, simulate uploads, and literally **draw your signature** on the canvas to sign documents.
        </p>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-sm flex flex-col gap-2">
          <h4 className="font-bold text-slate-800">Available Interactions:</h4>
          <ul className="list-disc pl-5 text-slate-500 flex flex-col gap-1 text-xs">
            <li>Click **E-Sign** on the main dashboard to open E-Sign uploader.</li>
            <li>Drag & drop or select a `.pdf` to load it.</li>
            <li>Draw with mouse/finger in the dotted signature block!</li>
            <li>Monitor the mobile signed documents tab using the bottom menu.</li>
          </ul>
        </div>
      </div>

      {/* iPhone Device Mockup Frame */}
      <div className="phone-mockup">
        {/* Top notch */}
        <div className="phone-notch"></div>
        
        {/* Mobile Screen Container */}
        <div className="phone-screen select-none">
          
          {/* Welcome Screen (Image 5) */}
          {screen === 'welcome' && (
            <div className="flex flex-col flex-grow bg-slate-50">
              
              {/* Header (অSIGN logo & search) */}
              <header className="p-4 bg-white border-b border-slate-100 flex justify-between items-center shadow-xs">
                <span className="text-blue-600 font-display font-black text-lg tracking-wide flex items-center gap-1">
                  <span className="text-xl">अ</span>SIGN
                </span>
                <Search size={18} className="text-slate-400" />
              </header>

              {/* Home tab Content */}
              {activeTab === 'menu' && (
                <div className="p-5 flex-grow flex flex-col gap-6">
                  
                  {/* Greetings banner */}
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Welcome, Aman</h2>
                    <p className="text-xs text-slate-500 mt-1 leading-normal">
                      Get your documents verified and signed hassle free, anytime, anywhere!
                    </p>
                  </div>

                  {/* Main E-Sign / E-Stamp Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* E-Sign Card */}
                    <div 
                      onClick={() => setScreen('esign')}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl flex flex-col gap-4 shadow-lg shadow-blue-100 cursor-pointer transition-all hover:-translate-y-0.5"
                    >
                      <div className="flex flex-col gap-1">
                        <h4 className="font-bold text-sm">E-Sign</h4>
                        <span className="text-[10px] text-blue-100 leading-tight">Sign any legal file or agreement digitally.</span>
                      </div>
                      <PenTool size={24} className="opacity-90 self-start" />
                    </div>

                    {/* E-Stamp Card */}
                    <div className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-2xl flex flex-col gap-4 shadow-lg shadow-blue-100 cursor-pointer transition-all hover:-translate-y-0.5">
                      <div className="flex flex-col gap-1">
                        <h4 className="font-bold text-sm">E-Stamp</h4>
                        <span className="text-[10px] text-blue-100 leading-tight">Stamp any legal file or agreement digitally.</span>
                      </div>
                      <Stamp size={24} className="opacity-90 self-start" />
                    </div>
                  </div>

                  {/* Services Grid (Image 5) */}
                  <div className="flex flex-col gap-4">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Services</h3>
                    <div className="grid grid-cols-3 gap-3">
                      
                      <ServiceGridItem icon={<Bed size={20} />} label="Rental" />
                      <ServiceGridItem icon={<FileText size={20} />} label="Statement" />
                      <ServiceGridItem icon={<Tag size={20} />} label="Sales" />
                      
                      <ServiceGridItem icon={<Users size={20} />} label="Partnership" />
                      <ServiceGridItem icon={<ShieldCheck size={20} />} label="Affidavit" />
                      <ServiceGridItem icon={<Grid size={20} />} label="Other" />

                    </div>
                  </div>

                </div>
              )}

              {/* Documents tab content */}
              {activeTab === 'docs' && (
                <div className="p-5 flex-grow flex flex-col gap-4 overflow-y-auto">
                  <h3 className="text-lg font-bold text-slate-800">Your Documents</h3>
                  
                  {vaultDocs.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-xs">
                      No documents found in vault.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {vaultDocs.map((doc, idx) => (
                        <div key={idx} className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-xs flex justify-between items-center">
                          <div className="flex gap-3 items-center">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                              <FileText size={18} />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-800 truncate max-w-[130px]">{doc.doc_name}</h4>
                              <span className="text-[9px] text-slate-400 font-semibold">{doc.file_size} • {doc.uploaded_at}</span>
                            </div>
                          </div>
                          
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            doc.status === 'Signed' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {doc.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Other tabs placeholder */}
              {(activeTab === 'wallet' || activeTab === 'account') && (
                <div className="p-5 flex-grow flex items-center justify-center text-center text-xs text-slate-400">
                  Tab content simulation is offline.
                </div>
              )}

              {/* Bottom Nav Bar (Image 5) */}
              <nav className="mt-auto bg-white border-t border-slate-100 py-2.5 px-6 flex justify-between items-center shadow-md">
                <BottomNavItem 
                  icon={<Home size={20} />} 
                  label="Menu" 
                  active={activeTab === 'menu'} 
                  onClick={() => setActiveTab('menu')}
                />
                <BottomNavItem 
                  icon={<FileText size={20} />} 
                  label="Documents" 
                  active={activeTab === 'docs'} 
                  onClick={() => setActiveTab('docs')}
                />
                <BottomNavItem 
                  icon={<Wallet size={20} />} 
                  label="Wallet" 
                  active={activeTab === 'wallet'} 
                  onClick={() => setActiveTab('wallet')}
                />
                <BottomNavItem 
                  icon={<User size={20} />} 
                  label="Account" 
                  active={activeTab === 'account'} 
                  onClick={() => setActiveTab('account')}
                />
              </nav>

            </div>
          )}

          {/* E-Sign Screen (Image 4) */}
          {screen === 'esign' && (
            <div className="flex flex-col flex-grow bg-slate-50">
              {/* Header */}
              <header className="p-4 bg-white border-b border-slate-100 flex items-center gap-3 shadow-xs">
                <button onClick={() => setScreen('welcome')} className="text-slate-600 hover:text-slate-800">
                  <ArrowLeft size={18} />
                </button>
                <h3 className="text-sm font-bold text-slate-800">E-Sign</h3>
              </header>

              <div className="p-5 flex-grow flex flex-col gap-6 overflow-y-auto">
                <div className="text-xs text-slate-500 leading-normal">
                  Sign any legal document or agreement entronically.
                </div>

                {/* Upload Zone */}
                <div className="border-2 border-dashed border-blue-400 bg-blue-50/20 rounded-2xl p-6 text-center relative hover:bg-blue-50/50 transition-all">
                  <input 
                    type="file" 
                    onChange={handleFileUpload} 
                    accept=".pdf,.docx" 
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  
                  <div className="flex flex-col items-center gap-2">
                    <Upload size={32} className="text-blue-600" />
                    <div>
                      <h4 className="text-xs font-bold text-blue-600">Upload Document</h4>
                      <span className="text-[10px] text-slate-400 mt-1 block">Supports .pdf and .docx files</span>
                    </div>
                  </div>
                </div>

                {/* Loaded File view */}
                {uploadedFile && (
                  <div className="bg-white border border-slate-100 rounded-xl p-3 flex justify-between items-center shadow-xs">
                    <div className="flex gap-2.5 items-center">
                      <FileText size={16} className="text-blue-600" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 truncate max-w-[150px]">{uploadedFile.name}</h4>
                        <span className="text-[9px] text-slate-400 font-semibold">{uploadedFile.size}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setUploadedFile(null)} 
                      className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}

                {/* Dotted Signature Draw Pad */}
                {uploadedFile && (
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold uppercase">
                      <span>Draw Signature</span>
                      <button onClick={clearCanvas} className="text-red-500 hover:underline">
                        Clear
                      </button>
                    </div>
                    
                    <div className="border border-dashed border-slate-300 rounded-xl bg-white overflow-hidden relative h-36">
                      <canvas 
                        ref={canvasRef}
                        width={320}
                        height={144}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="w-full h-full cursor-crosshair"
                      />
                      {!hasSignature && (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs pointer-events-none font-medium">
                          Draw your signature here
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Sign Button (Image 4) */}
              <div className="p-5 mt-auto border-t border-slate-100 bg-white">
                <button 
                  onClick={handleSignDocument}
                  disabled={!uploadedFile || !hasSignature || signing}
                  className={`w-full py-3.5 px-6 rounded-3xl text-sm font-bold shadow-md transition-all text-center flex items-center justify-center gap-2 ${
                    uploadedFile && hasSignature 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer' 
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {signing ? 'Signing...' : 'Sign Document'}
                </button>
              </div>
            </div>
          )}

          {/* Screen C: Signed Success Page */}
          {screen === 'signed_success' && (
            <div className="flex-grow flex flex-col items-center justify-center bg-white p-6 text-center select-none animate-fade-in">
              <CheckCircle2 size={64} className="text-green-600 fill-green-50 mb-4 animate-bounce" />
              <h3 className="text-lg font-bold text-slate-800">Document Signed!</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed max-w-[220px]">
                Your document has been electronically stamped, signed, and registered in your document list.
              </p>
              <button 
                onClick={() => {
                  setScreen('welcome');
                  setActiveTab('docs');
                  setUploadedFile(null);
                  setHasSignature(false);
                }}
                className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-8 rounded-full text-xs transition-all shadow-md"
              >
                Go to Vault
              </button>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}

// Reusable Components
function ServiceGridItem({ icon, label }) {
  return (
    <div className="bg-blue-50/60 rounded-xl p-3 flex flex-col items-center gap-2 text-center shadow-xs">
      <div className="text-blue-600">
        {icon}
      </div>
      <span className="text-[10px] font-semibold text-slate-600">{label}</span>
    </div>
  );
}

function BottomNavItem({ icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all ${
        active ? 'text-blue-600 scale-105' : 'text-slate-400 hover:text-slate-600'
      }`}
    >
      {icon}
      <span className="text-[9px] font-bold">{label}</span>
    </button>
  );
}
