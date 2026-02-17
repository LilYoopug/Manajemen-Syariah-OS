
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { adminApi, getErrorMessage } from '@/lib/api-services';
import type { AdminUser } from '@/types/api';
import {
    UserIcon, TrashIcon, XMarkIcon,
    Cog6ToothIcon, DownloadIcon, ChevronRightIcon, PlusIcon,
    EyeIcon, EyeSlashIcon
} from '@/components/common/Icons';
import { Skeleton, SkeletonAvatar } from '@/components/common/Skeleton';
import ModalPortal from '@/components/common/ModalPortal';
import ConfirmModal, { type ConfirmModalType } from '@/components/common/ConfirmModal';

declare const jsPDF: any;
declare const XLSX: any;

interface NewUserData {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  role: 'admin' | 'user';
}

const AdminUserManager: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newUser, setNewUser] = useState<NewUserData>({
    name: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    role: 'user'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Inline error states for modals
  const [createError, setCreateError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  // Modal state (for confirmations only)
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

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Debounce timer
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchUsers = useCallback(async (search?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminApi.getUsers(search);
      setUsers(data);
      setCurrentPage(1);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchUsers(searchQuery.trim() || undefined);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, fetchUsers]);

  const totalPages = Math.ceil(users.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return users.slice(start, start + itemsPerPage);
  }, [users, currentPage]);

  const deleteUser = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();

    const userToDelete = users.find(u => u.id === id);
    if (!userToDelete) return;

    const confirmMsg = userToDelete.role === 'admin'
      ? `Peringatan: Anda akan menghapus admin "${userToDelete.name}". Lanjutkan?`
      : `Apakah Anda yakin ingin menghapus user "${userToDelete.name}"?`;

    showModal(
      'Konfirmasi Hapus',
      confirmMsg,
      'warning',
      async () => {
        try {
          await adminApi.deleteUser(id);
          setUsers(users.filter(u => u.id !== id));
        } catch (err) {
          showModal('Gagal Menghapus', getErrorMessage(err), 'error');
        }
      },
      true
    );
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      setEditError(null); // Clear previous error
      setIsSubmitting(true);
      try {
        const updated = await adminApi.updateUser(editingUser.id, {
          name: editingUser.name,
          email: editingUser.email,
          role: editingUser.role,
        });
        setUsers(users.map(u => u.id === updated.id ? updated : u));
        setEditingUser(null);
      } catch (err) {
        setEditError(getErrorMessage(err));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null); // Clear previous error
    if (newUser.password !== newUser.passwordConfirmation) {
      setCreateError('Password dan konfirmasi password tidak cocok!');
      return;
    }
    if (newUser.password.length < 8) {
      setCreateError('Password minimal 8 karakter!');
      return;
    }
    setIsSubmitting(true);
    try {
      const created = await adminApi.createUser({
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
      });
      setUsers([...users, created]);
      setIsCreating(false);
      setNewUser({ name: '', email: '', password: '', passwordConfirmation: '', role: 'user' });
    } catch (err) {
      setCreateError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportPDF = async () => {
    try {
      const blob = await adminApi.exportUsersPdf();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '_').replace(/-/g, '_');
      a.href = url;
      a.download = `laporan_pengguna_detail_${timestamp}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      // Open in new tab for viewing/printing
      window.open(url, '_blank');
    } catch (err) {
      showModal('Gagal Ekspor PDF', getErrorMessage(err), 'error');
    }
  };

  const exportExcel = async () => {
    try {
      const blob = await adminApi.exportUsersXlsx();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '_').replace(/-/g, '_');
      a.href = url;
      a.download = `laporan_pengguna_detail_${timestamp}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showModal('Gagal Ekspor Excel', getErrorMessage(err), 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Manajemen Ummat</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Kelola hak akses anggota platform.</p>
        </div>
        <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={exportPDF}
              className="flex items-center px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200 transition text-sm font-bold shadow-sm active:scale-95 border border-transparent dark:border-gray-600"
              title="Ekspor laporan lengkap dengan detail tugas per pengguna"
            >
                <DownloadIcon className="w-4 h-4 mr-2" />
                Laporan PDF
            </button>
            <button
              type="button"
              onClick={exportExcel}
              className="flex items-center px-5 py-2.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-xl hover:bg-emerald-100 transition text-sm font-bold shadow-sm active:scale-95 border border-emerald-100 dark:border-emerald-800/30"
              title="Ekspor data CSV dengan detail tugas per pengguna"
            >
                <DownloadIcon className="w-4 h-4 mr-2" />
                Data Excel
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="flex items-center px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg text-sm active:scale-95"
            >
                <PlusIcon className="w-4 h-4 mr-2" />
                Tambah User
            </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
        <div className="p-4 sm:p-6 border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 flex-shrink-0">
            <div className="relative">
                <input
                    type="text"
                    placeholder="Cari nama atau email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-5 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm shadow-sm"
                />
            </div>
        </div>
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b dark:border-gray-700 sticky top-0 z-10">
              <tr>
                <th className="px-4 sm:px-6 py-4 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest text-left min-w-[180px]">Identitas</th>
                <th className="px-4 sm:px-6 py-4 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest text-left min-w-[200px]">Email</th>
                <th className="px-4 sm:px-6 py-4 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest text-left min-w-[80px]">Role</th>
                <th className="px-4 sm:px-6 py-4 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest text-right min-w-[100px]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors">
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <SkeletonAvatar size="md" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <Skeleton className="h-6 w-14 rounded-lg" />
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Skeleton className="w-8 h-8 rounded-lg" />
                        <Skeleton className="w-8 h-8 rounded-lg" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <>
                  {paginatedUsers.map((user) => {
                    const initials = user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                    return (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors group">
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center gap-3">
                            {user.profilePicture ? (
                              <img
                                src={user.profilePicture}
                                alt={user.name}
                                className="w-9 h-9 rounded-lg object-cover shadow-sm border border-gray-200 dark:border-gray-600 flex-shrink-0"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 border border-indigo-200 dark:border-gray-600 flex items-center justify-center shadow-sm flex-shrink-0">
                                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{initials}</span>
                              </div>
                            )}
                            <span className="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <span className="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{user.email}</span>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <span className={`inline-flex px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider whitespace-nowrap ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button type="button" onClick={() => setEditingUser(user)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all" title="Edit User"><Cog6ToothIcon className="w-4 h-4"/></button>
                            <button type="button" onClick={(e) => deleteUser(e, user.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all" title="Hapus User"><TrashIcon className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {paginatedUsers.length === 0 && (
                    <tr>
                        <td colSpan={4} className="px-4 sm:px-6 py-12 text-center text-gray-500 dark:text-gray-400 italic">
                            Tidak ada user yang ditemukan.
                        </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {users.length > 0 && (
            <div className="px-4 sm:px-6 py-3 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
                {isLoading ? (
                  <>
                    <Skeleton className="h-4 w-40" />
                    <div className="flex items-center gap-1">
                      <Skeleton className="w-7 h-7 rounded-lg" />
                      <Skeleton className="w-7 h-7 rounded-lg" />
                      <Skeleton className="w-7 h-7 rounded-lg" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        Menampilkan <span className="font-semibold text-indigo-600 dark:text-indigo-400">{Math.min(users.length, (currentPage - 1) * itemsPerPage + 1)} - {Math.min(users.length, currentPage * itemsPerPage)}</span> dari <span className="font-semibold text-indigo-600 dark:text-indigo-400">{users.length}</span> user
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="p-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:text-indigo-600 transition-all shadow-sm"
                        >
                            <ChevronRightIcon className="w-4 h-4 rotate-180" />
                        </button>

                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold transition-all shadow-sm ${
                                    currentPage === i + 1
                                    ? 'bg-indigo-600 text-white shadow-indigo-200 dark:shadow-none'
                                    : 'bg-white dark:bg-gray-800 text-gray-500 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="p-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:text-indigo-600 transition-all shadow-sm"
                        >
                            <ChevronRightIcon className="w-4 h-4" />
                        </button>
                    </div>
                  </>
                )}
            </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <ModalPortal>
        <div className="fixed inset-0 w-full h-full bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl p-8 shadow-2xl animate-fadeIn border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-bold dark:text-white">Edit User</h3>
                    <button type="button" onClick={() => { setEditingUser(null); setEditError(null); }} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-all"><XMarkIcon className="w-6 h-6 text-gray-400" /></button>
                </div>
                {/* Inline Error Display */}
                {editError && (
                  <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">{editError}</p>
                  </div>
                )}
                <form onSubmit={handleUpdateUser} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Nama Lengkap</label>
                        <input type="text" value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm" placeholder="Masukkan nama lengkap" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Alamat Email</label>
                        <input type="email" value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm" placeholder="user@example.com" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Peran Akses</label>
                        <select value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value as 'admin' | 'user'})} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm cursor-pointer">
                            <option value="user">User Standar</option>
                            <option value="admin">Administrator</option>
                        </select>
                    </div>
                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                            Memproses...
                          </>
                        ) : (
                          'Update User'
                        )}
                      </button>
                    </div>
                </form>
            </div>
        </div>
        </ModalPortal>
      )}

      {/* Create User Modal */}
      {isCreating && (
        <ModalPortal>
        <div className="fixed inset-0 w-full h-full bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl p-8 shadow-2xl animate-fadeIn border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-bold dark:text-white">Tambah User Baru</h3>
                    <button type="button" onClick={() => { setIsCreating(false); setCreateError(null); }} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-all"><XMarkIcon className="w-6 h-6 text-gray-400" /></button>
                </div>
                {/* Inline Error Display */}
                {createError && (
                  <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">{createError}</p>
                  </div>
                )}
                <form onSubmit={handleCreateUser} className="space-y-5">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Nama Lengkap</label>
                        <input
                          type="text"
                          required
                          value={newUser.name}
                          onChange={e => setNewUser({...newUser, name: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                          placeholder="Masukkan nama lengkap"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Alamat Email</label>
                        <input
                          type="email"
                          required
                          value={newUser.email}
                          onChange={e => setNewUser({...newUser, email: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                          placeholder="user@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Password</label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            minLength={8}
                            value={newUser.password}
                            onChange={e => setNewUser({...newUser, password: e.target.value})}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm pr-12"
                            placeholder="Minimal 8 karakter"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-indigo-500 transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                          </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Konfirmasi Password</label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            value={newUser.passwordConfirmation}
                            onChange={e => setNewUser({...newUser, passwordConfirmation: e.target.value})}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm pr-12"
                            placeholder="Ulangi password"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-indigo-500 transition-colors"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                          </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Peran Akses</label>
                        <select
                          value={newUser.role}
                          onChange={e => setNewUser({...newUser, role: e.target.value as 'admin' | 'user'})}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm cursor-pointer"
                        >
                            <option value="user">User Standar</option>
                            <option value="admin">Administrator</option>
                        </select>
                    </div>
                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                            Membuat Akun...
                          </>
                        ) : (
                          'Buat Akun User'
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

export default AdminUserManager;
