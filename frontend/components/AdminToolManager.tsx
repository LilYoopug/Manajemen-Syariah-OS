
import React, { useState, useMemo } from 'react';
import useLocalStorage from '@/hooks/useLocalStorage';
import { TOOLS_DATA } from '@/constants';
// FIX: Import ChevronDownIcon to resolve 'Cannot find name' errors on lines 142 and 159.
import { 
    BriefcaseIcon, TrashIcon, Cog6ToothIcon, PlusCircleIcon, 
    XMarkIcon, LinkIcon, MagnifyingGlassIcon, FunnelIcon, CalendarIcon,
    ChevronDownIcon 
} from '@/components/common/Icons';
import type { Tool } from '@/types';
import { ToolCategory } from '@/types';

const AdminToolManager: React.FC = () => {
  // Initialize with base data and ensure createdAt exists for existing mock data
  const [tools, setTools] = useLocalStorage<Tool[]>('syariahos_admin_tools', TOOLS_DATA.map(t => ({
      ...t, 
      createdAt: t.createdAt || Date.now() - (Math.random() * 1000 * 60 * 60 * 24 * 30) // Random dates within last 30 days for mock
  })));
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Partial<Tool> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ToolCategory | 'Semua'>('Semua');
  const [sortByDate, setSortByDate] = useState<'newest' | 'oldest'>('newest');

  const filteredTools = useMemo(() => {
    const query = searchQuery.toLowerCase();
    
    let result = tools.filter(t => 
      (t.name.toLowerCase().includes(query) || 
      t.category.toLowerCase().includes(query) || 
      t.description.toLowerCase().includes(query)) &&
      (categoryFilter === 'Semua' || t.category === categoryFilter)
    );

    // Sort by date
    result.sort((a, b) => {
        const timeA = a.createdAt || 0;
        const timeB = b.createdAt || 0;
        return sortByDate === 'newest' ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [tools, searchQuery, categoryFilter, sortByDate]);

  const deleteTool = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const toolToDelete = tools.find(t => t.id === id);
    if (confirm(`Yakin ingin menghapus tool "${toolToDelete?.name}" dari katalog publik?`)) {
        setTools(tools.filter(t => t.id !== id));
    }
  };

  const openAddModal = () => {
    setEditingTool({
      id: Date.now().toString(),
      name: '',
      category: ToolCategory.Individu,
      description: '',
      link: '',
      icon: BriefcaseIcon,
      inputs: '',
      outputs: '',
      benefits: '',
      shariaBasis: '',
      relatedDirectoryIds: [],
      relatedDalil: { text: '', source: '' },
      createdAt: Date.now()
    });
    setIsModalOpen(true);
  };

  const openEditModal = (tool: Tool) => {
    setEditingTool(tool);
    setIsModalOpen(true);
  };

  const handleSaveTool = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTool) {
      const toolToSave = { ...editingTool, createdAt: editingTool.createdAt || Date.now() } as Tool;
      const exists = tools.some(t => t.id === toolToSave.id);
      if (exists) {
        setTools(tools.map(t => t.id === toolToSave.id ? toolToSave : t));
      } else {
        setTools([toolToSave, ...tools]);
      }
      setIsModalOpen(false);
      setEditingTool(null);
    }
  };

  const formatDate = (timestamp?: number) => {
      if (!timestamp) return '-';
      return new Date(timestamp).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
      });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Pusat Muamalah (Tools)</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Kelola koleksi alat bantu produktivitas berbasis Syariah.</p>
        </div>
        <button type="button" onClick={openAddModal} className="flex items-center px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg text-sm active:scale-95 self-start md:self-auto">
            <PlusCircleIcon className="w-5 h-5 mr-2" />
            Tambah Tool
        </button>
      </div>

      {/* Toolbar - Search & Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex flex-col lg:flex-row items-center gap-4">
          <div className="relative w-full lg:flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                  type="text" 
                  placeholder="Cari tool berdasarkan nama, kategori, atau deskripsi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-5 py-3 bg-gray-50 dark:bg-gray-900 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm shadow-sm"
              />
          </div>
          
          <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-48">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FunnelIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <select 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as any)}
                    className="w-full pl-9 pr-8 py-3 bg-gray-50 dark:bg-gray-900 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm shadow-sm appearance-none cursor-pointer font-medium text-gray-600 dark:text-gray-300"
                  >
                      <option value="Semua">Semua Kategori</option>
                      {Object.values(ToolCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                  </div>
              </div>

              <div className="relative flex-1 lg:w-48">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CalendarIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <select 
                    value={sortByDate}
                    onChange={(e) => setSortByDate(e.target.value as any)}
                    className="w-full pl-9 pr-8 py-3 bg-gray-50 dark:bg-gray-900 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm shadow-sm appearance-none cursor-pointer font-medium text-gray-600 dark:text-gray-300"
                  >
                      <option value="newest">Terbaru</option>
                      <option value="oldest">Terlama</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                  </div>
              </div>
          </div>
      </div>

      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <div key={tool.id} className="bg-white dark:bg-gray-800 p-7 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex flex-col hover:shadow-lg transition-all group relative">
              <div className="flex items-start justify-between mb-5">
                <div className="p-3.5 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-xl shadow-sm group-hover:border-indigo-100 dark:group-hover:border-indigo-900 transition-colors">
                  <BriefcaseIcon className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                  <button type="button" onClick={() => openEditModal(tool)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded-lg transition-all"><Cog6ToothIcon className="w-5 h-5"/></button>
                  <button type="button" onClick={(e) => deleteTool(e, tool.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-lg transition-all"><TrashIcon className="w-5 h-5"/></button>
                </div>
              </div>
              
              <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">{tool.category}</p>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">{tool.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex-grow leading-relaxed line-clamp-3">
                {tool.description}
              </p>
              
              <div className="mt-5 pt-4 border-t border-gray-50 dark:border-gray-700 flex flex-col space-y-2">
                <div className="flex items-center text-[9px] font-bold text-gray-400">
                    <CalendarIcon className="w-2.5 h-2.5 mr-1 text-gray-400/60" />
                    <span className="uppercase tracking-tighter">Dibuat: {formatDate(tool.createdAt)}</span>
                </div>

                <div className="flex items-center text-[10px] text-gray-400 font-bold uppercase tracking-tighter min-w-0">
                    {tool.link ? (
                        <>
                            <LinkIcon className="w-3.5 h-3.5 mr-2 text-indigo-400 flex-shrink-0" />
                            <span className="truncate">{tool.link}</span>
                        </>
                    ) : (
                        <span className="text-gray-300 italic">No direct link</span>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-700 p-12 text-center shadow-sm">
            <p className="text-gray-500 dark:text-gray-400 font-medium">Tidak ada tool yang ditemukan untuk filter ini.</p>
        </div>
      )}

      {isModalOpen && editingTool && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl p-8 shadow-2xl animate-fadeIn border border-gray-100 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-bold dark:text-white">{editingTool.name ? 'Edit Konfigurasi Tool' : 'Registrasi Tool Baru'}</h3>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-all"><XMarkIcon className="w-6 h-6 text-gray-400" /></button>
                </div>
                <form onSubmit={handleSaveTool} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Sektor Penggunaan</label>
                        <select value={editingTool.category} onChange={e => setEditingTool({...editingTool, category: e.target.value as any})} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm cursor-pointer">
                            {Object.values(ToolCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Nama Katalog Tool</label>
                        <input required type="text" value={editingTool.name} onChange={e => setEditingTool({...editingTool, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm" placeholder="Contoh: Financial Planner Syariah" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Deskripsi Ringkas</label>
                        <textarea required rows={2} value={editingTool.description} onChange={e => setEditingTool({...editingTool, description: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm" placeholder="Contoh: Alokasikan penghasilan sesuai kaidah syariah." />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Inputs</label>
                            <textarea rows={3} value={editingTool.inputs} onChange={e => setEditingTool({...editingTool, inputs: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-sm" placeholder="Contoh: Penghasilan, Kebutuhan Pokok, Utang" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Outputs</label>
                            <textarea rows={3} value={editingTool.outputs} onChange={e => setEditingTool({...editingTool, outputs: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-sm" placeholder="Contoh: Alokasi Zakat, Sedekah, Tabungan Haji" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Manfaat Utama</label>
                        <input type="text" value={editingTool.benefits} onChange={e => setEditingTool({...editingTool, benefits: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm" placeholder="Contoh: Mencapai keberkahan finansial." />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Landasan Syariah (Opsional)</label>
                        <input type="text" value={editingTool.shariaBasis || ''} onChange={e => setEditingTool({...editingTool, shariaBasis: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm" placeholder="Contoh: Hifdz al-Mal (Menjaga Harta)" />
                    </div>

                    <div className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-4">
                        <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest text-center">Dalil Pendukung (Opsional)</p>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Teks Dalil (Arab/Terjemah)</label>
                            <textarea rows={3} value={editingTool.relatedDalil?.text} onChange={e => setEditingTool({...editingTool, relatedDalil: { ...editingTool.relatedDalil!, text: e.target.value }})} className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-sm italic" placeholder="Tuliskan ayat atau hadits..." />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Sumber Dalil</label>
                            <input type="text" value={editingTool.relatedDalil?.source} onChange={e => setEditingTool({...editingTool, relatedDalil: { ...editingTool.relatedDalil!, source: e.target.value }})} className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-xs" placeholder="Contoh: QS. Al-Furqan: 67" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1">URL Akses Langsung</label>
                        <input type="text" value={editingTool.link} onChange={e => setEditingTool({...editingTool, link: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-transparent rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-sm" placeholder="https://app.syariahos.com/planner" />
                    </div>

                    <div className="pt-4">
                        <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition active:scale-[0.98]">Simpan ke Katalog</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminToolManager;