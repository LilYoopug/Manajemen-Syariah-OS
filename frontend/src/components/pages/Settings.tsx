
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { profileApi, getErrorMessage } from '@/lib/api-services';
import type { ProfileUpdateData } from '@/types/api';
import type { View } from '@/types';
import {
  UserIcon, BanknotesIcon, Cog6ToothIcon,
  ArrowLeftOnRectangleIcon, DownloadIcon, TrashIcon,
  SunIcon, MoonIcon, CheckIcon, CameraIcon, XMarkIcon,
  PlusCircleIcon, QuestionMarkCircleIcon,
  ChevronRightIcon, ChevronDownIcon
} from '@/components/common/Icons';
import { Skeleton, SkeletonAvatar, SkeletonInput, SkeletonButton } from '@/components/common/Skeleton';
import ModalPortal from '@/components/common/ModalPortal';
import ConfirmModal, { type ConfirmModalType } from '@/components/common/ConfirmModal';

interface UserProfile {
  name: string;
  zakatRate: number;
  preferredAkad: string;
  calculationMethod: 'Hijri' | 'Masehi';
  profilePicture: string | null;
}

interface SettingsProps {
  toggleTheme: () => void;
  theme: 'light' | 'dark';
  setView: (view: View) => void;
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ toggleTheme, theme, setView, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'sharia' | 'app' | 'help'>('profile');
  const [profile, setProfile] = useState<UserProfile>({
    name: 'User Syariah',
    zakatRate: 2.5,
    preferredAkad: 'Murabahah',
    calculationMethod: 'Masehi',
    profilePicture: null
  });

  const [isPfpModalOpen, setIsPfpModalOpen] = useState(false);
  const [newPfpUrl, setNewPfpUrl] = useState(profile.profilePicture || '');
  const [pfpSourceType, setPfpSourceType] = useState<'url' | 'upload'>('url');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<ConfirmModalType>('info');
  const [modalAction, setModalAction] = useState<(() => void) | null>(null);
  const [modalShowCancel, setModalShowCancel] = useState(false);

  const showModal = (title: string, message: string, type: ConfirmModalType = 'info', onConfirm?: () => void, showCancel: boolean = false) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalType(type);
    setModalAction(() => onConfirm || null);
    setModalShowCancel(showCancel);
    setModalOpen(true);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await profileApi.get();
      setProfile({
        name: data.name,
        zakatRate: parseFloat(data.zakatRate) || 2.5,
        preferredAkad: data.preferredAkad || 'Murabahah',
        calculationMethod: (data.calculationMethod as 'Hijri' | 'Masehi') || 'Masehi',
        profilePicture: data.profilePicture
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    try {
      const updateData: ProfileUpdateData = {
        name: profile.name,
        zakatRate: profile.zakatRate,
        preferredAkad: profile.preferredAkad,
        calculationMethod: profile.calculationMethod,
        profilePicture: profile.profilePicture || undefined,
      };
      await profileApi.update(updateData);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      setError(getErrorMessage(err));
      setSaveStatus('idle');
    }
  };

  const handleUpdatePfp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    try {
      const updateData: ProfileUpdateData = {
        profilePicture: newPfpUrl || undefined,
      };
      await profileApi.update(updateData);
      setProfile({ ...profile, profilePicture: newPfpUrl });
      setIsPfpModalOpen(false);
      setUploadError(null);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      setUploadError(getErrorMessage(err));
      setSaveStatus('idle');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Max size 2MB
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
        setUploadError("Ukuran file terlalu besar! Maksimal 2MB agar sistem tetap ringan.");
        return;
    }

    setUploadError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
        setNewPfpUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleExportData = async () => {
    try {
      const blob = await profileApi.export();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'syariahos_backup.json';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showModal('Gagal Mengekspor', getErrorMessage(err), 'error');
    }
  };

  const handleResetSystem = async () => {
    showModal(
      'Peringatan Reset Data',
      'Ini akan menghapus semua data Anda secara permanen. Lanjutkan?',
      'warning',
      async () => {
        try {
          await profileApi.reset();
          onLogout();
        } catch (err) {
          showModal('Gagal Reset', getErrorMessage(err), 'error');
        }
      },
      true
    );
  };

  const handleLogout = () => {
    showModal(
      'Konfirmasi Keluar',
      'Apakah Anda yakin ingin keluar?',
      'confirm',
      () => onLogout(),
      true
    );
  };

  const faqData = [
    { q: "Apa itu Manajemen Syariah OS?", a: "SyariahOS adalah platform manajemen terpadu yang menyelaraskan standar operasional profesional dengan prinsip-prinsip syariah Islam." },
    { q: "Bagaimana cara kerja AI Generator?", a: "AI kami menggunakan model Gemini 3 Pro untuk merumuskan langkah taktis berdasarkan visi Anda dalam kerangka POAC Islami." },
    { q: "Apakah data saya aman?", a: "Seluruh data Anda disimpan secara lokal di browser Anda (Local Storage). Kami tidak menyimpan data sensitif di server eksternal tanpa izin Anda." },
    { q: "Bagaimana cara melakukan reset data?", a: "Anda dapat melakukan reset sistem melalui tab 'Aplikasi & Data' di menu pengaturan ini." }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center tracking-tight">
            <Cog6ToothIcon className="w-8 h-8 mr-3 text-primary-500" />
            Pengaturan & Profil
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Kelola identitas, preferensi syariah, dan data aplikasi Anda.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden flex flex-col md:flex-row min-h-[500px] border border-gray-100 dark:border-gray-700">
        {/* Settings Tab Sidebar */}
        <div className="w-full md:w-64 bg-gray-50 dark:bg-gray-900/50 border-r dark:border-gray-700 p-5 space-y-2">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 ml-2">Navigasi Panel</p>
            <button 
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center px-4 py-3.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'profile' ? 'bg-primary-600 text-white shadow-lg active:scale-95' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
                <UserIcon className="w-5 h-5 mr-3" />
                Profil Pengguna
            </button>
            <button 
                type="button"
                onClick={() => setActiveTab('sharia')}
                className={`w-full flex items-center px-4 py-3.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'sharia' ? 'bg-primary-600 text-white shadow-lg active:scale-95' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
                <BanknotesIcon className="w-5 h-5 mr-3" />
                Preferensi Syariah
            </button>
            <button 
                type="button"
                onClick={() => setActiveTab('app')}
                className={`w-full flex items-center px-4 py-3.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'app' ? 'bg-primary-600 text-white shadow-lg active:scale-95' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
                <Cog6ToothIcon className="w-5 h-5 mr-3" />
                Aplikasi & Data
            </button>
            <button 
                type="button"
                onClick={() => setActiveTab('help')}
                className={`w-full flex items-center px-4 py-3.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'help' ? 'bg-primary-600 text-white shadow-lg active:scale-95' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
                <QuestionMarkCircleIcon className="w-5 h-5 mr-3" />
                {/* MODIFIED: Changed from 'Bantuan & Support' to 'Bantuan' */}
                Bantuan
            </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-8 md:p-10 overflow-y-auto">
            {activeTab === 'profile' && (
                <div className="space-y-10 animate-fadeIn">
                    <div className="flex items-center justify-between border-b dark:border-gray-700 pb-5">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Identitas Pengguna</h3>
                        {saveStatus === 'success' && (
                            <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full animate-bounce">
                                Tersimpan!
                            </span>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md">
                            <div className="flex items-center space-x-6 mb-6">
                                <SkeletonAvatar size="lg" />
                                <div className="flex-1">
                                    <Skeleton className="h-6 w-48 mb-2" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <Skeleton className="h-4 w-24 mb-2" />
                                    <SkeletonInput />
                                </div>
                                <div className="flex justify-end">
                                    <SkeletonButton />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col items-center space-y-4 mb-8">
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-xl border-4 border-white dark:border-gray-700 bg-primary-100 dark:bg-primary-900/30 relative flex items-center justify-center">
                                        {profile.profilePicture ? (
                                            <>
                                                {isImageLoading && (
                                                    <SkeletonAvatar size="lg" className="absolute inset-0 z-10" />
                                                )}
                                                <img
                                                    src={profile.profilePicture}
                                                    alt="Profile"
                                                    className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                                                    onLoad={() => setIsImageLoading(false)}
                                                    onError={() => setIsImageLoading(false)}
                                                />
                                            </>
                                        ) : (
                                            <span className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                                                {profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => {
                                            setNewPfpUrl(profile.profilePicture || '');
                                            setIsPfpModalOpen(true);
                                        }}
                                        className="absolute -bottom-2 -right-2 p-3 bg-primary-600 text-white rounded-2xl shadow-lg hover:bg-primary-700 transition active:scale-90 border-2 border-white dark:border-gray-800"
                                        title="Edit Foto Profil"
                                    >
                                        <CameraIcon className="w-5 h-5" />
                                    </button>
                                </div>
                                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Foto Profil Pengguna</p>
                            </div>

                            <form onSubmit={handleSaveProfile} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">Nama Lengkap / Instansi</label>
                                    <input
                                        required
                                        type="text"
                                        value={profile.name}
                                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                                        className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border border-transparent rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-gray-200 shadow-sm outline-none transition-all"
                                        placeholder="Masukkan nama lengkap atau nama instansi"
                                    />
                                </div>
                                
                                <div className="pt-4">
                                    <button 
                                        type="submit"
                                        disabled={saveStatus === 'saving'}
                                        className="w-full py-4 bg-primary-600 text-white font-bold rounded-2xl shadow-xl hover:bg-primary-700 transition active:scale-[0.98] flex items-center justify-center space-x-2 disabled:bg-primary-400"
                                    >
                                        {saveStatus === 'saving' ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <CheckIcon className="w-5 h-5" />
                                                <span>Simpan Profil</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            )}

            {activeTab === 'sharia' && (
                <div className="space-y-8 animate-fadeIn">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 border-b dark:border-gray-700 pb-5">Konfigurasi Syariah</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">Nisab Zakat Profesi (%)</label>
                            <input 
                                type="number" 
                                step="0.1"
                                value={profile.zakatRate} 
                                onChange={(e) => setProfile({...profile, zakatRate: parseFloat(e.target.value)})}
                                className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border border-transparent rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-gray-200 shadow-sm outline-none transition-all"
                                placeholder="Contoh: 2.5"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">Preferensi Akad Utama</label>
                            <select 
                                value={profile.preferredAkad} 
                                onChange={(e) => setProfile({...profile, preferredAkad: e.target.value})}
                                className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border border-transparent rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-gray-200 shadow-sm outline-none cursor-pointer transition-all"
                            >
                                <option>Murabahah (Jual Beli)</option>
                                <option>Mudharabah (Bagi Hasil)</option>
                                <option>Musyarakah (Kemitraan)</option>
                                <option>Ijarah (Sewa)</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 ml-1">Metode Kalender Operasional</label>
                            <div className="flex space-x-6">
                                <label className="flex items-center cursor-pointer group">
                                    <div className="relative">
                                        <input type="radio" name="calc" checked={profile.calculationMethod === 'Masehi'} onChange={() => setProfile({...profile, calculationMethod: 'Masehi'})} className="sr-only" />
                                        <div className={`w-5 h-5 rounded-full border-2 transition-all ${profile.calculationMethod === 'Masehi' ? 'border-primary-600 bg-primary-600' : 'border-gray-300 dark:border-gray-600'}`}>
                                            {profile.calculationMethod === 'Masehi' && <CheckIcon className="w-4 h-4 text-white" />}
                                        </div>
                                    </div>
                                    <span className={`ml-3 text-sm font-bold transition-colors ${profile.calculationMethod === 'Masehi' ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>Masehi (Umum)</span>
                                </label>
                                <label className="flex items-center cursor-pointer group">
                                    <div className="relative">
                                        <input type="radio" name="calc" checked={profile.calculationMethod === 'Hijri'} onChange={() => setProfile({...profile, calculationMethod: 'Hijri'})} className="sr-only" />
                                        <div className={`w-5 h-5 rounded-full border-2 transition-all ${profile.calculationMethod === 'Hijri' ? 'border-primary-600 bg-primary-600' : 'border-gray-300 dark:border-gray-600'}`}>
                                            {profile.calculationMethod === 'Hijri' && <CheckIcon className="w-4 h-4 text-white" />}
                                        </div>
                                    </div>
                                    <span className={`ml-3 text-sm font-bold transition-colors ${profile.calculationMethod === 'Hijri' ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>Hijriah (Syar'i)</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="pt-6">
                        <button 
                            type="button"
                            onClick={handleSaveProfile}
                            className="w-full py-4 bg-primary-600 text-white font-bold rounded-2xl shadow-xl hover:bg-primary-700 transition active:scale-[0.98]"
                        >
                            Simpan Preferensi Syariah
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'app' && (
                <div className="space-y-10 animate-fadeIn">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 border-b dark:border-gray-700 pb-5 mb-6">Aplikasi & Tampilan</h3>
                        <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                            <div>
                                <p className="font-bold text-gray-800 dark:text-gray-200">Mode Visual</p>
                                <p className="text-xs text-gray-500 mt-0.5">Pilih antara tema terang atau gelap.</p>
                            </div>
                            <button 
                                type="button"
                                onClick={toggleTheme}
                                className="p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-90"
                            >
                                {theme === 'light' ? <MoonIcon className="w-7 h-7 text-indigo-600" /> : <SunIcon className="w-7 h-7 text-yellow-400" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 border-b dark:border-gray-700 pb-5 mb-6">Arsip & Integritas Data</h3>
                        <div className="grid grid-cols-1 gap-5">
                            <button 
                                type="button"
                                onClick={handleExportData}
                                className="flex items-center justify-between p-6 bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/50 rounded-2xl group hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-all shadow-sm"
                            >
                                <div className="text-left">
                                    <p className="font-bold text-primary-800 dark:text-primary-300">Ekspor Semua Data</p>
                                    <p className="text-xs text-primary-600 dark:text-primary-400 mt-0.5">Unduh cadangan data Anda ke format JSON.</p>
                                </div>
                                <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                                    <DownloadIcon className="w-6 h-6 text-primary-600" />
                                </div>
                            </button>

                            <button 
                                type="button"
                                onClick={handleResetSystem}
                                className="flex items-center justify-between p-6 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-2xl group hover:bg-red-100 dark:hover:bg-red-900/40 transition-all shadow-sm"
                            >
                                <div className="text-left">
                                    <p className="font-bold text-red-800 dark:text-red-300">Reset Sistem Platform</p>
                                    <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">Hapus semua data muamalah secara permanen.</p>
                                </div>
                                <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                                    <TrashIcon className="w-6 h-6 text-red-600" />
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button 
                            type="button"
                            onClick={handleLogout}
                            className="w-full py-4 flex items-center justify-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-2xl hover:bg-red-600 hover:text-white dark:hover:bg-primary-100 transition-all shadow-xl active:scale-95"
                        >
                            <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-3" />
                            Keluar dari Sesi SyariahOS
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'help' && (
                <div className="space-y-8 animate-fadeIn pb-10">
                    <div>
                        {/* MODIFIED: Changed from 'Pusat Bantuan & Panduan' to 'Pusat Bantuan' */}
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 border-b dark:border-gray-700 pb-5 mb-6">Pusat Bantuan</h3>
                        {/* MODIFIED: Changed description text */}
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">Temukan jawaban atas pertanyaan umum seputar platform SyariahOS.</p>
                    </div>

                    {/* FAQ Accordion */}
                    <div className="space-y-3">
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 mb-2">FAQ - Pertanyaan Umum</p>
                        {faqData.map((item, index) => (
                            <div key={index} className="border dark:border-gray-700 rounded-2xl overflow-hidden bg-gray-50/50 dark:bg-gray-900/30">
                                <button 
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                    className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{item.q}</span>
                                    {openFaq === index ? <ChevronDownIcon className="w-5 h-5 text-primary-500" /> : <ChevronRightIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />}
                                </button>
                                {openFaq === index && (
                                    <div className="px-5 pb-5 animate-slideDown">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.a}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* REMOVED: Support Cards section containing 'Dokumentasi Lengkap' and 'Hubungi Support' */}
                </div>
            )}
        </div>
      </div>

      {/* Profile Picture Edit Modal */}
      {isPfpModalOpen && (
        <ModalPortal>
        <div className="fixed inset-0 w-full h-full bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl p-8 shadow-2xl animate-fadeIn border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold dark:text-white tracking-tight">Ganti Foto Profil</h3>
                    <button 
                        type="button" 
                        onClick={() => {
                            setIsPfpModalOpen(false);
                            setUploadError(null);
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all"
                    >
                        <XMarkIcon className="w-6 h-6 text-gray-400" />
                    </button>
                </div>
                
                {/* Modal Tabs */}
                <div className="flex p-1 bg-gray-100 dark:bg-gray-900 rounded-xl mb-8">
                    <button 
                        onClick={() => setPfpSourceType('url')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${pfpSourceType === 'url' ? 'bg-white dark:bg-gray-800 shadow-sm text-primary-600' : 'text-gray-500'}`}
                    >
                        Link URL
                    </button>
                    <button 
                        onClick={() => setPfpSourceType('upload')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${pfpSourceType === 'upload' ? 'bg-white dark:bg-gray-800 shadow-sm text-primary-600' : 'text-gray-500'}`}
                    >
                        Unggah File
                    </button>
                </div>

                <form onSubmit={handleUpdatePfp} className="space-y-6">
                    <div className="flex justify-center mb-4">
                        <div className="w-28 h-28 rounded-3xl overflow-hidden shadow-lg border-2 border-primary-100 dark:border-primary-900 bg-gray-50 dark:bg-gray-900">
                            <img src={newPfpUrl} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                    </div>

                    {pfpSourceType === 'url' ? (
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">URL Gambar</label>
                            <input 
                                required
                                type="url" 
                                value={newPfpUrl} 
                                onChange={e => setNewPfpUrl(e.target.value)} 
                                className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border border-transparent rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm transition-all shadow-inner" 
                                placeholder="https://images.unsplash.com/..."
                            />
                            <p className="text-[10px] text-gray-400 mt-2 ml-1 italic">Link langsung ke file JPG/PNG/WebP.</p>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">Pilih File Gambar</label>
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-6 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 transition-all group"
                            >
                                <PlusCircleIcon className="w-8 h-8 text-gray-400 group-hover:text-primary-500 mb-2" />
                                <span className="text-sm font-bold text-gray-500 group-hover:text-primary-600">Klik untuk Pilih Gambar</span>
                                <span className="text-[10px] text-gray-400 mt-1">PNG, JPG, WebP (Maks 2MB)</span>
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleFileChange}
                            />
                        </div>
                    )}

                    {uploadError && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl border border-red-100 dark:border-red-900/30">
                            {uploadError}
                        </div>
                    )}

                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setIsPfpModalOpen(false);
                                setUploadError(null);
                            }}
                            disabled={saveStatus === 'saving'}
                            className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold rounded-2xl hover:bg-gray-200 transition active:scale-[0.98] disabled:opacity-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={saveStatus === 'saving'}
                            className="flex-1 py-4 bg-primary-600 text-white font-bold rounded-2xl shadow-xl hover:bg-primary-700 transition active:scale-[0.98] disabled:bg-primary-400 flex items-center justify-center"
                        >
                            {saveStatus === 'saving' ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                'Pasang Foto'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
        </ModalPortal>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={modalAction || undefined}
        title={modalTitle}
        message={modalMessage}
        type={modalType}
        showCancel={modalShowCancel}
      />
    </div>
  );
};

export default Settings;
