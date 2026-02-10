
import React, { useState, useMemo } from 'react';
import { 
  DashboardIcon, ToolsIcon, DirectoryIcon, XMarkIcon, 
  ChevronRightIcon, ChevronDownIcon, WandSparklesIcon, 
  Cog6ToothIcon, ArrowLeftOnRectangleIcon, UsersIcon,
  BriefcaseIcon, TrashIcon, PlusCircleIcon, PencilIcon, CheckIcon,
  ClipboardListIcon
} from '@/components/common/Icons';
import type { DirectoryItem, View } from '@/types';

interface SidebarProps {
  view: View;
  setView: (view: View) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  onSelectItem: (item: DirectoryItem) => void;
  directoryData: DirectoryItem[];
  setDirectoryData: React.Dispatch<React.SetStateAction<DirectoryItem[]>>;
}

const DirectorySidebarNode: React.FC<{ 
  item: DirectoryItem; 
  level: number; 
  onSelectItem: (item: DirectoryItem) => void; 
  closeSidebar: () => void; 
  allOpen: boolean; 
  editMode: boolean;
  onEdit: (item: DirectoryItem) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onUpdateTitle: (id: string, newTitle: string) => void;
}> = ({ item, level, onSelectItem, closeSidebar, allOpen, editMode, onEdit, onDelete, onAddChild, onUpdateTitle }) => {
  const [isOpen, setIsOpen] = useState(level < 1);
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(item.title);
  
  const hasChildren = item.children && item.children.length > 0;

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      setIsOpen(!isOpen);
    } else {
      onSelectItem(item);
      if (!editMode) closeSidebar();
    }
  };

  const handleInlineSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempTitle.trim()) {
      onUpdateTitle(item.id, tempTitle.trim());
      setIsInlineEditing(false);
    }
  };

  const isNodeOpen = allOpen || isOpen;

  return (
    <div>
      <div
        className={`group flex items-center w-full py-1.5 text-sm rounded-lg cursor-pointer transition-colors duration-200 ${!hasChildren ? 'hover:bg-primary-100 dark:hover:bg-gray-700/50' : 'hover:bg-gray-100 dark:hover:bg-gray-800/30'}`}
        style={{ paddingLeft: `${level * 1.25 + 1}rem`, paddingRight: '0.5rem' }}
        onClick={handleSelect}
      >
        <div className="flex items-center flex-grow min-w-0">
          {hasChildren ? (
            isNodeOpen ? <ChevronDownIcon className="w-3.5 h-3.5 mr-2 flex-shrink-0 text-gray-400" /> : <ChevronRightIcon className="w-3.5 h-3.5 mr-2 flex-shrink-0 text-gray-400" />
          ) : (
            <span className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
          )}
          
          {isInlineEditing ? (
            <form onSubmit={handleInlineSave} className="flex items-center flex-1 space-x-1" onClick={e => e.stopPropagation()}>
               <input 
                autoFocus
                type="text"
                value={tempTitle}
                onChange={e => setTempTitle(e.target.value)}
                className="flex-1 bg-white dark:bg-gray-800 border-none text-xs p-1 rounded focus:ring-1 focus:ring-primary-500 outline-none h-6"
               />
               <button type="submit" className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded">
                 <CheckIcon className="w-3 h-3" />
               </button>
               <button type="button" onClick={() => { setIsInlineEditing(false); setTempTitle(item.title); }} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                 <XMarkIcon className="w-3 h-3" />
               </button>
            </form>
          ) : (
            <span className={`truncate ${hasChildren ? 'font-semibold text-gray-700 dark:text-gray-200' : 'text-gray-600 dark:text-gray-400'}`}>
              {item.title}
            </span>
          )}
        </div>

        {editMode && !isInlineEditing && (
          <div className="flex items-center space-x-1 ml-2">
            {hasChildren && (
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); onAddChild(item.id); }}
                className="p-1 text-primary-500 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded"
                title="Tambah Sub-Wawasan"
              >
                <PlusCircleIcon className="w-3.5 h-3.5" />
              </button>
            )}
            <button 
              type="button"
              onClick={(e) => { 
                e.stopPropagation(); 
                if (level === 0) {
                  setIsInlineEditing(true);
                } else {
                  onEdit(item); 
                }
              }}
              className="p-1 text-gray-400 hover:text-primary-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              title="Edit"
            >
              <Cog6ToothIcon className="w-3.5 h-3.5" />
            </button>
            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
              title="Hapus"
            >
              <TrashIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
      
      {isNodeOpen && (
        <div className="border-l border-gray-200 dark:border-gray-700 ml-[1.5rem]" style={{ marginLeft: `${level * 1.25 + 1.5}rem` }}>
          {item.children?.map(child => (
            <DirectorySidebarNode 
              key={child.id} 
              item={child} 
              level={level + 1} 
              onSelectItem={onSelectItem} 
              closeSidebar={closeSidebar} 
              allOpen={allOpen}
              editMode={editMode}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              onUpdateTitle={onUpdateTitle}
            />
          ))}
          {editMode && !hasChildren && (
             <button 
                type="button"
                onClick={() => onAddChild(item.id)}
                className="flex items-center w-full py-1 text-[10px] font-bold text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded-lg mt-1 transition-colors"
                style={{ paddingLeft: `1rem` }}
             >
                <PlusCircleIcon className="w-3 h-3 mr-1.5" />
                Tambah Sub-Wawasan
             </button>
          )}
        </div>
      )}
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ 
  view, setView, isSidebarOpen, setSidebarOpen, onSelectItem,
  directoryData, setDirectoryData 
}) => {
  const [isDirectoryOpen, setDirectoryOpen] = useState(true);
  const [directorySearch, setDirectorySearch] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<DirectoryItem> & { parentId?: string } | null>(null);
  
  const [isAddingRootInline, setIsAddingRootInline] = useState(false);
  const [newRootTitle, setNewRootTitle] = useState('');

  const isAdmin = localStorage.getItem('syariahos_role') === 'admin';

  const filteredDirectoryData = useMemo(() => {
    if (!directorySearch) {
      return directoryData;
    }

    const lowercasedQuery = directorySearch.toLowerCase();
    
    const filter = (items: DirectoryItem[]): DirectoryItem[] => {
      return items.reduce<DirectoryItem[]>((acc, item) => {
        const titleMatch = item.title.toLowerCase().includes(lowercasedQuery);
        const explanationMatch = item.explanation?.toLowerCase().includes(lowercasedQuery);
        const dalilMatch = item.dalil?.toLowerCase().includes(lowercasedQuery);

        const selfMatch = titleMatch || explanationMatch || dalilMatch;
        
        let children: DirectoryItem[] = [];
        if (item.children) {
          children = filter(item.children);
        }

        if (selfMatch || children.length > 0) {
          acc.push({ ...item, children });
        }
        
        return acc;
      }, []);
    };

    return filter(directoryData);
  }, [directorySearch, directoryData]);

  const handleLogout = () => {
    if (confirm("Apakah Anda yakin ingin keluar?")) {
      localStorage.removeItem('syariahos_role');
      setView('landing');
      setSidebarOpen(false);
    }
  };

  const handleEditItem = (item: DirectoryItem) => {
    setEditingItem(item);
    setEditModalOpen(true);
  };

  const handleUpdateTitle = (id: string, newTitle: string) => {
    const updateInList = (list: DirectoryItem[]): DirectoryItem[] => {
      return list.map(item => {
        if (item.id === id) {
          return { ...item, title: newTitle };
        }
        if (item.children) {
          return { ...item, children: updateInList(item.children) };
        }
        return item;
      });
    };
    setDirectoryData(prev => updateInList([...prev]));
  };

  const handleDeleteItem = (id: string) => {
    if (confirm("Hapus item wawasan ini beserta seluruh isinya?")) {
      const deeperRemove = (list: DirectoryItem[]): DirectoryItem[] => {
        return list.filter(i => i.id !== id).map(i => {
           if(i.children) return { ...i, children: deeperRemove(i.children) };
           return i;
        });
      }
      setDirectoryData(prev => deeperRemove([...prev]));
    }
  };

  const handleAddChild = (parentId: string) => {
    setEditingItem({ 
      id: Date.now().toString(), 
      title: '', 
      parentId, 
      children: [] 
    });
    setEditModalOpen(true);
  };

  const handleConfirmAddRoot = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newRootTitle.trim()) return;

    const newItem: DirectoryItem = {
      id: Date.now().toString(),
      title: newRootTitle.trim(),
      children: []
    };

    setDirectoryData([...directoryData, newItem]);
    setNewRootTitle('');
    setIsAddingRootInline(false);
  };

  const saveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const newItem = { ...editingItem } as DirectoryItem;
    delete (newItem as any).parentId;

    const updateInList = (list: DirectoryItem[]): DirectoryItem[] => {
      const updatedList = list.map(item => {
        if (item.id === newItem.id) {
          return { ...item, ...newItem };
        }
        if (item.children) {
             return { ...item, children: updateInList(item.children) };
        }
        return item;
      });
      return updatedList;
    };

    const addToList = (list: DirectoryItem[], parentId: string): boolean => {
      for (const item of list) {
        if (item.id === parentId) {
          item.children = [...(item.children || []), newItem];
          return true;
        }
        if (item.children && addToList(item.children, parentId)) return true;
      }
      return false;
    };

    if (editingItem.parentId) {
      const copy = JSON.parse(JSON.stringify(directoryData));
      addToList(copy, editingItem.parentId);
      setDirectoryData(copy);
    } else {
      const copy = JSON.parse(JSON.stringify(directoryData));
      const final = updateInList(copy);
      setDirectoryData(final);
    }

    setEditModalOpen(false);
    setEditingItem(null);
  };

  const NavItem = ({ icon, label, name, colorClass }: { icon: React.ElementType; label: string; name: View; colorClass?: string }) => {
    const isActive = view === name;
    return (
      <button
        type="button"
        onClick={() => {
          setView(name);
          setSidebarOpen(false);
        }}
        className={`flex items-center w-full px-4 py-3 text-sm font-medium transition-colors duration-200 rounded-lg ${
          isActive
            ? `${colorClass || 'bg-primary-600'} text-white shadow-lg`
            : 'text-gray-600 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-gray-700'
        }`}
      >
        {React.createElement(icon, { className: "w-6 h-6 mr-3" })}
        <span className="truncate">{label}</span>
      </button>
    );
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity lg:hidden ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-72 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b dark:border-gray-700 h-16">
          <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">SyariahOS</h1>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500 dark:text-gray-400">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto flex flex-col">
          <nav className="p-4 space-y-2 flex-1">
            {isAdmin ? (
                <div className="space-y-1">
                    <p className="px-4 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Admin Control</p>
                    <NavItem icon={DashboardIcon} label="Admin Dashboard" name="admin_dashboard" colorClass="bg-indigo-600" />
                    <NavItem icon={UsersIcon} label="Manajemen User" name="admin_users" colorClass="bg-indigo-600" />
                    <NavItem icon={BriefcaseIcon} label="Manajemen Tools" name="admin_tools" colorClass="bg-indigo-600" />
                </div>
            ) : (
                <div className="space-y-1">
                    <NavItem icon={DashboardIcon} label="Dashboard" name="dashboard" />
                    <NavItem icon={ClipboardListIcon} label="Tugas Amanah" name="tasks" />
                    <NavItem icon={ToolsIcon} label="Katalog Tools" name="tools" />
                    <NavItem icon={WandSparklesIcon} label="AI Generator" name="generator" />
                    
                    <div className="pt-4 pb-2">
                        <hr className="border-gray-200 dark:border-gray-700" />
                    </div>

                    <div className="flex items-center justify-between px-2 mb-1">
                        <button type="button" onClick={() => setDirectoryOpen(!isDirectoryOpen)} className="flex items-center flex-1 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-gray-700 p-2 rounded-lg">
                          <DirectoryIcon className="w-6 h-6 mr-3" />
                          <span className="truncate font-semibold">Directory Wawasan</span>
                          {isDirectoryOpen ? <ChevronDownIcon className="w-4 h-4 ml-auto" /> : <ChevronRightIcon className="w-4 h-4 ml-auto" />}
                        </button>
                        
                        <div className="flex items-center ml-2">
                           <button 
                            type="button"
                            onClick={() => {
                              setEditMode(!editMode);
                              setIsAddingRootInline(false);
                            }}
                            className={`p-1.5 rounded-lg transition-all duration-200 ${editMode ? 'bg-primary-600 text-white shadow-sm ring-2 ring-primary-500/20' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300'}`}
                            title={editMode ? "Matikan Mode Edit" : "Aktifkan Mode Edit"}
                           >
                              <PencilIcon className="w-4 h-4" />
                           </button>
                        </div>
                    </div>

                    {isDirectoryOpen && (
                      <div className="mt-2 space-y-1">
                         <div className="px-2 pb-2">
                            <input
                                type="text"
                                placeholder="Cari wawasan..."
                                value={directorySearch}
                                onChange={(e) => setDirectorySearch(e.target.value)}
                                className="w-full px-3 py-1.5 text-sm text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                            />
                        </div>
                        <div className="max-h-[50vh] overflow-y-auto custom-scrollbar">
                            {filteredDirectoryData.map(item => (
                            <DirectorySidebarNode 
                                key={item.id} 
                                item={item} 
                                level={0} 
                                onSelectItem={onSelectItem} 
                                closeSidebar={() => setSidebarOpen(false)} 
                                allOpen={!!directorySearch}
                                editMode={editMode}
                                onEdit={handleEditItem}
                                onDelete={handleDeleteItem}
                                onAddChild={handleAddChild}
                                onUpdateTitle={handleUpdateTitle}
                            />
                            ))}
                        </div>

                        {editMode && (
                          <div className="mt-2 space-y-2">
                             {isAddingRootInline ? (
                               <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-primary-200 dark:border-primary-900/30 animate-fadeIn">
                                 <form onSubmit={handleConfirmAddRoot} className="flex items-center space-x-2">
                                    <input 
                                      autoFocus
                                      type="text"
                                      value={newRootTitle}
                                      onChange={(e) => setNewRootTitle(e.target.value)}
                                      placeholder="Judul Directory Utama"
                                      className="flex-1 bg-white dark:bg-gray-800 border-none text-xs p-1.5 rounded focus:ring-1 focus:ring-primary-500 outline-none"
                                    />
                                    <button 
                                      type="submit"
                                      className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                                      title="Simpan"
                                    >
                                      <CheckIcon className="w-4 h-4" />
                                    </button>
                                    <button 
                                      type="button"
                                      onClick={() => { setIsAddingRootInline(false); setNewRootTitle(''); }}
                                      className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                      title="Batal"
                                    >
                                      <XMarkIcon className="w-4 h-4" />
                                    </button>
                                 </form>
                               </div>
                             ) : (
                               <button 
                                 type="button"
                                 onClick={() => setIsAddingRootInline(true)}
                                 className="flex items-center w-full px-4 py-2 text-xs font-bold text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg border border-dashed border-primary-300 dark:border-primary-800 transition-all"
                               >
                                  <PlusCircleIcon className="w-4 h-4 mr-2" />
                                  Tambah Directory Utama
                               </button>
                             )}
                          </div>
                        )}
                      </div>
                    )}
                </div>
            )}
          </nav>

          <div className="p-4 border-t dark:border-gray-700 space-y-1">
            <NavItem icon={Cog6ToothIcon} label="Pengaturan" name="settings" />
            <button
                type="button"
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
            >
                <ArrowLeftOnRectangleIcon className="w-6 h-6 mr-3" />
                <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-3xl p-8 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold dark:text-white">
                {editingItem.title && !editingItem.parentId ? 'Edit Wawasan' : 'Tambah Wawasan Baru'}
              </h3>
              <button type="button" onClick={() => setEditModalOpen(false)}>
                <XMarkIcon className="w-6 h-6 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <form onSubmit={saveItem} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Judul Wawasan</label>
                <input 
                  required 
                  type="text" 
                  value={editingItem.title} 
                  onChange={e => setEditingItem({...editingItem, title: e.target.value})} 
                  className="w-full p-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none text-sm transition-all" 
                  placeholder="Contoh: Amanah dalam Muamalah"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Dalil (Arab/Teks Utama)</label>
                <textarea 
                  rows={2} 
                  value={editingItem.dalil} 
                  onChange={e => setEditingItem({...editingItem, dalil: e.target.value})} 
                  className="w-full p-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none text-sm font-serif transition-all" 
                  placeholder="Opsional: Tuliskan ayat atau hadits..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Sumber Dalil</label>
                <input 
                  type="text" 
                  value={editingItem.source} 
                  onChange={e => setEditingItem({...editingItem, source: e.target.value})} 
                  className="w-full p-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none text-sm transition-all" 
                  placeholder="Contoh: HR. Bukhari atau QS. Al-Baqarah: 282"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Penjelasan Detail</label>
                <textarea 
                  rows={4} 
                  value={editingItem.explanation} 
                  onChange={e => setEditingItem({...editingItem, explanation: e.target.value})} 
                  className="w-full p-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none text-sm transition-all" 
                  placeholder="Jelaskan aplikasi praktis atau makna mendalam wawasan ini..."
                />
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full py-4 bg-primary-600 text-white font-bold rounded-2xl shadow-lg hover:bg-primary-700 transition active:scale-[0.98]">
                  Simpan Wawasan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
