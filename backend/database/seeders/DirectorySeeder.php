<?php

namespace Database\Seeders;

use App\Models\DirectoryItem;
use Illuminate\Database\Seeder;

class DirectorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $directoryData = $this->getDirectoryData();

        foreach ($directoryData as $folderData) {
            $this->seedFolder($folderData);
        }
    }

    /**
     * Seed a folder and its children.
     */
    private function seedFolder(array $folderData, ?int $parentId = null): DirectoryItem
    {
        $folder = DirectoryItem::create([
            'parent_id' => $parentId,
            'title' => $folderData['title'],
            'type' => 'folder',
            'content' => null,
        ]);

        if (isset($folderData['children'])) {
            foreach ($folderData['children'] as $childData) {
                $this->seedItem($childData, $folder->id);
            }
        }

        return $folder;
    }

    /**
     * Seed an item with its content.
     */
    private function seedItem(array $itemData, int $parentId): DirectoryItem
    {
        $content = null;

        // Build JSON content for items with dalil/source/explanation
        if (isset($itemData['dalil']) || isset($itemData['source']) || isset($itemData['explanation'])) {
            $content = json_encode([
                'dalil' => $itemData['dalil'] ?? null,
                'source' => $itemData['source'] ?? null,
                'explanation' => $itemData['explanation'] ?? null,
            ]);
        }

        return DirectoryItem::create([
            'parent_id' => $parentId,
            'title' => $itemData['title'],
            'type' => 'item',
            'content' => $content,
        ]);
    }

    /**
     * Get the directory data structure.
     */
    private function getDirectoryData(): array
    {
        return [
            // Al-Qur'an
            [
                'title' => "Al-Qur'an",
                'children' => [
                    [
                        'title' => 'Amanah (QS. An-Nisa: 58)',
                        'dalil' => 'إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا',
                        'source' => 'QS. An-Nisa: 58',
                        'explanation' => 'Prinsip dasar kepercayaan dan tanggung jawab dalam setiap amanah yang diemban, baik dalam pekerjaan, kepemimpinan, maupun muamalah sehari-hari.',
                    ],
                    [
                        'title' => 'Syura (QS. Asy-Syura: 38)',
                        'dalil' => 'وَأَمْرُهُمْ شُورَىٰ بَيْنَهُمْ',
                        'source' => 'QS. Asy-Syura: 38',
                        'explanation' => 'Pentingnya musyawarah dan pengambilan keputusan kolektif dalam urusan bersama untuk mencapai hasil terbaik dan kebersamaan.',
                    ],
                    [
                        'title' => 'Adil (QS. An-Nahl: 90)',
                        'dalil' => 'إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ',
                        'source' => 'QS. An-Nahl: 90',
                        'explanation' => 'Perintah untuk berlaku adil dalam segala hal, termasuk dalam hukum, bisnis, dan interaksi sosial, serta melengkapinya dengan ihsan (kebaikan).',
                    ],
                ],
            ],
            // As-Sunnah
            [
                'title' => 'As-Sunnah',
                'children' => [
                    [
                        'title' => 'Upah Tepat Waktu',
                        'dalil' => 'أَعْطُوا الأَجِيرَ أَجْرَهُ قَبْلَ أَنْ يَجِفَّ عَرَقَهُ',
                        'source' => 'HR. Ibnu Majah',
                        'explanation' => 'Kewajiban membayar upah pekerja segera setelah pekerjaan selesai, sebagai bentuk penghargaan atas hak dan usaha mereka.',
                    ],
                    [
                        'title' => 'Profesionalisme (Itqan)',
                        'dalil' => 'إِن اللهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلاً أَنْ يُتْقِنَهُ',
                        'source' => 'HR. Al-Baihaqi',
                        'explanation' => 'Anjuran untuk selalu bekerja dengan profesional, cermat, dan sebaik mungkin, karena Allah mencintai pekerjaan yang disempurnakan.',
                    ],
                ],
            ],
            // Maqasid Syariah
            [
                'title' => 'Maqasid Syariah',
                'children' => [
                    [
                        'title' => 'Hifdz ad-Din (Menjaga Agama)',
                        'explanation' => 'Tujuan utama syariah adalah untuk melindungi dan memelihara agama (akidah, ibadah, dan syiar Islam). Ini mencakup perlindungan dari segala bentuk penyelewengan, bid\'ah, dan serangan yang dapat merusak kemurnian ajaran Islam.',
                    ],
                    [
                        'title' => 'Hifdz an-Nafs (Menjaga Jiwa)',
                        'explanation' => 'Syariah sangat menekankan perlindungan terhadap jiwa manusia. Larangan membunuh, kewajiban menjaga kesehatan, dan adanya hukum qisas adalah bagian dari upaya menjaga hak hidup setiap individu.',
                    ],
                    [
                        'title' => 'Hifdz al-Aql (Menjaga Akal)',
                        'explanation' => 'Akal adalah anugerah yang membedakan manusia. Syariah melindungi akal dengan mendorong menuntut ilmu, berpikir kritis, dan melarang segala sesuatu yang dapat merusaknya, seperti minuman keras dan narkotika.',
                    ],
                    [
                        'title' => 'Hifdz an-Nasl (Menjaga Keturunan)',
                        'explanation' => 'Perlindungan terhadap garis keturunan dan institusi keluarga. Syariat pernikahan, larangan zina, dan anjuran untuk mendidik anak adalah cara Islam menjaga keberlangsungan generasi yang baik.',
                    ],
                    [
                        'title' => 'Hifdz al-Mal (Menjaga Harta)',
                        'explanation' => 'Syariah melindungi hak kepemilikan harta yang diperoleh secara halal. Larangan mencuri, riba, korupsi, serta anjuran untuk berzakat, infaq, dan wakaf adalah cara Islam mengatur dan menjaga harta agar bermanfaat.',
                    ],
                ],
            ],
            // Prinsip POAC Islami
            [
                'title' => 'Prinsip POAC Islami',
                'children' => [
                    [
                        'title' => 'Planning (Takhthith)',
                        'dalil' => 'يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ وَلْتَنظُرْ نَفْسٌ مَّا قَدَّمَتْ لِغَدٍ',
                        'source' => 'QS. Al-Hashr: 18',
                        'explanation' => 'Perencanaan adalah langkah awal yang menekankan pentingnya visi dan persiapan untuk masa depan, baik urusan duniawi maupun ukhrawi, dengan didasari ketakwaan.',
                    ],
                    [
                        'title' => 'Organizing (Tanzhim)',
                        'dalil' => 'إِنَّ اللَّهَ يُحِبُّ الَّذِينَ يُقَاتِلُونَ فِي سَبِيلِهِ صَفًّا كَأَنَّهُم بُنْيَانٌ مَّرْصُوصٌ',
                        'source' => 'QS. As-Saff: 4',
                        'explanation' => 'Pengorganisasian berarti menyusun sumber daya dan tim dalam struktur yang rapi dan kokoh, di mana setiap individu memiliki peran yang jelas untuk mencapai tujuan bersama.',
                    ],
                    [
                        'title' => 'Actuating (Tawjih)',
                        'dalil' => 'فَقُولَا لَهُ قَوْلًا لَّيِّنًا لَّعَلَّهُ يَتَذَكَّرُ أَوْ يَخْشَىٰ',
                        'source' => 'QS. Ta-Ha: 44',
                        'explanation' => 'Pelaksanaan melibatkan pengarahan, motivasi, dan komunikasi yang efektif. Kepemimpinan Islam menekankan pada bimbingan yang lemah lembut, bijaksana, dan penuh keteladanan.',
                    ],
                    [
                        'title' => 'Controlling (Riqabah)',
                        'dalil' => 'مَّا يَلْفِظُ مِن قَوْلٍ إِلَّا لَدَيْهِ رَقِيبٌ عَتِيدٌ',
                        'source' => 'QS. Qaf: 18',
                        'explanation' => 'Pengawasan dalam Islam tidak hanya bersifat horizontal (antar manusia) tetapi juga vertikal (kepada Allah). Ini mencakup evaluasi, akuntabilitas, dan kesadaran bahwa setiap tindakan selalu dalam pengawasan Allah.',
                    ],
                ],
            ],
        ];
    }
}
