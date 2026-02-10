
import React, { useState, useEffect, useMemo } from 'react';
import { getKpiDataForPeriod, getGoalsDataForPeriod } from '../constants';
import KpiCard from './KpiCard';
import GoalTracker from './GoalTracker';
import { DownloadIcon, CalendarDaysIcon } from './Icons';
import type { Goal, Kpi } from '../types';
import AIInsightCard from './AIInsightCard';

declare const Recharts: any;
declare const jsPDF: any;
declare const XLSX: any;

type DateRange = '7' | '30' | 'all';

interface DashboardProps {
    dateRange: DateRange;
    setDateRange: (range: DateRange) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ dateRange, setDateRange }) => {
  const [chartReady, setChartReady] = useState(false);

  const displayKpis = useMemo(() => getKpiDataForPeriod(dateRange === 'all' ? null : parseInt(dateRange)), [dateRange]);
  const displayGoals = useMemo(() => getGoalsDataForPeriod(dateRange === 'all' ? null : parseInt(dateRange)), [dateRange]);

  useEffect(() => {
    const loadRecharts = () => {
        if (typeof Recharts !== 'undefined') {
            setChartReady(true);
            return;
        }

        const script = document.createElement('script');
        script.src = "https://unpkg.com/recharts/umd/Recharts.min.js";
        script.async = true;
        script.onload = () => {
            setChartReady(true);
        };
        document.body.appendChild(script);
    };

    if ((window as any).React) {
        loadRecharts();
    } else {
        const checkReact = setInterval(() => {
            if ((window as any).React) {
                loadRecharts();
                clearInterval(checkReact);
            }
        }, 50);
        return () => clearInterval(checkReact);
    }
  }, []);

  const handleExportPDF = () => {
    const doc = new jsPDF.jsPDF();
    doc.text("Laporan Dashboard Manajemen Syariah OS", 20, 10);
    doc.text(`Periode: ${dateRange === 'all' ? 'Semua Waktu' : ` ${dateRange} Hari Terakhir`}`, 20, 20);
    doc.text("Key Performance Indicators (KPI)", 20, 30);
    let yPos = 40;
    displayKpis.forEach(kpi => {
        doc.text(`${kpi.title}: ${kpi.value} (${kpi.change})`, 20, yPos);
        yPos += 10;
    });

    doc.text("Goals & Targets", 20, yPos + 10);
    yPos += 20;
    displayGoals.forEach(goal => {
        doc.text(`${goal.title}: ${goal.progress.toLocaleString()} / ${goal.target.toLocaleString()} ${goal.unit}`, 20, yPos);
        yPos += 10;
    });

    doc.save("dashboard-report.pdf");
  };

  const handleExportExcel = () => {
    const kpiWorksheet = XLSX.utils.json_to_sheet(displayKpis);
    const goalsWorksheet = XLSX.utils.json_to_sheet(displayGoals);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, kpiWorksheet, "KPIs");
    XLSX.utils.book_append_sheet(workbook, goalsWorksheet, "Goals");
    XLSX.writeFile(workbook, "dashboard-report.xlsx");
  };

  const renderChart = () => {
    if (!chartReady || typeof Recharts === 'undefined') {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-medium">Memuat Grafik Muamalah...</p>
        </div>
      );
    }
    const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = Recharts;
    
    const chartData = displayGoals.map((g: Goal) => ({ 
        name: g.title.length > 15 ? g.title.substring(0, 12) + '...' : g.title, 
        progress: Math.round((g.progress / g.target) * 100) 
    }));

    return (
       <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.1)" vertical={false} />
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
                fontSize: '12px'
              }}
              cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
            />
            <Legend verticalAlign="top" height={36}/>
            <Bar dataKey="progress" fill="#2563eb" name="Progres Capaian (%)" barSize={35} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Monitoring Dashboard</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Visualisasi capaian amanah dan target strategis.</p>
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
            <button onClick={handleExportPDF} className="flex items-center px-5 py-2.5 text-sm font-bold text-white bg-primary-600 rounded-xl hover:bg-primary-700 focus:outline-none transition shadow-md active:scale-95">
                <DownloadIcon className="w-4 h-4 mr-2" />
                PDF
            </button>
            <button onClick={handleExportExcel} className="flex items-center px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 focus:outline-none transition shadow-md active:scale-95">
                <DownloadIcon className="w-4 h-4 mr-2" />
                Excel
            </button>
        </div>
      </div>
      
      <AIInsightCard kpiData={displayKpis} goalData={displayGoals} />
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {displayKpis.map((kpi, index) => (
          <KpiCard key={index} {...kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
          <div className="mb-4">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Statistik Capaian</p>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Grafik Target (%)</h3>
          </div>
          <div className="h-96 w-full">
            {renderChart()}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
          <div className="mb-4">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Detail Progres</p>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Goals & Targets</h3>
          </div>
          <div className="space-y-6">
            {displayGoals.map(goal => (
              <GoalTracker key={goal.id} {...goal} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
