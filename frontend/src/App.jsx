import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewDocument from './pages/NewDocument';
import Chat from './pages/Chat';
import Review from './pages/Review';
import CompletedOrders from './pages/CompletedOrders';
import OrderDetails from './pages/OrderDetails';
import MobileSimulator from './pages/MobileSimulator';
import OngoingOrders from './pages/OngoingOrders';
import InboxPage from './pages/Inbox';
import Transactions from './pages/Transactions';
import {
  Home,
  Layers,
  Inbox,
  CheckSquare,
  CircleDollarSign,
  LogOut,
  Phone,
  Smartphone
} from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/login" />;
};

function AppContent() {
  const { token, logout } = useAuthStore();
  const location = useLocation();

  const isAuthPage = location.pathname === '/' || location.pathname === '/login';

  if (token && !isAuthPage) {
    return (
      <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between sticky top-0 h-screen shrink-0">
          <div>
            {/* Logo Capsule */}
            <div className="p-6">
              <div className="bg-blue-600 text-white rounded-xl py-3 px-6 flex items-center justify-center font-display font-bold text-xl tracking-wider shadow-md hover:bg-blue-700 transition-all cursor-pointer">
                <span className="mr-1 text-2xl font-extrabold font-display">अ</span>SIGN
              </div>
            </div>

            {/* Nav Menu */}
            <nav className="mt-4 flex flex-col gap-1">
              <Link
                to="/dashboard"
                className={`sidebar-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
              >
                <Home size={18} />
                <span className="flex-grow">Home</span>
                <span className="bg-blue-100 text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full shrink-0">1</span>
              </Link>
              <Link
                to="/ongoing"
                className={`sidebar-link ${location.pathname === '/ongoing' ? 'active' : ''}`}
              >
                <Layers size={18} />
                <span>Ongoing Order</span>
              </Link>
              <Link
                to="/inbox"
                className={`sidebar-link ${location.pathname === '/inbox' ? 'active' : ''}`}
              >
                <Inbox size={18} />
                <span>Inbox</span>
              </Link>
              <Link
                to="/completed"
                className={`sidebar-link ${location.pathname === '/completed' ? 'active' : ''}`}
              >
                <CheckSquare size={18} />
                <span>Completed</span>
              </Link>
              <Link
                to="/transactions"
                className={`sidebar-link ${location.pathname === '/transactions' ? 'active' : ''}`}
              >
                <CircleDollarSign size={18} />
                <span>Transaction</span>
              </Link>
              <div className="h-px bg-slate-100 my-4 mx-6"></div>
              <Link
                to="/mobile-sim"
                className={`sidebar-link ${location.pathname === '/mobile-sim' ? 'active' : ''}`}
              >
                <Smartphone size={18} className="text-indigo-500 animate-bounce" />
                <span className="font-semibold text-indigo-600">Mobile App View</span>
              </Link>
            </nav>
          </div>

          {/* Bottom Sidebar */}
          <div className="p-6 flex flex-col gap-6">
            <button
              onClick={logout}
              className="flex items-center gap-3 text-slate-500 hover:text-red-600 font-medium px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors w-full text-left"
            >
              <LogOut size={18} />
              <span>Log Out</span>
            </button>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs text-slate-400 font-semibold mb-2">Need Help?</p>
              <a
                href="tel:9876543210"
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-bold"
              >
                <Phone size={14} className="fill-blue-100" />
                <span>9876543210</span>
              </a>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-grow flex flex-col overflow-y-auto max-h-screen">
          <Routes>
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/ongoing" element={<ProtectedRoute><OngoingOrders /></ProtectedRoute>} />
            <Route path="/inbox" element={<ProtectedRoute><InboxPage /></ProtectedRoute>} />
            <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
            <Route path="/completed" element={<ProtectedRoute><CompletedOrders /></ProtectedRoute>} />
            <Route path="/order/:ref_no" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
            <Route path="/mobile-sim" element={<ProtectedRoute><MobileSimulator /></ProtectedRoute>} />
            <Route path="/new" element={<ProtectedRoute><NewDocument /></ProtectedRoute>} />
            <Route path="/chat/:docId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/review/:docId" element={<ProtectedRoute><Review /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </main>
      </div>
    );
  }

  // Generic Shell for Public pages
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      <header className="bg-blue-900 text-white py-4 shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-wide flex items-center gap-2">
            <span className="bg-white text-blue-900 w-8 h-8 rounded-lg flex items-center justify-center font-display font-black">अ</span>
            SIGN Legal
          </h1>
          {token && (
            <button
              onClick={logout}
              className="text-sm bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-lg transition-colors font-medium"
            >
              Logout
            </button>
          )}
        </div>
      </header>

      <main className="flex-grow flex flex-col">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
