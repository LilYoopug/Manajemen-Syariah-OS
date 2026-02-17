<?php

namespace Database\Seeders;

use App\Models\DirectoryItem;
use App\Models\User;
use Illuminate\Database\Seeder;

class DirectorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all regular users to seed their directories
        $users = User::where('role', 'user')->get();

        foreach ($users as $user) {
            $profile = $this->getUserProfile($user->email);
            $this->seedDirectoryForUser($user, $profile);
        }

        $this->command->info('Directory items seeded: ' . DirectoryItem::count());
    }

    /**
     * Determine user profile based on email.
     */
    private function getUserProfile(string $email): string
    {
        $profiles = [
            'budi.santoso@email.com' => 'active_business',
            'dewi.lestari@email.com' => 'active_business',
            'eko.prasetyo@email.com' => 'active_business',
            'fitri.handayani@email.com' => 'medium_active',
            'gunawan.wibowo@email.com' => 'medium_active',
            'hani.susanti@email.com' => 'medium_active',
            'irwan.setiawan@email.com' => 'light_user',
            'julia.putri@email.com' => 'light_user',
            'kevin.halim@email.com' => 'new_user',
            'linda.kusuma@email.com' => 'new_user',
            'mira.azizah@email.com' => 'compliance_focused',
            'nasir.rahman@email.com' => 'compliance_focused',
            'olga.wijaya@email.com' => 'finance_focused',
            'putra.mahendra@email.com' => 'finance_focused',
            'qori.ammir@email.com' => 'tech_focused',
            'rina.agustina@email.com' => 'tech_focused',
            'sari.indah@email.com' => 'inactive',
            'tomi.hidayat@email.com' => 'inactive',
            'ulia.nurul@email.com' => 'marketing_focused',
            'viqi.rahayu@email.com' => 'marketing_focused',
            'wawan.hermawan@email.com' => 'sdm_focused',
            'xena.pratiwi@email.com' => 'sdm_focused',
            'yusuf.rahman@email.com' => 'operational',
            'zahra.amalia@email.com' => 'operational',
        ];

        return $profiles[$email] ?? 'medium_active';
    }

    /**
     * Seed directory items for a specific user based on their profile.
     */
    private function seedDirectoryForUser(User $user, string $profile): void
    {
        $config = $this->getDirectoryConfig($profile);

        // Create folders first
        foreach ($config['folders'] as $folderData) {
            $folder = DirectoryItem::create([
                'user_id' => $user->id,
                'title' => $folderData['title'],
                'type' => 'folder',
                'parent_id' => null,
            ]);

            // Create items inside the folder
            foreach ($folderData['items'] ?? [] as $itemData) {
                $this->createDirectoryItem($user->id, $folder->id, $itemData);
            }
        }

        // Create root-level items
        foreach ($config['root_items'] ?? [] as $itemData) {
            $this->createDirectoryItem($user->id, null, $itemData);
        }
    }

    /**
     * Get directory configuration based on user profile.
     */
    private function getDirectoryConfig(string $profile): array
    {
        // Base items that most users have
        $baseQuranFolder = [
            'title' => 'Referensi Al-Quran',
            'items' => $this->getQuranReferences($profile),
        ];

        $baseHadithFolder = [
            'title' => 'Referensi Hadits',
            'items' => $this->getHadithReferences($profile),
        ];

        $maqasidFolder = [
            'title' => 'Maqasid Syariah',
            'items' => $this->getMaqasidItems($profile),
        ];

        $poacFolder = [
            'title' => 'Manajemen Islami (POAC)',
            'items' => $this->getPoacItems($profile),
        ];

        return match ($profile) {
            'active_business' => [
                'folders' => [
                    $baseQuranFolder,
                    $baseHadithFolder,
                    $maqasidFolder,
                    $poacFolder,
                    [
                        'title' => 'Bisnis & Muamalah',
                        'items' => $this->getBusinessItems(),
                    ],
                    [
                        'title' => 'Kontrak & Akad',
                        'items' => $this->getContractItems(),
                    ],
                ],
                'root_items' => $this->getRootItems('active'),
            ],
            'medium_active' => [
                'folders' => [
                    $baseQuranFolder,
                    $baseHadithFolder,
                    $maqasidFolder,
                    $poacFolder,
                ],
                'root_items' => $this->getRootItems('medium'),
            ],
            'light_user', 'new_user' => [
                'folders' => [
                    $baseQuranFolder,
                    $baseHadithFolder,
                ],
                'root_items' => [],
            ],
            'compliance_focused' => [
                'folders' => [
                    $baseQuranFolder,
                    $baseHadithFolder,
                    $maqasidFolder,
                    [
                        'title' => 'Audit & Kepatuhan Syariah',
                        'items' => $this->getComplianceItems(),
                    ],
                    [
                        'title' => 'Fatwa DSN-MUI',
                        'items' => $this->getFatwaItems(),
                    ],
                ],
                'root_items' => $this->getRootItems('compliance'),
            ],
            'finance_focused' => [
                'folders' => [
                    $baseQuranFolder,
                    $baseHadithFolder,
                    $maqasidFolder,
                    [
                        'title' => 'Zakat & Sedekah',
                        'items' => $this->getZakatItems(),
                    ],
                    [
                        'title' => 'Investasi Halal',
                        'items' => $this->getInvestmentItems(),
                    ],
                ],
                'root_items' => $this->getRootItems('finance'),
            ],
            'tech_focused' => [
                'folders' => [
                    $baseQuranFolder,
                    $baseHadithFolder,
                    [
                        'title' => 'Teknologi Syariah',
                        'items' => $this->getTechItems(),
                    ],
                ],
                'root_items' => [],
            ],
            'inactive' => [
                'folders' => [],
                'root_items' => [],
            ],
            'marketing_focused' => [
                'folders' => [
                    $baseQuranFolder,
                    $baseHadithFolder,
                    $poacFolder,
                    [
                        'title' => 'Pemasaran Islami',
                        'items' => $this->getMarketingItems(),
                    ],
                ],
                'root_items' => [],
            ],
            'sdm_focused' => [
                'folders' => [
                    $baseQuranFolder,
                    $baseHadithFolder,
                    $maqasidFolder,
                    $poacFolder,
                    [
                        'title' => 'SDM & Pengembangan',
                        'items' => $this->getSdmItems(),
                    ],
                ],
                'root_items' => [],
            ],
            'operational' => [
                'folders' => [
                    $baseQuranFolder,
                    $baseHadithFolder,
                    $poacFolder,
                    [
                        'title' => 'Operasional & Kualitas',
                        'items' => $this->getOperationalItems(),
                    ],
                ],
                'root_items' => [],
            ],
            default => [
                'folders' => [
                    $baseQuranFolder,
                    $baseHadithFolder,
                ],
                'root_items' => [],
            ],
        };
    }

    /**
     * Create a directory item with proper content structure.
     */
    private function createDirectoryItem(int $userId, ?int $parentId, array $itemData): DirectoryItem
    {
        $content = null;

        if (isset($itemData['sources']) || isset($itemData['explanation'])) {
            $content = json_encode([
                'sources' => $itemData['sources'] ?? [],
                'explanation' => $itemData['explanation'] ?? null,
            ]);
        }

        return DirectoryItem::create([
            'user_id' => $userId,
            'parent_id' => $parentId,
            'title' => $itemData['title'],
            'type' => 'item',
            'content' => $content,
        ]);
    }

    /**
     * Get Quran reference items based on profile activity.
     */
    private function getQuranReferences(string $profile): array
    {
        $items = [
            [
                'title' => 'Prinsip Amanah (QS. An-Nisa: 58)',
                'sources' => [
                    ['type' => 'quran', 'surah' => 4, 'verse' => 58],
                ],
                'explanation' => 'Prinsip dasar kepercayaan dan tanggung jawab dalam setiap amanah yang diemban, baik dalam pekerjaan, kepemimpinan, maupun muamalah sehari-hari.',
            ],
            [
                'title' => 'Prinsip Syura (QS. Asy-Syura: 38)',
                'sources' => [
                    ['type' => 'quran', 'surah' => 42, 'verse' => 38],
                ],
                'explanation' => 'Pentingnya musyawarah dan pengambilan keputusan kolektif dalam urusan bersama untuk mencapai hasil terbaik.',
            ],
            [
                'title' => 'Prinsip Keadilan (QS. An-Nahl: 90)',
                'sources' => [
                    ['type' => 'quran', 'surah' => 16, 'verse' => 90],
                ],
                'explanation' => 'Perintah untuk berlaku adil dalam segala hal, termasuk dalam hukum, bisnis, dan interaksi sosial.',
            ],
        ];

        // Add more items for active users
        if (in_array($profile, ['active_business', 'compliance_focused', 'finance_focused'])) {
            $items[] = [
                'title' => 'Larangan Riba (QS. Al-Baqarah: 275)',
                'sources' => [
                    ['type' => 'quran', 'surah' => 2, 'verse' => 275],
                ],
                'explanation' => 'Allah mengharamkan riba dan menghalalkan jual beli. Prinsip fundamental dalam transaksi keuangan Islam.',
            ];
            $items[] = [
                'title' => 'Tanggung Jawab Pemimpin (QS. Al-Ahzab: 72)',
                'sources' => [
                    ['type' => 'quran', 'surah' => 33, 'verse' => 72],
                ],
                'explanation' => 'Amanah kepemimpinan adalah tanggung jawab besar yang harus diemban dengan penuh kesadaran.',
            ];
        }

        return $items;
    }

    /**
     * Get Hadith reference items.
     */
    private function getHadithReferences(string $profile): array
    {
        $items = [
            [
                'title' => 'Upah Tepat Waktu (HR. Ibnu Majah)',
                'sources' => [
                    ['type' => 'hadith', 'book' => 'ibnu-majah', 'number' => 2443],
                ],
                'explanation' => 'Kewajiban membayar upah pekerja segera setelah pekerjaan selesai, sebagai bentuk penghargaan atas hak mereka.',
            ],
            [
                'title' => 'Profesionalisme/Itqan (HR. Al-Baihaqi)',
                'sources' => [
                    ['type' => 'website', 'title' => 'Hadits Itqan', 'url' => 'https://sunnah.com/bayhaqi:5217'],
                ],
                'explanation' => 'Anjuran untuk selalu bekerja dengan profesional, cermat, dan sebaik mungkin karena Allah mencintai pekerjaan yang disempurnakan.',
            ],
        ];

        if (in_array($profile, ['active_business', 'sdm_focused'])) {
            $items[] = [
                'title' => 'Adab Berbisnis (HR. Bukhari)',
                'sources' => [
                    ['type' => 'hadith', 'book' => 'bukhari', 'number' => 2079],
                ],
                'explanation' => 'Penjual dan pembeli memiliki hak pilihan (khiyar) selama belum berpisah. Prinsip kebebasan bertransaksi.',
            ];
        }

        return $items;
    }

    /**
     * Get Maqasid Syariah items.
     */
    private function getMaqasidItems(string $profile): array
    {
        return [
            [
                'title' => 'Hifdz ad-Din (Menjaga Agama)',
                'sources' => [],
                'explanation' => 'Tujuan utama syariah untuk melindungi dan memelihara agama, mencakup perlindungan dari penyelewengan dan bid\'ah.',
            ],
            [
                'title' => 'Hifdz an-Nafs (Menjaga Jiwa)',
                'sources' => [],
                'explanation' => 'Perlindungan terhadap jiwa manusia melalui larangan membunuh dan kewajiban menjaga kesehatan.',
            ],
            [
                'title' => 'Hifdz al-Aql (Menjaga Akal)',
                'sources' => [],
                'explanation' => 'Perlindungan akal dengan mendorong menuntut ilmu dan melarang yang merusaknya.',
            ],
            [
                'title' => 'Hifdz an-Nasl (Menjaga Keturunan)',
                'sources' => [],
                'explanation' => 'Perlindungan garis keturunan melalui syariat pernikahan dan pendidikan anak.',
            ],
            [
                'title' => 'Hifdz al-Mal (Menjaga Harta)',
                'sources' => [],
                'explanation' => 'Perlindungan hak kepemilikan harta yang halal melalui larangan mencuri, riba, dan korupsi.',
            ],
        ];
    }

    /**
     * Get POAC (Planning, Organizing, Actuating, Controlling) items.
     */
    private function getPoacItems(string $profile): array
    {
        return [
            [
                'title' => 'Planning (Takhthith) - QS. Al-Hashr: 18',
                'sources' => [
                    ['type' => 'quran', 'surah' => 59, 'verse' => 18],
                ],
                'explanation' => 'Perencanaan menekankan pentingnya visi dan persiapan untuk masa depan dengan didasari ketakwaan.',
            ],
            [
                'title' => 'Organizing (Tanzhim) - QS. As-Saff: 4',
                'sources' => [
                    ['type' => 'quran', 'surah' => 61, 'verse' => 4],
                ],
                'explanation' => 'Pengorganisasian berarti menyusun sumber daya dan tim dalam struktur yang rapi dan kokoh.',
            ],
            [
                'title' => 'Actuating (Tawjih) - QS. Ta-Ha: 44',
                'sources' => [
                    ['type' => 'quran', 'surah' => 20, 'verse' => 44],
                ],
                'explanation' => 'Pelaksanaan melibatkan pengarahan dan motivasi yang efektif dengan bimbingan yang lemah lembut.',
            ],
            [
                'title' => 'Controlling (Riqabah) - QS. Qaf: 18',
                'sources' => [
                    ['type' => 'quran', 'surah' => 50, 'verse' => 18],
                ],
                'explanation' => 'Pengawasan mencakup evaluasi, akuntabilitas, dan kesadaran bahwa setiap tindakan dalam pengawasan Allah.',
            ],
        ];
    }

    /**
     * Get business-related items.
     */
    private function getBusinessItems(): array
    {
        return [
            [
                'title' => 'Prinsip Jual Beli Islami',
                'sources' => [],
                'explanation' => 'Transaksi harus bebas dari riba, gharar (ketidakjelasan), dan maysir (judi). Objek transaksi harus halal.',
            ],
            [
                'title' => 'Etika Wirausaha Islami',
                'sources' => [],
                'explanation' => 'Kejujuran, amanah, profesionalisme, dan tanggung jawab sosial dalam berbisnis.',
            ],
            [
                'title' => 'Kemitraan Bisnis (Mudharabah)',
                'sources' => [],
                'explanation' => 'Kerjasama modal dan keahlian dengan pembagian hasil sesuai kesepakatan.',
            ],
        ];
    }

    /**
     * Get contract-related items.
     */
    private function getContractItems(): array
    {
        return [
            [
                'title' => 'Akad Murabahah',
                'sources' => [],
                'explanation' => 'Jual beli dengan margin keuntungan yang disepakati, harga dan biaya diumumkan kepada pembeli.',
            ],
            [
                'title' => 'Akad Ijarah',
                'sources' => [],
                'explanation' => 'Akad sewa-menyewa atau imbal jasa atas manfaat dari suatu objek.',
            ],
            [
                'title' => 'Akad Musyarakah',
                'sources' => [],
                'explanation' => 'Kerjasama dua pihak atau lebih untuk usaha bersama dengan pembagian keuntungan dan risiko.',
            ],
        ];
    }

    /**
     * Get compliance-related items.
     */
    private function getComplianceItems(): array
    {
        return [
            [
                'title' => 'Tugas DPS (Dewan Pengawas Syariah)',
                'sources' => [],
                'explanation' => 'Mengawasi kesesuaian operasional lembaga dengan prinsip syariah, memberikan fatwa dan rekomendasi.',
            ],
            [
                'title' => 'Prosedur Audit Syariah',
                'sources' => [],
                'explanation' => 'Pemeriksaan sistematis terhadap kepatuhan syariah dalam seluruh aspek operasional.',
            ],
            [
                'title' => 'Checklist Kepatuhan Produk',
                'sources' => [],
                'explanation' => 'Daftar pemeriksaan untuk memastikan produk baru sesuai dengan fatwa DSN-MUI.',
            ],
        ];
    }

    /**
     * Get DSN-MUI fatwa items.
     */
    private function getFatwaItems(): array
    {
        return [
            [
                'title' => 'Fatwa DSN-MUI tentang Murabahah',
                'sources' => [
                    ['type' => 'website', 'title' => 'DSN-MUI', 'url' => 'https://mui.or.id'],
                ],
                'explanation' => 'Pedoman pelaksanaan akad murabahah di lembaga keuangan syariah.',
            ],
            [
                'title' => 'Fatwa tentang Batas Nisbah Riba',
                'sources' => [],
                'explanation' => 'Ketentuan batas rasio keuangan yang masih dapat ditoleransi dalam transaksi syariah.',
            ],
        ];
    }

    /**
     * Get zakat-related items.
     */
    private function getZakatItems(): array
    {
        return [
            [
                'title' => 'Zakat Profesi',
                'sources' => [],
                'explanation' => 'Zakat atas penghasilan profesi dengan nisab setara 85 gram emas dan haul satu tahun.',
            ],
            [
                'title' => 'Zakat Mal (Harta)',
                'sources' => [],
                'explanation' => 'Zakat atas simpanan dan investasi dengan nisab 2.5% dari total harta.',
            ],
            [
                'title' => '8 Golongan Penerima Zakat',
                'sources' => [
                    ['type' => 'quran', 'surah' => 9, 'verse' => 60],
                ],
                'explanation' => 'Fakir, miskin, amil, mualaf, budak, gharim, fisabilillah, dan ibnu sabil.',
            ],
        ];
    }

    /**
     * Get investment-related items.
     */
    private function getInvestmentItems(): array
    {
        return [
            [
                'title' => 'Kriteria Saham Syariah',
                'sources' => [],
                'explanation' => 'Kriteria OJK untuk saham yang dapat diperdagangkan di pasar modal syariah Indonesia.',
            ],
            [
                'title' => 'Reksadana Syariah',
                'sources' => [],
                'explanation' => 'Wadah investasi kolektif dengan portofolio efek syariah.',
            ],
            [
                'title' => 'Sukuk (Obligasi Syariah)',
                'sources' => [],
                'explanation' => 'Surat berharga syariah sebagai bukti penyertaan modal dalam investasi.',
            ],
        ];
    }

    /**
     * Get technology-related items.
     */
    private function getTechItems(): array
    {
        return [
            [
                'title' => 'Fintech Syariah',
                'sources' => [],
                'explanation' => 'Teknologi keuangan yang mengikuti prinsip syariah dalam setiap transaksi.',
            ],
            [
                'title' => 'E-Wallet Syariah',
                'sources' => [],
                'explanation' => 'Dompet elektronik dengan sistem akad dan investasi yang sesuai syariah.',
            ],
        ];
    }

    /**
     * Get marketing-related items.
     */
    private function getMarketingItems(): array
    {
        return [
            [
                'title' => 'Etika Iklan Islami',
                'sources' => [],
                'explanation' => 'Iklan harus jujur, tidak menipu, tidak berlebihan, dan menghormati nilai-nilai Islam.',
            ],
            [
                'title' => 'Brand Value Syariah',
                'sources' => [],
                'explanation' => 'Membangun merek dengan nilai-nilai kejujuran, kepercayaan, dan tanggung jawab.',
            ],
        ];
    }

    /**
     * Get HR-related items.
     */
    private function getSdmItems(): array
    {
        return [
            [
                'title' => 'Rekrutmen Islami',
                'sources' => [],
                'explanation' => 'Proses perekrutan berdasarkan kompetensi dan integritas, tanpa diskriminasi.',
            ],
            [
                'title' => 'Kompensasi Adil',
                'sources' => [],
                'explanation' => 'Pemberian upah yang layak dan tepat waktu sesuai kontribusi karyawan.',
            ],
            [
                'title' => 'Pengembangan Karir Islami',
                'sources' => [],
                'explanation' => 'Program pengembangan kompetensi dengan nilai-nilai profesionalisme Islam.',
            ],
        ];
    }

    /**
     * Get operational items.
     */
    private function getOperationalItems(): array
    {
        return [
            [
                'title' => 'Standar Operasional Prosedur (SOP)',
                'sources' => [],
                'explanation' => 'Dokumen yang mengatur proses kerja standar untuk memastikan konsistensi dan kualitas.',
            ],
            [
                'title' => 'Quality Assurance Islami',
                'sources' => [],
                'explanation' => 'Pengendalian kualitas dengan prinsip itqan (profesionalisme) dan amanah.',
            ],
        ];
    }

    /**
     * Get root-level items based on profile.
     */
    private function getRootItems(string $profile): array
    {
        if ($profile === 'active') {
            return [
                [
                    'title' => 'Catatan Meeting Bulanan',
                    'sources' => [],
                    'explanation' => 'Ringkasan keputusan dan tindak lanjut meeting koordinasi bulanan.',
                ],
                [
                    'title' => 'Target KPI Kuartalan',
                    'sources' => [],
                    'explanation' => 'Key Performance Indicators yang perlu dicapai dalam kuartal ini.',
                ],
            ];
        }

        if ($profile === 'medium') {
            return [
                [
                    'title' => 'Catatan Penting',
                    'sources' => [],
                    'explanation' => 'Catatan harian untuk referensi pekerjaan.',
                ],
            ];
        }

        if ($profile === 'compliance') {
            return [
                [
                    'title' => 'Jadwal Audit Tahunan',
                    'sources' => [],
                    'explanation' => 'Timeline audit kepatuhan syariah tahunan.',
                ],
            ];
        }

        if ($profile === 'finance') {
            return [
                [
                    'title' => 'Perhitungan Zakat Tahun Ini',
                    'sources' => [],
                    'explanation' => 'Dokumentasi perhitungan dan pembayaran zakat tahun berjalan.',
                ],
            ];
        }

        return [];
    }
}
