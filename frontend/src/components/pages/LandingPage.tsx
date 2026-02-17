import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DashboardIcon,
  ToolsIcon,
  BookOpenIcon,
  WandSparklesIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  UserIcon,
  BriefcaseIcon,
  UsersIcon,
  MenuIcon,
  XMarkIcon,
} from '@/components/common/Icons';
import type { View } from '@/types';

interface LandingPageProps {
  onEnter: () => void;
}

// Testimonials Marquee Component
const testimonials = [
  {
    id: 1,
    name: 'Ahmad Fauzi',
    role: 'Pemilik UMKM Halal',
    avatar: 'A',
    avatarGradient: 'from-primary-500 to-secondary-500',
    quote:
      'SyariahOS membantu saya menyusun strategi bisnis murabahah yang lebih terstruktur. AI Planner-nya sangat membantu dalam merencanakan langkah-langkah konkret sesuai prinsip syariah.',
  },
  {
    id: 2,
    name: 'Siti Rahmah',
    role: 'Manajer Lembaga Zakat',
    avatar: 'S',
    avatarGradient: 'from-emerald-500 to-teal-500',
    quote:
      'Knowledge Hub dengan dalil dan maqasid syariah sangat berguna untuk pelatihan tim kami. Task manager juga memudahkan tracking program-program zakat yang sedang berjalan.',
  },
  {
    id: 3,
    name: 'Muhammad Ikhsan',
    role: 'Freelancer Muslim',
    avatar: 'M',
    avatarGradient: 'from-purple-500 to-pink-500',
    quote:
      'Sebagai freelancer, saya butuh tools yang bisa membantu manage project sekaligus tetap istiqomah. Dashboard KPI dengan metrik amanah dan itqan bikin saya lebih termotivasi!',
  },
  {
    id: 4,
    name: 'Fatimah Azzahra',
    role: 'Founder Startup Edukasi',
    avatar: 'F',
    avatarGradient: 'from-orange-500 to-red-500',
    quote:
      'Integrasi AI dengan nilai-nilai Islami itu unik! Saya bisa dapat rekomendasi strategi POAC yang tidak hanya efektif tapi juga tetap menjaga etika bisnis syariah.',
  },
  {
    id: 5,
    name: 'Ustadz Hidayat',
    role: 'Pengurus Masjid',
    avatar: 'H',
    avatarGradient: 'from-cyan-500 to-blue-500',
    quote:
      'Kami gunakan SyariahOS untuk mengelola program-program masjid. Fitur direktori dalil sangat membantu dalam menyusun materi kajian dan khutbah Jumat.',
  },
  {
    id: 6,
    name: 'Dewi Kusuma',
    role: 'Ibu Rumah Tangga',
    avatar: 'D',
    avatarGradient: 'from-rose-500 to-pink-500',
    quote:
      'Bantu banget buat ngatur keuangan keluarga sesuai syariah. Fitur perhitungan zakat dan reminder ibadah jadi andalan saya setiap hari.',
  },
];

const StarRating = () => (
  <div className="flex text-yellow-400">
    {[...Array(5)].map((_, i) => (
      <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const TestimonialCard: React.FC<{ testimonial: (typeof testimonials)[0] }> = ({ testimonial }) => (
  <div className="flex-shrink-0 w-[400px] bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 mx-3">
    <div className="flex items-start mb-4">
      <div
        className={`w-12 h-12 bg-gradient-to-br ${testimonial.avatarGradient} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0`}
      >
        {testimonial.avatar}
      </div>
      <div className="ml-3 flex-1 min-w-0">
        <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate">
          {testimonial.name}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{testimonial.role}</p>
        <StarRating />
      </div>
    </div>
    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-4">
      "{testimonial.quote}"
    </p>
  </div>
);

const TestimonialCarousel: React.FC = () => {
  // Double the testimonials for seamless infinite scroll
  const doubledTestimonials = [...testimonials, ...testimonials];

  return (
    <div className="relative overflow-hidden">
      {/* Inject keyframes */}
      <style>{`
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-marquee-left {
          animation: marquee-left 30s linear infinite;
        }
        .animate-marquee-right {
          animation: marquee-right 35s linear infinite;
        }
        .animate-marquee-left:hover,
        .animate-marquee-right:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* First row - scrolling left */}
      <div className="flex animate-marquee-left">
        {doubledTestimonials.map((testimonial, index) => (
          <TestimonialCard key={`left-${testimonial.id}-${index}`} testimonial={testimonial} />
        ))}
      </div>

      {/* Second row - scrolling right (slower) */}
      <div className="flex mt-4 animate-marquee-right">
        {[...doubledTestimonials].reverse().map((testimonial, index) => (
          <TestimonialCard key={`right-${testimonial.id}-${index}`} testimonial={testimonial} />
        ))}
      </div>

      {/* Gradient overlays for smooth edges */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white dark:from-gray-900 to-transparent pointer-events-none z-10"></div>
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white dark:from-gray-900 to-transparent pointer-events-none z-10"></div>
    </div>
  );
};

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (e: React.MouseEvent, sectionId: string) => {
    e.preventDefault();
    // Close menu first to avoid re-render interrupting scroll
    setIsMobileMenuOpen(false);

    // Wait for menu close animation to finish before scrolling
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        const navHeight = 64;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - navHeight;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="p-1.5 bg-primary-600 rounded-lg shadow-lg">
              <DashboardIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">SyariahOS</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={(e) => scrollToSection(e, 'features')}
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 transition"
            >
              Fitur
            </button>
            <button
              onClick={(e) => scrollToSection(e, 'ai-showcase')}
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 transition"
            >
              AI Muamalah
            </button>
            <button
              onClick={(e) => scrollToSection(e, 'segments')}
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 transition"
            >
              Solusi
            </button>
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
            {isMobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <MenuIcon className="w-6 h-6" />
            )}
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
                <button
                  onClick={(e) => scrollToSection(e, 'features')}
                  className="block w-full text-left px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Fitur Utama
                </button>
                <button
                  onClick={(e) => scrollToSection(e, 'ai-showcase')}
                  className="block w-full text-left px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  AI Planner
                </button>
                <button
                  onClick={(e) => scrollToSection(e, 'segments')}
                  className="block w-full text-left px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Solusi Sektoral
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onEnter();
                  }}
                  className="block w-full px-4 py-3 mt-2 bg-primary-600 text-white text-center font-bold rounded-xl hover:bg-primary-700 transition-colors"
                >
                  Masuk Platform
                </button>
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
            Platform terpadu untuk manajemen berbasis Syariah. Dilengkapi wawasan dalil, task
            manager, AI assistant, dan katalog referensi tools.
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
      <section className="py-16 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-y border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <p className="text-4xl font-bold text-primary-600 group-hover:scale-110 transition-transform duration-300">
                25+
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">
                Referensi Tools
              </p>
            </div>
            <div className="group">
              <p className="text-4xl font-bold text-primary-600 group-hover:scale-110 transition-transform duration-300">
                100%
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">
                Berbasis Syariah
              </p>
            </div>
            <div className="group">
              <p className="text-4xl font-bold text-primary-600 group-hover:scale-110 transition-transform duration-300">
                24/7
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">
                Muamalah Assistant
              </p>
            </div>
            <div className="group">
              <p className="text-4xl font-bold text-primary-600 group-hover:scale-110 transition-transform duration-300">
                Free
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">
                Untuk Umat
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 scroll-mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Tiga Pilar Utama SyariahOS
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Arsitektur manajemen yang dirancang untuk kesuksesan dunia dan akhirat.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-md hover:shadow-xl transition-shadow border border-transparent hover:border-primary-100 dark:hover:border-primary-900">
              <div className="p-4 bg-blue-100 dark:bg-blue-900/50 rounded-2xl w-fit mb-6">
                <BookOpenIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Knowledge Hub
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Direktori wawasan komprehensif dari Al-Qur'an, Sunnah, dan Maqasid Syariah yang
                terintegrasi di setiap fitur.
              </p>
              <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" /> Pencarian Dalil
                  Kontekstual
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" /> Penjelasan Maqasid
                  Praktis
                </li>
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-md hover:shadow-xl transition-shadow border border-transparent hover:border-primary-100 dark:hover:border-primary-900">
              <div className="p-4 bg-emerald-100 dark:bg-emerald-900/50 rounded-2xl w-fit mb-6">
                <ToolsIcon className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Task Manager & Tools
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Kelola tugas harian dengan tracking progress dan katalog 25+ referensi tools syariah
                untuk berbagai kebutuhan.
              </p>
              <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" /> Task Manager dengan
                  Kategori Syariah
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" /> Rekomendasi Tugas
                  Otomatis dari AI
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" /> 25+ Referensi Tools &
                  Resources
                </li>
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-md hover:shadow-xl transition-shadow border border-transparent hover:border-primary-100 dark:hover:border-primary-900">
              <div className="p-4 bg-purple-100 dark:bg-purple-900/50 rounded-2xl w-fit mb-6">
                <DashboardIcon className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Monitoring Center
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Dashboard interaktif untuk memantau KPI dan Goals Anda dengan metrik yang sesuai
                prinsip Syariah.
              </p>
              <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" /> KPI Khusus (Amanah,
                  Itqan)
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" /> Goal Tracking
                  Real-time
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* AI Planner Showcase */}
      <section
        id="ai-showcase"
        className="py-24 bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 text-white overflow-hidden scroll-mt-16 relative"
      >
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
              backgroundSize: '32px 32px',
            }}
          ></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Rencanakan Strategi Anda dalam Hitungan Detik dengan AI
              </h2>
              <p className="text-primary-100 text-lg mb-8 leading-relaxed">
                Gunakan kecerdasan buatan Gemini untuk membuat rencana strategis berbasis kerangka
                kerja **POAC Islami**. Cukup masukkan tujuan Anda, dan AI akan merumuskan langkah
                konkret yang selaras dengan nilai Syariah.
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
                <div className="flex items-start">
                  <div className="bg-white/20 p-1 rounded-md mr-3 mt-1">
                    <CheckCircleIcon className="w-5 h-5" />
                  </div>
                  <p className="font-medium">Rekomendasi Tugas Otomatis dari AI</p>
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
      <section
        id="segments"
        className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-100 dark:bg-gray-800/50 scroll-mt-16"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Didesain Untuk Siapa Saja
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Platform fleksibel yang beradaptasi dengan kebutuhan spesifik Anda.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="inline-flex p-6 bg-white dark:bg-gray-800 rounded-full shadow-md group-hover:scale-110 transition-transform mb-6">
                <UserIcon className="w-10 h-10 text-primary-600" />
              </div>
              <h4 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                Individu & Keluarga
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Life planning, manajemen zakat pribadi, dan edukasi muamalah harian.
              </p>
            </div>
            <div className="text-center group">
              <div className="inline-flex p-6 bg-white dark:bg-gray-800 rounded-full shadow-md group-hover:scale-110 transition-transform mb-6">
                <BriefcaseIcon className="w-10 h-10 text-primary-600" />
              </div>
              <h4 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                Bisnis & UMKM
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                AI Strategic Planner dengan rekomendasi tugas otomatis, referensi tools bisnis
                syariah, dan dashboard monitoring KPI.
              </p>
            </div>
            <div className="text-center group">
              <div className="inline-flex p-6 bg-white dark:bg-gray-800 rounded-full shadow-md group-hover:scale-110 transition-transform mb-6">
                <UsersIcon className="w-10 h-10 text-primary-600" />
              </div>
              <h4 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                Lembaga & Komunitas
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Knowledge hub dalil, direktori maqasid syariah, dan referensi tools lembaga.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 scroll-mt-16"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Apa Kata Mereka
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Kisah inspiratif dari pengguna SyariahOS yang telah mengubah cara mereka mengelola
              amanah dengan lebih berkah.
            </p>
          </div>

          {/* Testimonials Carousel */}
          <TestimonialCarousel />

          {/* Stats Bar */}
          <div className="mt-16 bg-gradient-to-r from-primary-600 to-secondary-500 rounded-2xl p-8 text-white">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <p className="text-3xl font-bold">500+</p>
                <p className="text-sm text-white/80 mt-1">Pengguna Aktif</p>
              </div>
              <div>
                <p className="text-3xl font-bold">98%</p>
                <p className="text-sm text-white/80 mt-1">Tingkat Kepuasan</p>
              </div>
              <div>
                <p className="text-3xl font-bold">50+</p>
                <p className="text-sm text-white/80 mt-1">Lembaga Mitra</p>
              </div>
              <div>
                <p className="text-3xl font-bold">4.9</p>
                <p className="text-sm text-white/80 mt-1">Rating Rata-rata</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-primary-600 to-secondary-500 rounded-3xl p-12 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Siap Menjalankan Amanah Lebih Baik?
            </h2>
            <p className="text-lg text-primary-100 mb-10 max-w-xl mx-auto">
              Bergabunglah dengan ribuan mukmin yang telah mentransformasi manajemen mereka menjadi
              lebih profesional dan sesuai Syariat.
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
          &copy; {new Date().getFullYear()} Manajemen Syariah OS. Dikembangkan untuk kemaslahatan
          umat.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
