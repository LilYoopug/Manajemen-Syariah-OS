
import React, { useState, useMemo, useEffect } from 'react';
import useLocalStorage from '@/hooks/useLocalStorage';
import { 
    UserIcon, TrashIcon, CheckCircleIcon, XMarkIcon, 
    Cog6ToothIcon, DownloadIcon, ChevronRightIcon 
} from '@/components/common/Icons';
import type { User } from '@/types';

declare const jsPDF: any;
declare const XLSX: any;

const INITIAL_USERS: User[] = [
  { id: '1', name: 'Admin Syariah', email: 'admin@syariahos.com', role: 'admin', status: 'active', lastLogin: '2023-10-27 08:30' },
  { id: '2', name: 'Budi Setiawan', email: 'budi@example.com', role: 'user', status: 'active', lastLogin: '2023-10-26 14:20' },
  { id: '3', name: 'Siti Aminah', email: 'siti@example.com', role: 'user', status: 'active', lastLogin: '2023-10-25 10:15' },
  { id: '4', name: 'Ahmad Junaidi', email: 'ahmad@example.com', role: 'user', status: 'suspended', lastLogin: '2023-10-20 16:45' },
  { id: '5', name: 'Zulkifli Hasan', email: 'zul@example.com', role: 'user', status: 'active', lastLogin: '2023-10-19 09:00' },
  { id: '6', name: 'Fatimah Az-Zahra', email: 'fatimah@example.com', role: 'user', status: 'active', lastLogin: '2023-10-18 11:30' },
  { id: '7', name: 'Umar Bin Khattab', email: 'umar@example.com', role: 'user', status: 'active', lastLogin: '2023-10-17 13:45' },
];

const AdminUserManager: React.FC = () => {
  const [users, setUsers] = useLocalStorage<User[]>('syariahos_admin_users', INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  // Reset to first page on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const toggleStatus = (id: string) => {
    setUsers(users.map(u => {
      if (u.id === id && u.role !== 'admin') {
        return { ...u, status: u.status === 'active' ? 'suspended' : 'active' };
      }
      return u;
    }));
  };

  const deleteUser = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const userToDelete = users.find(u => u.id === id);
    if (userToDelete?.role === 'admin') {
      alert('Tidak dapat menghapus akun Administrator.');
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus user ${userToDelete?.name}?`)) {
        setUsers(users.filter(u => u.id !== id));
    }
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
        setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
        setEditingUser(null);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF.jsPDF();
    doc.text("Daftar Pengguna SyariahOS", 20, 10);
    let y = 30;
    filteredUsers.forEach(u => {
      doc.text(`${u.name} | ${u.email} | ${u.role} | ${u.status}`, 20, y);
      y += 10;
    });
    doc.save("users-list.pdf");
  };

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredUsers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "users-list.xlsx");
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Manajemen Ummat</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Kelola hak akses dan status operasional anggota platform.</p>
        </div>
        <div className="flex items-center space-x-3">
            <button 
              type="button"
              onClick={exportPDF} 
              className="flex items-center px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200 transition text-sm font-bold shadow-sm active:scale-95 border border-transparent dark:border-gray-600"
            >
                <DownloadIcon className="w-4 h-4 mr-2" />
                PDF
            </button>
            <button 
              type="button"
              onClick={exportExcel} 
              className="flex items-center px-5 py-2.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-xl hover:bg-emerald-100 transition text-sm font-bold shadow-sm active:scale-95 border border-emerald-100 dark:border-emerald-800/30"
            >
                <DownloadIcon className="w-4 h-4 mr-2" />
                Excel
            </button>
            <button type="button" className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg text-sm active:scale-95">
                Tambah User
            </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
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
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Identitas</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Wewenang</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Status Sesi</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest text-right">Moderasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-4">
                      <div className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-gray-700 border dark:border-gray-600 flex items-center justify-center shadow-sm">
                        <UserIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2.5 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider ${user.role === 'admin' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-gray-50 text-gray-500 border border-gray-100'} dark:bg-gray-800 dark:border-gray-700`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${user.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'} dark:bg-gray-800`}>
                      <div className={`w-1.5 h-1.5 rounded-full mr-2 ${user.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                      {user.status === 'active' ? 'Aktif' : 'Terblokir'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button type="button" onClick={() => setEditingUser(user)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all" title="Edit Profil"><Cog6ToothIcon className="w-5 h-5"/></button>
                        {user.role !== 'admin' && (
                            <>
                                <button type="button" onClick={() => toggleStatus(user.id)} className={`p-2 transition-all rounded-lg ${user.status === 'active' ? 'text-gray-400 hover:text-amber-600 hover:bg-amber-50' : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'}`} title={user.status === 'active' ? 'Suspend Account' : 'Activate Account'}>
                                    {user.status === 'active' ? <XMarkIcon className="w-5 h-5" /> : <CheckCircleIcon className="w-5 h-5" />}
                                </button>
                                <button type="button" onClick={(e) => deleteUser(e, user.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Hapus Permanen"><TrashIcon className="w-5 h-5" /></button>
                            </>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedUsers.length === 0 && (
                <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 italic">
                        Tidak ada user yang ditemukan.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        {filteredUsers.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                    Menampilkan <span className="text-indigo-600 dark:text-indigo-400">{Math.min(filteredUsers.length, (currentPage - 1) * itemsPerPage + 1)} - {Math.min(filteredUsers.length, currentPage * itemsPerPage)}</span> dari <span className="text-indigo-600 dark:text-indigo-400">{filteredUsers.length}</span> user
                </div>
                <div className="flex items-center space-x-1">
                    <button 
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="p-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:text-indigo-600 transition-all shadow-sm"
                    >
                        <ChevronRightIcon className="w-4 h-4 rotate-180" />
                    </button>
                    
                    {[...Array(totalPages)].map((_, i) => (
                        <button 
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all shadow-sm ${
                                currentPage === i + 1 
                                ? 'bg-indigo-600 text-white shadow-indigo-200 dark:shadow-none' 
                                : 'bg-white dark:bg-gray-800 text-gray-500 border dark:border-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button 
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:text-indigo-600 transition-all shadow-sm"
                    >
                        <ChevronRightIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        )}
      </div>

      {editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl p-8 shadow-2xl animate-fadeIn border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-bold dark:text-white">Moderasi Anggota</h3>
                    <button type="button" onClick={() => setEditingUser(null)} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-all"><XMarkIcon className="w-6 h-6 text-gray-400" /></button>
                </div>
                <form onSubmit={handleUpdateUser} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Nama Lengkap</label>
                        <input type="text" value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Alamat Email</label>
                        <input type="email" value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Peran Akses</label>
                        <select value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value as any})} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm cursor-pointer">
                            <option value="user">User Standar</option>
                            <option value="admin">Administrator</option>
                        </select>
                    </div>
                    <div className="pt-4">
                      <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition active:scale-[0.98]">Update Konfigurasi</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManager;
