import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { dashboardApi, getErrorMessage } from '@/lib/api-services';
import type { DashboardData, DashboardGoal } from '@/types/api';
import {
  DownloadIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  CheckCircleIcon,
  FolderIcon,
  SparklesIcon,
} from '@/components/common/Icons';
import AIInsightCard from '@/components/ai/AIInsightCard';
import { Skeleton, SkeletonCard } from '@/components/common/Skeleton';

declare const jsPDF: any;
declare const XLSX: any;

type DateRange = '7' | '30' | 'all';

const periodLabels: Record<string, string> = {
  'one-time': 'Sekali',
  daily: 'Harian',
  weekly: 'Mingguan',
  monthly: 'Bulanan',
  yearly: 'Tahunan',
};

interface DashboardProps {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
}

interface KpiData {
  title: string;
  value: string | number;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ElementType;
}

const Dashboard: React.FC<DashboardProps> = ({ dateRange, setDateRange }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await dashboardApi.get();
      setDashboardData(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const displayKpis = useMemo((): KpiData[] => {
    if (!dashboardData) return [];
    return [
      {
        title: 'Total Tugas',
        value: dashboardData.kpi.totalTasks,
        change: 'Tugas Aktif',
        changeType: 'neutral',
        icon: ChartBarIcon,
      },
      {
        title: 'Tugas Selesai',
        value: dashboardData.kpi.completedTasks,
        change: `${dashboardData.kpi.completionPercentage}%`,
        changeType: 'increase',
        icon: CheckCircleIcon,
      },
      {
        title: 'Kategori',
        value: Object.keys(dashboardData.kpi.tasksByCategory || {}).length,
        change: 'Kategori Aktif',
        changeType: 'neutral',
        icon: FolderIcon,
      },
      {
        title: 'Kepatuhan Syariah',
        value: `${dashboardData.kpi.kepatuhanSyariahScore}%`,
        change: 'Score',
        changeType: 'increase',
        icon: SparklesIcon,
      },
    ];
  }, [dashboardData]);

  const displayGoals = useMemo((): DashboardGoal[] => {
    return dashboardData?.goals || [];
  }, [dashboardData]);

  const handleExportPDF = () => {
    const doc = new jsPDF.jsPDF();
    doc.text('Laporan Dashboard Manajemen Syariah OS', 20, 10);
    doc.text(
      `Periode: ${dateRange === 'all' ? 'Semua Waktu' : ` ${dateRange} Hari Terakhir`}`,
      20,
      20
    );
    doc.text('Key Performance Indicators (KPI)', 20, 30);
    let yPos = 40;
    displayKpis.forEach((kpi) => {
      doc.text(`${kpi.title}: ${kpi.value} (${kpi.change})`, 20, yPos);
      yPos += 10;
    });

    doc.text('Goals & Targets', 20, yPos + 10);
    yPos += 20;
    displayGoals.forEach((goal) => {
      doc.text(
        `${goal.title}: ${(goal.progress || 0).toLocaleString()} / ${(goal.target || 0).toLocaleString()} ${goal.unit || ''}`,
        20,
        yPos
      );
      yPos += 10;
    });

    doc.save('dashboard-report.pdf');
  };

  const handleExportExcel = () => {
    const kpiWorksheet = XLSX.utils.json_to_sheet(displayKpis);
    const goalsWorksheet = XLSX.utils.json_to_sheet(displayGoals);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, kpiWorksheet, 'KPIs');
    XLSX.utils.book_append_sheet(workbook, goalsWorksheet, 'Goals');
    XLSX.writeFile(workbook, 'dashboard-report.xlsx');
  };

  const chartData = displayGoals.map((g: DashboardGoal) => ({
    name: (g.title?.length || 0) > 15 ? (g.title?.substring(0, 12) || '') + '...' : g.title || '',
    progress: (g.target || 0) > 0 ? Math.round(((g.progress || 0) / (g.target || 1)) * 100) : 0,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Monitoring Dashboard
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Visualisasi capaian amanah dan target strategis.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRange)}
              className="appearance-none cursor-pointer pl-10 pr-10 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm transition-all"
            >
              <option value="all">Semua Waktu</option>
              <option value="30">30 Hari</option>
              <option value="7">7 Hari</option>
            </select>
            <CalendarDaysIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <button
            onClick={handleExportPDF}
            className="flex items-center px-5 py-2.5 text-sm font-bold text-white bg-primary-600 rounded-xl hover:bg-primary-700 focus:outline-none transition shadow-md active:scale-95"
          >
            <DownloadIcon className="w-4 h-4 mr-2" />
            PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 focus:outline-none transition shadow-md active:scale-95"
          >
            <DownloadIcon className="w-4 h-4 mr-2" />
            Excel
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800/30">
          <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <AIInsightCard kpiData={displayKpis} goalData={displayGoals} />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          displayKpis.map((kpi, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 p-4 lg:p-4 xl:p-6 rounded-2xl shadow-md flex items-center space-x-3 transition hover:shadow-lg hover:scale-105 min-w-0 overflow-hidden border border-gray-100 dark:border-gray-700"
            >
              <div
                className={`p-2.5 rounded-full flex-shrink-0 ${kpi.changeType === 'increase' ? 'bg-green-100 dark:bg-green-900/50' : 'bg-blue-100 dark:bg-blue-900/50'}`}
              >
                <kpi.icon
                  className={`w-5 h-5 lg:w-6 lg:h-6 ${kpi.changeType === 'increase' ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className="text-[10px] lg:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider truncate"
                  title={kpi.title}
                >
                  {kpi.title}
                </p>
                <div className="flex items-baseline space-x-1 mt-0.5 flex-wrap">
                  <p className="text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
                    {kpi.value}
                  </p>
                  <span className="text-[10px] lg:text-xs font-bold flex-shrink-0 text-emerald-500">
                    {kpi.change}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
          <div className="mb-4">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">
              Statistik Capaian
            </p>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Grafik Target (%)
            </h3>
          </div>
          <div className="h-96 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(128, 128, 128, 0.1)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: 'currentColor', fontSize: 10 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis unit="%" tick={{ fill: 'currentColor', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(31, 41, 55, 0.95)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      color: '#f3f4f6',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                    }}
                    cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Bar
                    dataKey="progress"
                    fill="#2563eb"
                    name="Progres Capaian (%)"
                    barSize={35}
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                <p>Belum ada data goals untuk ditampilkan</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
          <div className="mb-4">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">
              Detail Progres
            </p>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Goals & Targets</h3>
          </div>
          {isLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                  <Skeleton className="h-4 w-24 mt-2" />
                </div>
              ))}
            </div>
          ) : displayGoals.length > 0 ? (
            <div className="space-y-6">
              {displayGoals.map((goal) => {
                const progress = goal.progress || 0;
                const target = goal.target || 1;
                const percentage =
                  goal.percentage ??
                  (target > 0 ? Math.min(Math.round((progress / target) * 100), 100) : 0);
                return (
                  <div
                    key={goal.id}
                    className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {goal.title || 'Untitled Goal'}
                        </span>
                        {goal.resetCycle && (
                          <span className="text-[10px] px-2 py-0.5 bg-primary-100 dark:bg-primary-800/30 text-primary-700 dark:text-primary-300 rounded-full font-medium">
                            {periodLabels[goal.resetCycle] || goal.resetCycle}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-gray-500 dark:text-gray-400">
                        {progress.toLocaleString()} / {target.toLocaleString()} {goal.unit || ''}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 dark:text-gray-500">
              <p>Belum ada goals yang ditetapkan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
