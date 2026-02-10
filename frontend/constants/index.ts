
import type { DirectoryItem, Tool, Kpi, Goal } from '../types';
import { ToolCategory } from '../types';
import { 
  UserIcon, BriefcaseIcon, UsersIcon, BanknotesIcon, AcademicCapIcon, GlobeAltIcon,
  CheckCircleIcon, ArrowTrendingUpIcon, ChartPieIcon, DocumentCheckIcon
} from '../components/Icons';

const RAW_DIRECTORY_DATA: DirectoryItem[] = [
  {
    id: 'quran',
    title: "Al-Qur'an",
    children: [
      { id: 'q1', title: 'Amanah (QS. An-Nisa: 58)', dalil: "إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا", source: "QS. An-Nisa: 58", explanation: "Prinsip dasar kepercayaan dan tanggung jawab dalam setiap amanah yang diemban, baik dalam pekerjaan, kepemimpinan, maupun muamalah sehari-hari." },
      { id: 'q2', title: 'Syura (QS. Asy-Syura: 38)', dalil: "وَأَمْرُهُمْ شُورَىٰ بَيْنَهُمْ", source: "QS. Asy-Syura: 38", explanation: "Pentingnya musyawarah dan pengambilan keputusan kolektif dalam urusan bersama untuk mencapai hasil terbaik dan kebersamaan." },
      { id: 'q3', title: 'Adil (QS. An-Nahl: 90)', dalil: "إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ", source: "QS. An-Nahl: 90", explanation: "Perintah untuk berlaku adil dalam segala hal, termasuk dalam hukum, bisnis, dan interaksi sosial, serta melengkapinya dengan ihsan (kebaikan)." },
    ],
  },
  {
    id: 'sunnah',
    title: 'As-Sunnah',
    children: [
      { id: 's1', title: 'Upah Tepat Waktu', dalil: "أَعْطُوا الأَجِيرَ أَجْرَهُ قَبْلَ أَنْ يَجِفَّ عَرَقَهُ", source: "HR. Ibnu Majah", explanation: "Kewajiban membayar upah pekerja segera setelah pekerjaan selesai, sebagai bentuk penghargaan atas hak dan usaha mereka." },
      { id: 's2', title: 'Profesionalisme (Itqan)', dalil: "إِنّ اللهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلاً أَنْ يُتْقِنَهُ", source: "HR. Al-Baihaqi", explanation: "Anjuran untuk selalu bekerja dengan profesional, cermat, dan sebaik mungkin, karena Allah mencintai pekerjaan yang disempurnakan." },
    ],
  },
  {
    id: 'maqasid',
    title: 'Maqasid Syariah',
    children: [
      { id: 'm1', title: 'Hifdz ad-Din (Menjaga Agama)', explanation: "Tujuan utama syariah adalah untuk melindungi dan memelihara agama (akidah, ibadah, dan syiar Islam). Ini mencakup perlindungan dari segala bentuk penyelewengan, bid'ah, dan serangan yang dapat merusak kemurnian ajaran Islam." },
      { id: 'm2', title: 'Hifdz an-Nafs (Menjaga Jiwa)', explanation: "Syariah sangat menekankan perlindungan terhadap jiwa manusia. Larangan membunuh, kewajiban menjaga kesehatan, dan adanya hukum qisas adalah bagian dari upaya menjaga hak hidup setiap individu." },
      { id: 'm3', title: 'Hifdz al-Aql (Menjaga Akal)', explanation: "Akal adalah anugerah yang membedakan manusia. Syariah melindungi akal dengan mendorong menuntut ilmu, berpikir kritis, dan melarang segala sesuatu yang dapat merusaknya, seperti minuman keras dan narkotika." },
      { id: 'm4', title: 'Hifdz an-Nasl (Menjaga Keturunan)', explanation: "Perlindungan terhadap garis keturunan dan institusi keluarga. Syariat pernikahan, larangan zina, dan anjuran untuk mendidik anak adalah cara Islam menjaga keberlangsungan generasi yang baik." },
      { id: 'm5', title: 'Hifdz al-Mal (Menjaga Harta)', explanation: "Syariah melindungi hak kepemilikan harta yang diperoleh secara halal. Larangan mencuri, riba, korupsi, serta anjuran untuk berzakat, infaq, dan wakaf adalah cara Islam mengatur dan menjaga harta agar bermanfaat." },
    ],
  },
  {
    id: 'poac',
    title: 'Prinsip POAC Islami',
    children: [
        { id: 'p1', title: 'Planning (Takhthith)', dalil: "يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ وَلْتَنظُرْ نَفْسٌ مَّا قَدَّمَتْ لِغَدٍ", source: "QS. Al-Hashr: 18", explanation: "Perencanaan adalah langkah awal yang menekankan pentingnya visi dan persiapan untuk masa depan, baik urusan duniawi maupun ukhrawi, dengan didasari ketakwaan." },
        { id: 'p2', title: 'Organizing (Tanzhim)', dalil: "إِنَّ اللَّهَ يُحِبُّ الَّذِينَ يُقَاتِلُونَ فِي سَبِيلِهِ صَفًّا كَأَنَّهُم بُنْيَانٌ مَّرْصُوصٌ", source: "QS. As-Saff: 4", explanation: "Pengorganisasian berarti menyusun sumber daya dan tim dalam struktur yang rapi dan kokoh, di mana setiap individu memiliki peran yang jelas untuk mencapai tujuan bersama." },
        { id: 'p3', title: 'Actuating (Tawjih)', dalil: "فَقُولَا لَهُ قَوْلًا لَّيِّنًا لَّعَلَّهُ يَتَذَكَّرُ أَوْ يَخْشَىٰ", source: "QS. Ta-Ha: 44", explanation: "Pelaksanaan melibatkan pengarahan, motivasi, dan komunikasi yang efektif. Kepemimpinan Islam menekankan pada bimbingan yang lemah lembut, bijaksana, dan penuh keteladanan." },
        { id: 'p4', title: 'Controlling (Riqabah)', dalil: "مَّا يَلْفِظُ مِن قَوْلٍ إِلَّا لَدَيْهِ رَقِيبٌ عَتِيدٌ", source: "QS. Qaf: 18", explanation: "Pengawasan dalam Islam tidak hanya bersifat horizontal (antar manusia) tetapi juga vertikal (kepada Allah). Ini mencakup evaluasi, akuntabilitas, dan kesadaran bahwa setiap tindakan selalu dalam pengawasan Allah." },
    ]
  },
];

const addParentPaths = (items: DirectoryItem[], parentPath = ''): DirectoryItem[] => {
  return items.map(item => {
    const currentPath = parentPath ? `${parentPath} > ${item.title}` : item.title;
    const newItem: DirectoryItem = { ...item, parentPath: currentPath };
    if (item.children) {
      newItem.children = addParentPaths(item.children, currentPath);
    }
    return newItem;
  });
};
export const DIRECTORY_DATA = addParentPaths(RAW_DIRECTORY_DATA);

export const TOOLS_DATA: Tool[] = [
  // Individu/Keluarga
  { id: 't1', name: 'Financial Planner Syariah', category: ToolCategory.Individu, description: 'Alokasikan penghasilan sesuai kaidah syariah.', inputs: 'Penghasilan, Kebutuhan Pokok, Utang', outputs: 'Alokasi Zakat, Sedekah, Tabungan Haji, Investasi Halal', benefits: 'Mencapai keberkahan finansial.', icon: UserIcon, relatedDalil: { text: "Dan orang-orang yang apabila membelanjakan (harta), mereka tidak berlebihan, dan tidak (pula) kikir, dan adalah (pembelanjaan itu) di tengah-tengah antara yang demikian.", source: "QS. Al-Furqan: 67" }, relatedDirectoryIds: ['m5'], link: 'https://example.com/planner' },
  { id: 't2', name: 'Life Planner Islami', category: ToolCategory.Individu, description: 'Rencanakan tujuan hidup dunia & akhirat.', inputs: 'Visi, Misi, Target Ibadah, Target Karir', outputs: 'Roadmap hidup seimbang', benefits: 'Hidup lebih terarah dan bermakna.', icon: UserIcon, relatedDirectoryIds: ['p1'], link: 'https://example.com/life-planner' },
  { id: 't3', name: 'Parenting Islami Assistant', category: ToolCategory.Individu, description: 'Panduan mendidik anak sesuai sunnah.', inputs: 'Usia Anak, Isu Perkembangan', outputs: 'Saran Praktis, Doa, Kisah Teladan', benefits: 'Membentuk generasi Rabbani.', icon: UserIcon, relatedDirectoryIds: ['m4'], link: 'https://example.com/parenting' },
  { id: 't4', name: 'Kalkulator Waris Islami', category: ToolCategory.Individu, description: 'Hitung pembagian waris sesuai faraid.', inputs: 'Harta warisan, daftar ahli waris', outputs: 'Porsi waris setiap ahli waris', benefits: 'Menghindari sengketa dan menegakkan keadilan.', icon: UserIcon, relatedDirectoryIds: ['m5', 'q3'], link: 'https://example.com/waris' },

  // Bisnis Islami
  { id: 't5', name: 'POS Syariah', category: ToolCategory.Bisnis, description: 'Sistem kasir dengan validasi akad & produk halal.', inputs: 'Produk, Transaksi', outputs: 'Laporan Penjualan Halal', benefits: 'Memastikan transaksi bisnis sesuai syariah.', icon: BriefcaseIcon, relatedDirectoryIds: ['q1'], link: 'https://example.com/pos' },
  { id: 't6', name: 'HR Payroll Syariah', category: ToolCategory.Bisnis, description: 'Manajemen penggajian dengan komponen syari.', inputs: 'Data Karyawan, Kehadiran', outputs: 'Slip Gaji (termasuk potongan zakat profesi)', benefits: 'Keadilan dan ketepatan waktu dalam upah.', icon: BriefcaseIcon, relatedDalil: { text: "Berikan kepada seorang pekerja upahnya sebelum keringatnya kering.", source: "HR. Ibnu Majah" }, relatedDirectoryIds: ['s1', 'q3'], link: 'https://example.com/payroll' },
  { id: 't7', name: 'CRM Islami', category: ToolCategory.Bisnis, description: 'Manajemen hubungan pelanggan dengan adab.', inputs: 'Data Pelanggan, Interaksi', outputs: 'Segmentasi Pelanggan, Riwayat Komunikasi', benefits: 'Membangun loyalitas pelanggan dengan akhlak mulia.', icon: BriefcaseIcon, relatedDirectoryIds: ['s2'], link: 'https://example.com/crm' },
  { id: 't8', name: 'Supply Chain Halal Tracker', category: ToolCategory.Bisnis, description: 'Lacak kehalalan produk dari hulu ke hilir.', inputs: 'Data Supplier, Sertifikat Halal, Proses Produksi', outputs: 'Dashboard Ketertelusuran Halal', benefits: 'Menjamin kehalalan produk bagi konsumen.', icon: BriefcaseIcon, relatedDirectoryIds: ['q1', 'm5'], link: 'https://example.com/halal-tracker' },
  { id: 't9', name: 'Analisis Kelayakan Bisnis Syariah', category: ToolCategory.Bisnis, description: 'Evaluasi ide bisnis dari perspektif syariah dan pasar.', inputs: 'Model bisnis, proyeksi keuangan', outputs: 'Skor kelayakan, rekomendasi perbaikan', benefits: 'Mengurangi risiko dan meningkatkan potensi sukses.', icon: BriefcaseIcon, relatedDirectoryIds: ['p1', 'q2'], link: 'https://example.com/bisnis-analisis' },

  // Lembaga/Komunitas
  { id: 't10', name: 'Manajemen Masjid Digital', category: ToolCategory.Lembaga, description: 'Kelola jadwal, keuangan, and kegiatan masjid.', inputs: 'Jadwal Kajian, Laporan Infaq', outputs: 'Kalender Kegiatan, Laporan Keuangan Transparan', benefits: 'Meningkatkan efisiensi dan transparansi DKM.', icon: UsersIcon, relatedDirectoryIds: ['q1', 'p2'], link: 'https://example.com/masjid' },
  { id: 't11', name: 'Wakaf Manager', category: ToolCategory.Lembaga, description: 'Platform manajemen aset dan program wakaf.', inputs: 'Data Aset Wakaf, Program Pemberdayaan', outputs: 'Laporan Produktivitas Wakaf', benefits: 'Optimalisasi manfaat wakaf untuk umat.', icon: UsersIcon, relatedDirectoryIds: ['m5'], link: 'https://example.com/wakaf' },
  { id: 't12', name: 'Shariah Governance Toolkit', category: ToolCategory.Lembaga, description: 'Alat bantu untuk Dewan Pengawas Syariah (DPS).', inputs: 'Produk Baru, Isu Kepatuhan', outputs: 'Checklist Kepatuhan, Draft Opini Syariah', benefits: 'Mempermudah proses audit dan pengawasan syariah.', icon: UsersIcon, relatedDirectoryIds: ['q1', 'q2', 'p4'], link: 'https://example.com/governance' },
  { id: 't13', name: 'Manajemen Kurban Terpadu', category: ToolCategory.Lembaga, description: 'Organisir proses kurban dari pendaftaran hingga distribusi.', inputs: 'Data pekurban, data mustahik', outputs: 'Laporan distribusi daging kurban', benefits: 'Transparansi dan pemerataan dalam ibadah kurban.', icon: UsersIcon, relatedDirectoryIds: ['q1', 'q3'], link: 'https://example.com/kurban' },

  // Keuangan/Investasi
  { id: 't14', name: 'Zakat Manager Pro', category: ToolCategory.Keuangan, description: 'Hitung dan distribusikan berbagai jenis zakat.', inputs: 'Data Harta, Data Mustahik', outputs: 'Laporan Perhitungan & Distribusi Zakat', benefits: 'Memastikan akurasi dan kepatuhan dalam berzakat.', icon: BanknotesIcon, relatedDirectoryIds: ['m5'], link: 'https://example.com/zakat' },
  { id: 't15', name: 'Shariah Stock Screener', category: ToolCategory.Keuangan, description: 'Filter saham yang sesuai dengan kriteria syariah.', inputs: 'Indeks Saham', outputs: 'Daftar Saham Halal', benefits: 'Membantu investor membuat keputusan investasi yang berkah.', icon: BanknotesIcon, relatedDirectoryIds: ['m5', 'p4'], link: 'https://example.com/screener' },
  { id: 't16', name: 'Shariah Contract Generator', category: ToolCategory.Keuangan, description: 'Buat draf akad-akad muamalah (Murabahah, Ijarah, dll).', inputs: 'Para Pihak, Objek Akad, Ketentuan', outputs: 'Dokumen Draf Akad', benefits: 'Mempercepat dan menstandarisasi pembuatan akad.', icon: BanknotesIcon, relatedDirectoryIds: ['q1'], link: 'https://example.com/contract' },
  { id: 't17', name: 'Kalkulator Cicilan Syariah', category: ToolCategory.Keuangan, description: 'Simulasikan pembiayaan murabahah atau IMBT.', inputs: 'Harga barang, margin, tenor', outputs: 'Tabel angsuran bulanan', benefits: 'Transparansi pembiayaan tanpa riba.', icon: BanknotesIcon, relatedDirectoryIds: ['q3'], link: 'https://example.com/cicilan' },
  
  // Edukasi
  { id: 't18', name: 'LMS (Learning Management System) Syariah', category: ToolCategory.Edukasi, description: 'Platform e-learning untuk konten-konten Islami.', inputs: 'Materi Kursus, Kuis', outputs: 'Portal Belajar Interaktif', benefits: 'Menyebarkan ilmu syariah secara efektif dan terstruktur.', icon: AcademicCapIcon, relatedDirectoryIds: ['m3'], link: 'https://example.com/lms' },
  { id: 't19', name: 'Simulator Keputusan Syariah', category: ToolCategory.Edukasi, description: 'Game simulasi untuk melatih pengambilan keputusan.', inputs: 'Studi Kasus Bisnis/Personal', outputs: 'Skor Keputusan & Pembahasan Syariah', benefits: 'Belajar fiqh muamalah dengan cara yang menarik.', icon: AcademicCapIcon, relatedDirectoryIds: ['m3', 'q2'], link: 'https://example.com/simulator' },
  { id: 't20', name: 'Assessment Kompetensi Islami', category: ToolCategory.Edukasi, description: 'Ukur pemahaman dan penerapan nilai-nilai Islam.', inputs: 'Jawaban Kuesioner', outputs: 'Profil Kompetensi & Rekomendasi Pengembangan', benefits: 'Alat untuk introspeksi dan perbaikan diri.', icon: AcademicCapIcon, relatedDirectoryIds: ['s2', 'p4'], link: 'https://example.com/assessment' },
  { id: 't21', name: 'Generator Dalil Kontekstual', category: ToolCategory.Edukasi, description: 'Temukan dalil Qur\'an & Hadits terkait topik tertentu.', inputs: 'Kata kunci (misal: "jual beli")', outputs: 'Daftar dalil relevan beserta terjemahan', benefits: 'Mempermudah riset dan pencarian landasan syariah.', icon: AcademicCapIcon, link: 'https://example.com/dalil' },
  
  // Sosial/Umat
  { id: 't22', name: 'Crowdfunding Wakaf Produktif', category: ToolCategory.Sosial, description: 'Galang dana wakaf tunai untuk proyek umat.', inputs: 'Proposal Proyek', outputs: 'Halaman Kampanye & Laporan Progres', benefits: 'Mobilisasi dana umat untuk proyek berkelanjutan.', icon: GlobeAltIcon, relatedDirectoryIds: ['m5'], link: 'https://example.com/crowdfunding' },
  { id: 't23', name: 'Platform Kolaborasi Halal', category: ToolCategory.Sosial, description: 'Hubungkan produsen, supplier, dan konsumen halal.', inputs: 'Profil Bisnis, Kebutuhan Kemitraan', outputs: 'Marketplace & Direktori Bisnis Halal', benefits: 'Membangun ekosistem ekonomi halal yang kuat.', icon: GlobeAltIcon, relatedDirectoryIds: ['p2'], link: 'https://example.com/kolaborasi' },
  { id: 't24', name: 'AI Muamalah Assistant', category: ToolCategory.Sosial, description: 'Chatbot untuk menjawab pertanyaan dasar fiqh muamalah.', inputs: 'Pertanyaan Pengguna', outputs: 'Jawaban berdasarkan referensi terpercaya', benefits: 'Akses cepat terhadap informasi syariah.', icon: GlobeAltIcon, relatedDirectoryIds: ['m3'], link: 'https://example.com/ai-assistant' },
  { id: 't25', name: 'Sistem Distribusi Infaq & Sedekah', category: ToolCategory.Sosial, description: 'Manajemen penyaluran dana sosial secara terarah dan tercatat.', inputs: 'Data donatur, data penerima manfaat', outputs: 'Peta distribusi, laporan dampak sosial', benefits: 'Meningkatkan akuntabilitas dan efektivitas penyaluran.', icon: GlobeAltIcon, relatedDirectoryIds: ['q1', 'q3'], link: 'https://example.com/distribusi' },
];

const generateMockData = <T extends { date: string }>(days: number, factory: (date: Date, index: number) => Omit<T, 'date'>[]): T[] => {
    const data: T[] = [];
    for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dailyItems = factory(date, i);
        dailyItems.forEach(item => {
            data.push({ ...item, date: date.toISOString() } as T);
        });
    }
    return data;
};

const kpiFactory = (date: Date, index: number): Omit<Kpi, 'date'>[] => [
    { title: 'Total tugas', value: `${Math.max(5, 45 - index)}`, change: `+${Math.floor(Math.random() * 5)}`, changeType: 'increase', icon: BriefcaseIcon },
    { title: 'Tugas terlewat', value: `${Math.floor(Math.random() * 4)}`, change: `-1`, changeType: 'decrease', icon: ChartPieIcon },
    { title: 'Tugas terselesaikan', value: `${Math.max(2, 38 - index)}`, change: `+3`, changeType: 'increase', icon: CheckCircleIcon },
    { title: 'Total Progress', value: `${Math.min(100, 70 + (index % 15))}%`, change: `+${(Math.random() * 1.5).toFixed(1)}%`, changeType: 'increase', icon: ArrowTrendingUpIcon },
];

const goalFactory = (date: Date, index: number): Omit<Goal, 'date'>[] => [
    { id: 'g1', title: 'Target Sedekah Bulanan', target: 5000000, progress: Math.max(0, 3750000 - index * 100000), unit: 'Rp' },
    { id: 'g2', title: 'Jumlah Transaksi Halal', target: 1000, progress: Math.max(0, 820 - index * 20), unit: 'transaksi' },
    { id: 'g3', title: 'Kepatuhan Akad', target: 100, progress: 99, unit: '%' },
    { id: 'g4', title: 'Penerima Manfaat Wakaf', target: 50, progress: Math.max(0, 45 - index), unit: 'orang' },
];


export const ALL_KPI_DATA = generateMockData(90, kpiFactory);
export const ALL_GOALS_DATA = generateMockData(90, goalFactory);


export const getKpiDataForPeriod = (days: number | null): Kpi[] => {
  const latestDate = ALL_KPI_DATA.reduce((max, p) => p.date > max ? p.date : max, ALL_KPI_DATA[0].date);
  const uniqueKpis = Array.from(new Map(ALL_KPI_DATA.map(item => [item.title, item])).values())
    .map(kpi => kpi.title);

  return uniqueKpis.map(title => {
    const relevantKpis = ALL_KPI_DATA.filter(k => k.title === title);
    if (days === null) {
      return relevantKpis.find(k => k.date === latestDate) || relevantKpis[0];
    }
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const kpiInPeriod = relevantKpis
      .filter(k => new Date(k.date) >= startDate)
      .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
    return kpiInPeriod[0] || { title, value: 'N/A', change: '0%', changeType: 'increase', icon: DocumentCheckIcon, date: new Date().toISOString()};
  });
};

export const getGoalsDataForPeriod = (days: number | null): Goal[] => {
    const latestDate = ALL_GOALS_DATA.reduce((max, p) => p.date > max ? p.date : max, ALL_GOALS_DATA[0].date);
    const uniqueGoals = Array.from(new Map(ALL_GOALS_DATA.map(item => [item.id, item])).values())
    .map(goal => goal.id);

    return uniqueGoals.map(id => {
        const relevantGoals = ALL_GOALS_DATA.filter(g => g.id === id);
         if (days === null) {
            return relevantGoals.find(g => g.date === latestDate) || relevantGoals[0];
        }
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const goalsInPeriod = relevantGoals
            .filter(g => new Date(g.date) >= startDate)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        const latestGoal = goalsInPeriod[0];
        if (latestGoal) {
             const progressSum = goalsInPeriod.reduce((sum, g) => sum + g.progress, 0) / goalsInPeriod.length;
             return { ...latestGoal, progress: Math.round(progressSum) };
        }
        
        return { id, title: 'No Data', target: 100, progress: 0, unit: '', date: new Date().toISOString()};
    });
};
