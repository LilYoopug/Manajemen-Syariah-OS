import React, { useState, useMemo } from 'react';
import type { Tool } from '@/types/api';
import { XMarkIcon, BookOpenIcon, LinkIcon, BriefcaseIcon } from '@/components/common/Icons';
import ModalPortal from '@/components/common/ModalPortal';

interface ToolDetailModalProps {
  tool: Tool;
  onClose: () => void;
}

const SyariahInstallmentCalculator: React.FC = () => {
  const [price, setPrice] = useState(10000000);
  const [margin, setMargin] = useState(10); // in percent
  const [tenor, setTenor] = useState(12); // in months

  const monthlyInstallment = useMemo(() => {
    if (tenor <= 0) return 0;
    const totalCost = price * (1 + margin / 100);
    return totalCost / tenor;
  }, [price, margin, tenor]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
      <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Coba Kalkulator</h4>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Harga Barang (Rp)
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="mt-1 w-full px-3 py-2 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="Contoh: 10000000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Margin Keuntungan (%)
          </label>
          <input
            type="number"
            value={margin}
            onChange={(e) => setMargin(Number(e.target.value))}
            className="mt-1 w-full px-3 py-2 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="Contoh: 15"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Jangka Waktu (Bulan)
          </label>
          <input
            type="number"
            value={tenor}
            onChange={(e) => setTenor(Number(e.target.value))}
            className="mt-1 w-full px-3 py-2 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="Contoh: 12"
          />
        </div>
      </div>
      <div className="mt-6 p-4 bg-primary-100 dark:bg-primary-900/50 rounded-md text-center">
        <p className="text-sm text-primary-800 dark:text-primary-200">Estimasi Angsuran Bulanan</p>
        <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
          {formatCurrency(monthlyInstallment)}
        </p>
      </div>
    </div>
  );
};

const ToolDetailModal: React.FC<ToolDetailModalProps> = ({ tool, onClose }) => {
  return (
    <ModalPortal>
      <div
        className="fixed inset-0 w-full h-full bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>

          <div className="flex items-start space-x-6">
            <div className="p-3 bg-primary-100 dark:bg-primary-900/50 rounded-full">
              <BriefcaseIcon className="w-10 h-10 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <span className="text-sm font-semibold text-secondary-700 dark:text-secondary-400">
                {tool.category}
              </span>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {tool.name}
              </h2>
            </div>
          </div>

          <div className="mt-6 space-y-4 text-gray-700 dark:text-gray-300">
            <p className="text-lg leading-relaxed">{tool.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2">Inputs:</h4>
                <ul className="text-sm space-y-1">
                  {tool.inputs?.map((item, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2">Outputs:</h4>
                <ul className="text-sm space-y-1">
                  {tool.outputs?.map((item, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Manfaat Utama:
              </h4>
              <ul className="text-sm space-y-1">
                {tool.benefits?.map((item, index) => (
                  <li key={index} className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {tool.shariaBasis && (
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                  <BookOpenIcon className="w-5 h-5 mr-2" />
                  Landasan Syariah Terkait:
                </h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-medium px-3 py-1.5 rounded-full">
                    {tool.shariaBasis}
                  </span>
                </div>
              </div>
            )}

            {tool.relatedDalilText && (
              <div className="p-5 bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-500 rounded-r-xl">
                <h4 className="font-bold text-primary-900 dark:text-primary-100 mb-2">
                  Dalil Pendukung:
                </h4>
                <blockquote className="mt-2">
                  <p className="text-md italic text-gray-800 dark:text-gray-200">
                    "{tool.relatedDalilText}"
                  </p>
                  {tool.relatedDalilSource && (
                    <footer className="text-right text-sm text-gray-500 dark:text-gray-400 mt-2">
                      — {tool.relatedDalilSource}
                    </footer>
                  )}
                </blockquote>
              </div>
            )}

            {tool.link && (
              <div className="pt-4">
                <a
                  href={tool.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full py-4 px-6 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition shadow-lg transform hover:-translate-y-0.5"
                >
                  <LinkIcon className="w-5 h-5 mr-3" />
                  Akses Tool Sekarang
                </a>
                <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">
                  Link akan terbuka di tab baru. Pastikan Anda telah masuk (login) jika diperlukan.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default ToolDetailModal;
