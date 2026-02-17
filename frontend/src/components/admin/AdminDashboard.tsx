import React, { useState, useEffect, useCallback } from 'react';
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
import { adminApi, getErrorMessage } from '@/lib/api-services';
import type { AdminStats, ActivityLog, UserGrowthData } from '@/types/api';
import {
  UsersIcon,
  ToolsIcon,
  CheckCircleIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
  DownloadIcon,
} from '@/components/common/Icons';
import { Skeleton, SkeletonCard, SkeletonAvatar } from '@/components/common/Skeleton';

const AdminDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [userGrowth, setUserGrowth] = useState<UserGrowthData | null>(null);

  const fetchAdminData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [statsData, growthData] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUserGrowth(),
      ]);
      setStats(statsData);
      setUserGrowth(growthData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    return `${diffDays} hari yang lalu`;
  };

  const exportPDF = async () => {
    try {
      const blob = await adminApi.exportStatsPdf();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[T:]/g, '_')
        .replace(/-/g, '_');
      a.href = url;
      a.download = `dashboard_stats_${timestamp}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      // Open in new tab for viewing/printing
      window.open(url, '_blank');
    } catch (err) {
      console.error('Export PDF error:', getErrorMessage(err));
    }
  };

  const exportExcel = async () => {
    try {
      const blob = await adminApi.exportStatsXlsx();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[T:]/g, '_')
        .replace(/-/g, '_');
      a.href = url;
      a.download = `dashboard_stats_${timestamp}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export Excel error:', getErrorMessage(err));
    }
  };

  const statCards = stats
    ? [
        {
          title: 'Total Pengguna',
          value: (stats.totalUsers || 0).toLocaleString(),
          change: 'Terdaftar',
          icon: UsersIcon,
          color: 'bg-indigo-500',
        },
        {
          title: 'Total Tugas',
          value: (stats.totalTasks || 0).toLocaleString(),
          change: `${stats.completedTasks || 0} selesai`,
          icon: ToolsIcon,
          color: 'bg-emerald-500',
        },
        {
          title: 'User Aktif',
          value: (stats.activeUsers || 0).toLocaleString(),
          change: '30 hari terakhir',
          icon: CheckCircleIcon,
          color: 'bg-blue-500',
        },
        {
          title: 'Tugas Selesai',
          value: (stats.completedTasks || 0).toLocaleString(),
          change: `${(stats.totalTasks || 0) > 0 ? Math.round(((stats.completedTasks || 0) / stats.totalTasks) * 100) : 0}%`,
          icon: ArrowTrendingUpIcon,
          color: 'bg-violet-500',
        },
      ]
    : [];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Admin Control Center</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Pantau integritas dan ekosistem platform secara real-time.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={exportPDF}
            className="flex items-center px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition text-sm font-bold shadow-sm active:scale-95 border border-transparent dark:border-gray-600"
            title="Ekspor laporan statistik dalam format PDF"
          >
            <DownloadIcon className="w-4 h-4 mr-2" />
            Laporan PDF
          </button>
          <button
            type="button"
            onClick={exportExcel}
            className="flex items-center px-5 py-2.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition text-sm font-bold shadow-sm active:scale-95 border border-emerald-100 dark:border-emerald-800/30"
            title="Ekspor data statistik dalam format Excel"
          >
            <DownloadIcon className="w-4 h-4 mr-2" />
            Data Excel
          </button>
          <span className="hidden md:inline-flex px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded-xl border border-indigo-100 dark:border-indigo-900/50 uppercase tracking-widest">
            Super Admin
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800/30">
          <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-50 dark:border-gray-700 flex flex-col items-start hover:shadow-lg transition-all group"
            >
              <div
                className={`p-3.5 rounded-xl ${stat.color} text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}
              >
                <stat.icon className="w-6 h-6" />
              </div>
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">
                {stat.title}
              </p>
              <div className="flex items-baseline space-x-2 mt-1">
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {stat.value}
                </h4>
                <span className="text-xs font-bold text-emerald-500">{stat.change}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
          <div className="mb-4">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">
              Analytics
            </p>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              User Growth Chart
            </h3>
          </div>
          <div className="h-80 w-full">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <Skeleton className="h-64 w-full" />
              </div>
            ) : userGrowth && userGrowth.monthly.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={userGrowth.monthly}
                  margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(128, 128, 128, 0.1)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: 'currentColor', fontSize: 12 }}
                    interval={0}
                  />
                  <YAxis tick={{ fill: 'currentColor', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(31, 41, 55, 0.95)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      color: '#f3f4f6',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                    }}
                    cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                    formatter={(value: number, name: string) => [
                      name === 'newUsers' ? value : value.toLocaleString(),
                      name === 'newUsers' ? 'New Users' : 'Total Users',
                    ]}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Bar
                    dataKey="newUsers"
                    fill="#2563eb"
                    name="New Users"
                    barSize={35}
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                <p>Belum ada data pertumbuhan pengguna</p>
              </div>
            )}
          </div>
          {/* Summary Stats */}
          {userGrowth && (
            <div className="grid grid-cols-3 gap-4 pt-4 mt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  +{userGrowth.summary.totalNewUsers}
                </p>
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  New Users
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  +{userGrowth.summary.avgGrowthRate}%
                </p>
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Avg Growth
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                  {userGrowth.summary.activeUsers}
                </p>
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Active Now
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
          <div className="mb-8">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 mb-1">
              Aktivitas Terkini
            </p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Admin Logs</h3>
          </div>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center space-x-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900"
                >
                  <SkeletonAvatar size="sm" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {stats.recentActivity.map((log: ActivityLog) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-all cursor-default"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-11 h-11 rounded-xl bg-white dark:bg-gray-800 border dark:border-gray-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold shadow-sm">
                      {log.user?.name?.[0] || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white leading-snug">
                        {log.description || log.action}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Oleh {log.user?.name || 'Sistem'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                    {formatTimeAgo(log.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 italic">
              Belum ada aktivitas terbaru.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
