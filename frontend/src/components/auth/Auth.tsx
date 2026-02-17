/**
 * Auth Component - Connected to Backend API
 */

import React, { useState } from 'react';
import { DashboardIcon, EyeIcon, EyeSlashIcon, UserIcon, SparklesIcon } from '@/components/common/Icons';
import { useAuth } from '@/contexts/AuthContext';
import type { View } from '@/types';

interface AuthProps {
  type: 'login' | 'register';
  setView: (view: View) => void;
}

const Auth: React.FC<AuthProps> = ({ type, setView }) => {
  const { login, register, error, clearError, isLoading: authLoading, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [localError, setLocalError] = useState<string | null>(null);

  const isLogin = type === 'login';
  const isLoading = authLoading;

  // Dev login for testing (uses actual API with dev credentials)
  const handleDevLogin = async (role: 'admin' | 'user') => {
    const devCredentials = {
      admin: { email: 'admin@syariahos.com', password: 'Admin123!' },
      user: { email: 'budi.santoso@email.com', password: 'User123!' }
    };

    try {
      await login(devCredentials[role]);
    } catch {
      setLocalError('Dev login failed. Make sure the backend is running and seeded with test users.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    // Validate password match for registration
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setLocalError('Password dan Verifikasi Password tidak cocok!');
      return;
    }

    try {
      if (isLogin) {
        await login({
          email: formData.email,
          password: formData.password,
        });
      } else {
        await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          password_confirmation: formData.confirmPassword,
        });
      }
      // Navigation is handled by App.tsx based on user role
    } catch {
      // Error is handled by auth context
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-12 relative overflow-hidden">

      {/* Background Decorations Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary-500/10 dark:bg-primary-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-secondary-500/10 dark:bg-secondary-600/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]"></div>
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
             style={{ backgroundImage: 'radial-gradient(circle, #3b82f6 1.5px, transparent 1.5px)', backgroundSize: '48px 48px' }}>
        </div>
      </div>

      <div className="max-w-md w-full space-y-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/40 dark:border-gray-700/50 relative z-10 animate-fadeIn">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-3.5 bg-primary-600 rounded-2xl shadow-lg mb-6 transform hover:rotate-6 transition-transform cursor-default">
            <DashboardIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {isLogin ? 'Masuk ke SyariahOS' : 'Daftar Akun Baru'}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 font-medium">
            {isLogin
              ? 'Selamat datang kembali! Kelola amanah dengan profesional.'
              : 'Mulai perjalanan manajemen berbasis Syariah yang terpadu.'}
          </p>
        </div>

        {/* Error Display */}
        {displayError && (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl border border-red-100 dark:border-red-800/30">
            <p className="text-sm font-medium text-red-600 dark:text-red-400 text-center">
              {displayError}
            </p>
          </div>
        )}

        {/* Dev Buttons Area */}
        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl border border-amber-100 dark:border-amber-800/30">
          <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-3 text-center">Development Shortcuts</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleDevLogin('admin')}
              disabled={isLoading}
              className="px-3 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition shadow-sm flex items-center justify-center disabled:opacity-50"
            >
              <SparklesIcon className="w-3 h-3 mr-1.5" />
              Dev Admin
            </button>
            <button
              type="button"
              onClick={() => handleDevLogin('user')}
              disabled={isLoading}
              className="px-3 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition shadow-sm flex items-center justify-center disabled:opacity-50"
            >
              <UserIcon className="w-3 h-3 mr-1.5" />
              Dev User
            </button>
          </div>
        </div>

        <div className="relative">
          <form
            onSubmit={handleSubmit}
            className={`mt-8 space-y-5 transition-opacity duration-200 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Nama Lengkap</label>
                <input
                  name="name"
                  type="text"
                  required={!isLogin}
                  value={formData.name}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all shadow-sm placeholder:text-gray-400"
                  placeholder="Budi Setiawan"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Email</label>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none block w-full px-4 py-3.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all shadow-sm placeholder:text-gray-400"
                placeholder="nama@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-4 py-3.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all pr-12 shadow-sm placeholder:text-gray-400"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary-500 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Verifikasi Password</label>
                <div className="relative">
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required={!isLogin}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="appearance-none block w-full px-4 py-3.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all pr-12 shadow-sm placeholder:text-gray-400"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary-500 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-base font-bold rounded-2xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all shadow-xl shadow-primary-500/20 active:scale-[0.98] disabled:bg-primary-400 disabled:scale-100"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  isLogin ? 'Masuk Sekarang' : 'Daftar Akun'
                )}
              </button>
            </div>
          </form>

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl z-20">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {isLogin ? 'Memverifikasi...' : 'Mendaftarkan akun...'}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              {isLogin ? 'Baru di SyariahOS?' : 'Sudah memiliki akun?'}
              <button
                type="button"
                onClick={() => { setView(isLogin ? 'register' : 'login'); clearError(); setLocalError(null); }}
                className="ml-2 font-bold text-primary-600 hover:text-primary-500 focus:outline-none transition-all hover:underline underline-offset-4 decoration-2"
              >
                {isLogin ? 'Daftar Gratis' : 'Masuk di Sini'}
              </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
