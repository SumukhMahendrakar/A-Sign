import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import api from '../api/client';

export default function OrderDetails() {
  const { ref_no } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [vendor, setVendor] = useState({
    name: "Rahul Luhar",
    vendor_id: "12t37211",
    avatar_url: ""
  });
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const stampPaperRef = useRef(null);

  useEffect(() => {
    // Fetch stats for profile header
    api.get('/orders/stats').then(res => {
      setVendor(res.data);
    }).catch(err => console.error(err));

    // Fetch order details
    api.get(`/orders/${ref_no}`).then(res => {
      setOrder(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [ref_no]);

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center text-slate-500">
        Order not found.
      </div>
    );
  }

  // Helper to extract or fallback
  const form = order.form_data || {};

  return (
    <div className="p-8 max-w-5xl mx-auto w-full flex-grow flex flex-col gap-6">

      {/* Top Navigation & Profile Bar */}
      <div className="flex justify-between items-center">
        {/* Back navigation button */}
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg hover:shadow-blue-200 transition-all"
        >
          <ArrowLeft size={18} />
        </button>

        {/* Profile Card */}
        <div className="flex items-center gap-3 bg-white border border-slate-100 py-1.5 pl-3 pr-4 rounded-full shadow-sm">
          <img
            src={vendor.avatar_url || "https://static.vecteezy.com/system/resources/thumbnails/009/734/564/small/default-avatar-profile-icon-of-social-media-user-vector.jpg"}
            alt="Rahul Luhar"
            className="w-10 h-10 rounded-full object-cover border border-slate-200"
          />
          <div>
            <h4 className="text-sm font-bold text-slate-800 leading-none">{vendor.name}</h4>
            <span className="text-[11px] text-slate-400 font-semibold uppercase">Vendor ID: {vendor.vendor_id}</span>
          </div>
        </div>
      </div>

      {/* Main Details and Status Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">{order.token_name}</h2>
          <p className="text-xs text-slate-400 font-semibold mt-1">Ref Id: {order.ref_no}</p>
        </div>

        <div className="text-right">
          <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${order.status === 'Completed' ? 'bg-green-50 text-green-600' :
            order.status === 'Pending' ? 'bg-indigo-50 text-indigo-600' :
              'bg-blue-50 text-blue-600'
            }`}>
            {order.status}
          </span>
          <span className="block text-[11px] text-slate-400 font-semibold mt-1">{order.date}</span>
        </div>
      </div>

      {/* Stamp Paper Preview Wrapper */}
      <div className="stamp-paper-container">
        <div className="stamp-paper" ref={stampPaperRef}>
          {/* INDIAN NON-JUDICIAL Kerala Stamp header */}
          <div className="relative border-4 border-emerald-800 p-4 mb-8 text-center bg-emerald-50/50">
            {/* Seal Graphic Left — Kerala State Emblem */}
            <div className="absolute top-2 left-4 w-14 h-14 rounded-full border-2 border-dashed border-emerald-800 flex items-center justify-center opacity-60">
              <div className="text-center leading-tight">
                <span className="block text-[5px] font-bold text-emerald-800">GOVT OF</span>
                <span className="block text-[6px] font-bold text-emerald-800">KERALA</span>
              </div>
            </div>

            {/* Main Header Text */}
            <h3 className="text-xl font-black text-emerald-950 tracking-[4px] uppercase font-display">
              India Non Judicial
            </h3>
            <p className="text-[9px] text-emerald-700 tracking-[2px] mt-0.5 font-semibold">ഇന്ത്യ നോൺ ജുഡീഷ്യൽ</p>

            <div className="flex justify-between items-center mt-2 px-10 text-[10px] text-emerald-800 font-bold">
              <span>കേരളം KERALA</span>
              <span className="text-amber-800">S. Vijayakumar</span>
              <span>KL-07 482910</span>
            </div>

            {/* Serial Number Right */}
            <div className="absolute top-2 right-4 border border-emerald-800 px-2 py-0.5 text-[8px] text-emerald-800 font-mono">
              KL 4821 / {new Date().toLocaleDateString('en-IN')}
            </div>
          </div>

          {/* Legal Content */}
          <div className="px-6 text-slate-800 text-sm leading-relaxed font-sans">
            <h4 className="text-center font-bold text-base tracking-wide text-slate-900 mb-8 border-b pb-2 uppercase">
              Residential Rental Agreement
            </h4>

            <p className="mb-6 indent-8">
              This agreement made at <span className="highlight-var">{form.city || '[City, State]'}, {form.state || ''}</span> on this <span className="highlight-var">{form.date || '[Date, Month, Year]'} {form.month || ''} {form.year || ''}</span> between <span className="highlight-var">{form.landlord_name || '[Landlord Name]'}</span>, residing at <span className="highlight-var">{form.landlord_address || '[Landlord Address Line 1, Address Line 2, City, State, Pin Code]'}</span> hereinafter referred to as the "LESSOR" of the One Part AND <span className="highlight-var">[Tenant Name]</span>, residing at <span className="highlight-var">[Tenant Address Line 1...]</span> hereinafter referred to as the "LESSEE" of the Other Part.
            </p>

            <p className="mb-6">
              WHEREAS the Lessor is the absolute owner of the property located at <span className="highlight-var">[Property Address]</span> and has agreed to lease out the premises for a residential duration of <span className="highlight-var">[Duration Months]</span> months.
            </p>

            <p className="mb-10">
              NOW THIS AGREEMENT WITNESSETH AS FOLLOWS:
            </p>

            <ol className="list-decimal pl-6 flex flex-col gap-4 mb-16">
              <li>That the Lessee shall pay a monthly rent of <span className="highlight-var">Rs. [Monthly Rent]</span> on or before the 5th day of every calendar month.</li>
              <li>That the Lessee has deposited an interest-free security deposit of <span className="highlight-var">Rs. [Deposit Amount]</span> with the Lessor.</li>
              <li>That the Lessee shall use the premises strictly for residential purposes only.</li>
            </ol>

            {/* Signature Block */}
            <div className="grid grid-cols-2 gap-20 pt-10 border-t border-slate-200">
              <div className="text-center">
                <div className="h-10"></div>
                <div className="border-t border-slate-400 pt-2 text-xs font-bold text-slate-600">
                  Lessor (Landlord)
                </div>
              </div>
              <div className="text-center">
                <div className="h-10"></div>
                <div className="border-t border-slate-400 pt-2 text-xs font-bold text-slate-600">
                  Lessee (Tenant)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Link file name */}
        <div className="mt-4 flex items-center justify-center gap-2 text-slate-500 hover:text-slate-700 cursor-pointer">
          <FileText size={16} />
          <span className="text-xs font-bold underline text-slate-600">{order.pdf_filename}</span>
        </div>
      </div>

      {/* Amount Footer */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex justify-between items-center mt-2">
        <div>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Value</span>
          <h3 className="text-xl font-extrabold text-blue-600 mt-1">Amount: Rs{Math.round(order.amount)}</h3>
        </div>
        <button
          onClick={async () => {
            if (!stampPaperRef.current) return;
            setDownloading(true);
            try {
              const canvas = await html2canvas(stampPaperRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#fffaf0',
              });
              const imgData = canvas.toDataURL('image/png');
              const pdf = new jsPDF('p', 'mm', 'a4');
              const pdfWidth = pdf.internal.pageSize.getWidth();
              const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
              pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
              pdf.save(`${order.ref_no}_stamp_paper.pdf`);
            } catch (err) {
              console.error('PDF generation failed:', err);
              alert('Failed to generate PDF. Please try again.');
            } finally {
              setDownloading(false);
            }
          }}
          disabled={downloading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-wait text-white font-bold py-2.5 px-6 rounded-xl shadow transition-all flex items-center gap-2 text-sm"
        >
          {downloading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
          ) : (
            <Download size={16} />
          )}
          <span>{downloading ? 'Generating...' : 'Download PDF'}</span>
        </button>
      </div>

    </div>
  );
}
