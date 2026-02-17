
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DashboardIcon, ToolsIcon, BookOpenIcon, 
  WandSparklesIcon, ArrowTrendingUpIcon, 
  CheckCircleIcon, UserIcon, BriefcaseIcon, UsersIcon,
  MenuIcon, XMarkIcon
} from '@/components/common/Icons';
import type { View } from '@/types';

interface LandingPageProps {
  onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (e: React.MouseEvent, sectionId: string) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      const navHeight = 64;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - navHeight;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    // Delay closing menu to allow scroll animation to start
    setTimeout(() => setIsMobileMenuOpen(false), 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="p-1.5 bg-primary-600 rounded-lg shadow-lg">
                <DashboardIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
                SyariahOS
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={(e) => scrollToSection(e, 'features')} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 transition">Fitur</button>
            <button onClick={(e) => scrollToSection(e, 'ai-showcase')} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 transition">AI Muamalah</button>
            <button onClick={(e) => scrollToSection(e, 'segments')} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 transition">Solusi</button>
            <button 
              onClick={onEnter}
              className="px-5 py-2 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-700 transition shadow-lg active:scale-95"
            >
              Masuk
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-gray-600 dark:text-gray-300" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-gray-800 shadow-xl border-t dark:border-gray-700 overflow-hidden"
            >
              <motion.div 
                initial={{ y: -10 }}
                animate={{ y: 0 }}
                exit={{ y: -10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="p-4 space-y-1"
              >
                <button onClick={(e) => scrollToSection(e, 'features')} className="block w-full text-left px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-gray-700 rounded-lg transition-colors">Fitur Utama</button>
                <button onClick={(e) => scrollToSection(e, 'ai-showcase')} className="block w-full text-left px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-gray-700 rounded-lg transition-colors">AI Planner</button>
                <button onClick={(e) => scrollToSection(e, 'segments')} className="block w-full text-left px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-gray-700 rounded-lg transition-colors">Solusi Sektoral</button>
                <button onClick={() => { setIsMobileMenuOpen(false); onEnter(); }} className="block w-full px-4 py-3 mt-2 bg-primary-600 text-white text-center font-bold rounded-xl hover:bg-primary-700 transition-colors">Masuk Platform</button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 lg:pt-48 lg:pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-8 animate-bounce">
            <WandSparklesIcon className="w-4 h-4 mr-2" />
            Visi Masa Depan Manajemen Syariah
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6">
            Kelola Amanah, Tingkatkan <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-500">
              Keberkahan & Profesionalisme
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-10">
            Platform terpadu untuk manajemen berbasis Syariah. 
            Dilengkapi wawasan dalil, task manager, AI assistant, dan katalog referensi tools.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={onEnter}
              className="px-8 py-4 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 transition shadow-xl hover:shadow-primary-500/20 active:scale-95 text-lg"
            >
              Mulai Gunakan SyariahOS
            </button>
            <button 
              onClick={(e) => scrollToSection(e, 'features')}
              className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-lg"
            >
              Pelajari Fitur
            </button>
          </div>
        </div>
      </section>

      {/* Stats/Proof */}
      <section className="py-12 bg-white dark:bg-gray-800 border-y border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-primary-600">25+</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1">Referensi Tools</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary-600">100%</p>
              <p className="text-sm text-gray-500 uppercase tracking-widest mt-1">Berbasis Syariah</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary-600">AI</p>
              <p className="text-sm text-gray-500 uppercase tracking-widest mt-1">Muamalah Assistant</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary-600">Free</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1">Untuk Umat</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 scroll-mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Tiga Pilar Utama SyariahOS</h2>
            <p className="text-gray-600 dark:text-gray-400">Arsitektur manajemen yang dirancang untuk kesuksesan dunia dan akhirat.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-md hover:shadow-xl transition-shadow border border-transparent hover:border-primary-100 dark:hover:border-primary-900">
              <div className="p-4 bg-blue-100 dark:bg-blue-900/50 rounded-2xl w-fit mb-6">
                <BookOpenIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Knowledge Hub</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Direktori wawasan komprehensif dari Al-Qur'an, Sunnah, dan Maqasid Syariah yang terintegrasi di setiap fitur.</p>
              <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
                <li className="flex items-center"><CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" /> Pencarian Dalil Kontekstual</li>
                <li className="flex items-center"><CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" /> Penjelasan Maqasid Praktis</li>
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-md hover:shadow-xl transition-shadow border border-transparent hover:border-primary-100 dark:hover:border-primary-900">
              <div className="p-4 bg-emerald-100 dark:bg-emerald-900/50 rounded-2xl w-fit mb-6">
                <ToolsIcon className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Task Manager & Tools</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Kelola tugas harian dengan tracking progress dan katalog 25+ referensi tools syariah untuk berbagai kebutuhan.</p>
              <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
                <li className="flex items-center"><CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" /> Task Manager dengan Kategori Syariah</li>
                <li className="flex items-center"><CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" /> 25+ Referensi Tools & Resources</li>
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-md hover:shadow-xl transition-shadow border border-transparent hover:border-primary-100 dark:hover:border-primary-900">
              <div className="p-4 bg-purple-100 dark:bg-purple-900/50 rounded-2xl w-fit mb-6">
                <DashboardIcon className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Monitoring Center</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Dashboard interaktif untuk memantau KPI dan Goals Anda dengan metrik yang sesuai prinsip Syariah.</p>
              <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
                <li className="flex items-center"><CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" /> KPI Khusus (Amanah, Itqan)</li>
                <li className="flex items-center"><CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" /> Goal Tracking Real-time</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* AI Planner Showcase */}
      <section id="ai-showcase" className="py-24 bg-primary-600 text-white overflow-hidden scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">Rencanakan Strategi Anda dalam Hitungan Detik dengan AI</h2>
              <p className="text-primary-100 text-lg mb-8 leading-relaxed">
                Gunakan kecerdasan buatan Gemini untuk membuat rencana strategis berbasis kerangka kerja **POAC Islami**. 
                Cukup masukkan tujuan Anda, dan AI akan merumuskan langkah konkret yang selaras dengan nilai Syariah.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-white/20 p-1 rounded-md mr-3 mt-1">
                    <CheckCircleIcon className="w-5 h-5" />
                  </div>
                  <p className="font-medium">Planning (Takhthith) yang Visioner</p>
                </div>
                <div className="flex items-start">
                  <div className="bg-white/20 p-1 rounded-md mr-3 mt-1">
                    <CheckCircleIcon className="w-5 h-5" />
                  </div>
                  <p className="font-medium">Organizing (Tanzhim) yang Rapi</p>
                </div>
                <div className="flex items-start">
                  <div className="bg-white/20 p-1 rounded-md mr-3 mt-1">
                    <CheckCircleIcon className="w-5 h-5" />
                  </div>
                  <p className="font-medium">Actuating (Tawjih) yang Bijaksana</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
                 <div className="flex items-center mb-6">
                    <WandSparklesIcon className="w-8 h-8 text-primary-200 mr-3" />
                    <span className="text-lg font-bold">AI Strategic Planner Preview</span>
                 </div>
                 <div className="space-y-4">
                    <div className="h-4 bg-white/20 rounded w-3/4"></div>
                    <div className="h-4 bg-white/20 rounded w-1/2"></div>
                    <div className="h-20 bg-white/10 rounded w-full flex items-center justify-center italic text-sm text-primary-200">
                        "Menyusun strategi bisnis murabahah yang amanah..."
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-10 bg-white/20 rounded"></div>
                        <div className="h-10 bg-primary-400/50 rounded animate-pulse"></div>
                    </div>
                 </div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-secondary-400 rounded-full mix-blend-multiply filter blur-2xl opacity-50"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-primary-300 rounded-full mix-blend-multiply filter blur-2xl opacity-50"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Segments Section */}
      <section id="segments" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-100 dark:bg-gray-800/50 scroll-mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Didesain Untuk Siapa Saja</h2>
            <p className="text-gray-600 dark:text-gray-400">Platform fleksibel yang beradaptasi dengan kebutuhan spesifik Anda.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="inline-flex p-6 bg-white dark:bg-gray-800 rounded-full shadow-md group-hover:scale-110 transition-transform mb-6">
                <UserIcon className="w-10 h-10 text-primary-600" />
              </div>
              <h4 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Individu & Keluarga</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Life planning, manajemen zakat pribadi, dan edukasi muamalah harian.</p>
            </div>
            <div className="text-center group">
              <div className="inline-flex p-6 bg-white dark:bg-gray-800 rounded-full shadow-md group-hover:scale-110 transition-transform mb-6">
                <BriefcaseIcon className="w-10 h-10 text-primary-600" />
              </div>
              <h4 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Bisnis & UMKM</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">AI Strategic Planner, referensi tools bisnis syariah, dan dashboard monitoring KPI.</p>
            </div>
            <div className="text-center group">
              <div className="inline-flex p-6 bg-white dark:bg-gray-800 rounded-full shadow-md group-hover:scale-110 transition-transform mb-6">
                <UsersIcon className="w-10 h-10 text-primary-600" />
              </div>
              <h4 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Lembaga & Komunitas</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Knowledge hub dalil, direktori maqasid syariah, dan referensi tools lembaga.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-primary-600 to-secondary-500 rounded-3xl p-12 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Siap Menjalankan Amanah Lebih Baik?</h2>
            <p className="text-lg text-primary-100 mb-10 max-w-xl mx-auto">
              Bergabunglah dengan ribuan mukmin yang telah mentransformasi manajemen mereka menjadi lebih profesional dan sesuai Syariat.
            </p>
            <button 
              onClick={onEnter}
              className="px-10 py-5 bg-white text-primary-600 font-bold rounded-2xl hover:bg-gray-50 transition shadow-lg active:scale-95 text-lg"
            >
              Akses SyariahOS Sekarang
            </button>
          </div>
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full"></div>
            <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-white rounded-full"></div>
          </div>
        </div>
        <div className="mt-16 text-center text-gray-500 dark:text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} Manajemen Syariah OS. Dikembangkan untuk kemaslahatan umat.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
