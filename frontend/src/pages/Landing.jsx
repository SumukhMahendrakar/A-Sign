import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, ShieldCheck, Clock } from 'lucide-react';

export default function Landing() {
  return (
    <div className="flex flex-col items-center flex-grow">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-br from-primary to-primary-light text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-6 text-accent-light"
          >
            Create Legal Documents in Minutes
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-200 mb-10 max-w-2xl mx-auto"
          >
            A secure, AI-guided platform to generate valid Kerala non-judicial legal documents conversationally in English and Malayalam.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/login?type=new" className="bg-accent hover:bg-accent-light text-primary font-bold py-3 px-8 rounded-lg shadow-lg transition-transform hover:-translate-y-1">
              New User (Get Started)
            </Link>
            <Link to="/login?type=returning" className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold py-3 px-8 rounded-lg backdrop-blur-sm transition-colors">
              Returning User
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="w-full max-w-6xl mx-auto py-20 px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard 
          icon={<FileText className="w-10 h-10 text-primary" />}
          title="Bilingual Support"
          description="Generate documents in both English and professional Kerala-style Malayalam simultaneously."
        />
        <FeatureCard 
          icon={<Clock className="w-10 h-10 text-primary" />}
          title="AI Conversational Intake"
          description="No confusing forms. Our AI asks simple questions step-by-step to gather required details safely."
        />
        <FeatureCard 
          icon={<ShieldCheck className="w-10 h-10 text-primary" />}
          title="Secure & Trustworthy"
          description="Bank-grade security with OTP login. Government-standard templates prevent legal hallucinations."
        />
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow text-center flex flex-col items-center">
      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-slate-800">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}
