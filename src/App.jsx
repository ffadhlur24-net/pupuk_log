import React, { useState, useEffect } from 'react';
import { 
  getCatalogPupuk, 
  getStokGudang, 
  getPupukTersedia,
  getRiwayatBeli, 
  getRiwayatPemakaian, 
  getRekapAnalisisLahan 
} from './services/pupukService';

// Komponen Antarmuka Hasil Konversi Desain Figma & Penyempurnaan Sistem
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import DashboardView from './components/DashboardView';
import BeliPupukView from './components/BeliPupukView';
import PemakaianView from './components/PemakaianView';
import RiwayatBeliView from './components/RiwayatBeliView';
import RiwayatPakaiView from './components/RiwayatPakaiView';
import LaporanAnalisisView from './components/LaporanAnalisisView';

import { RefreshCw, AlertTriangle } from 'lucide-react';

export default function App() {
  // Navigasi Menu Aktif (Sesuai Sidebar Figma)
  const [activeMenu, setActiveMenu] = useState('dashboard');
  
  // State Data Supabase Cloud
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [katalog, setKatalog] = useState([]);
  const [stok, setStok] = useState([]);
  const [stokTersedia, setStokTersedia] = useState([]);
  const [riwayatBeli, setRiwayatBeli] = useState([]);
  const [riwayatPakai, setRiwayatPakai] = useState([]);
  const [rekapLahan, setRekapLahan] = useState([]);

  // Fungsi Fetch Seluruh Data dari Supabase
  const loadAllData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [katalogRes, stokRes, tersediaRes, beliRes, pakaiRes, lahanRes] = await Promise.all([
        getCatalogPupuk(),
        getStokGudang(),
        getPupukTersedia(),
        getRiwayatBeli(),
        getRiwayatPemakaian(),
        getRekapAnalisisLahan()
      ]);

      setKatalog(katalogRes || []);
      setStok(stokRes || []);
      setStokTersedia(tersediaRes || []);
      setRiwayatBeli(beliRes || []);
      setRiwayatPakai(pakaiRes || []);
      setRekapLahan(lahanRes || []);
    } catch (err) {
      console.error('Error load Supabase data:', err);
      setErrorMsg(err.message || 'Gagal memuat data dari Supabase. Pastikan koneksi internet dan .env aktif.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Filter Pupuk yang Berstatus Kritis / Habis (Untuk Alert Badge TopBar)
  const criticalItems = stok.filter(s => s.status_stok !== 'Aman');

  // Judul Dinamis TopBar (Sesuai Desain Figma: DASHBOARD PUPUK, BELI PUPUK, dll)
  const getPageTitle = () => {
    switch (activeMenu) {
      case 'dashboard': return 'DASHBOARD PUPUK';
      case 'beli': return 'BELI PUPUK (RESTOCK GUDANG)';
      case 'pemakaian': return 'PEMAKAIAN PUPUK DI LAHAN';
      case 'riwayat-beli': return 'RIWAYAT PEMBELIAN';
      case 'riwayat-pakai': return 'RIWAYAT PEMAKAIAN LAHAN';
      case 'laporan': return 'LAPORAN & ANALISIS EFISIENSI';
      default: return 'PUPUKLOG';
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-800 flex overflow-x-hidden font-sans">
      {/* 1. SIDEBAR NAVIGASI LIQUID GLASS (260px) */}
      <Sidebar 
        activeMenu={activeMenu} 
        setActiveMenu={setActiveMenu} 
        criticalCount={criticalItems.length}
      />

      {/* 2. AREA KONTEN KANAN UTAMA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar */}
        <TopBar 
          title={getPageTitle()}
          criticalItems={criticalItems}
          onRefresh={loadAllData}
          loading={loading}
          onSelectMenu={setActiveMenu}
        />

        {/* Konten Halaman */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {errorMsg && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-3 shadow-sm">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {loading && !stok.length ? (
            <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-16 text-center shadow-sm">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-3" />
              <h3 className="font-bold text-slate-800 text-base">Menyinkronkan Data Cloud PupukLog...</h3>
              <p className="text-xs text-slate-500 mt-1">Mengambil data dari basis data PostgreSQL Supabase.</p>
            </div>
          ) : (
            <>
              {activeMenu === 'dashboard' && (
                <DashboardView 
                  stok={stok} 
                  onNavigate={setActiveMenu} 
                />
              )}

              {activeMenu === 'beli' && (
                <BeliPupukView 
                  katalog={katalog} 
                  onRefresh={loadAllData} 
                  onNavigate={setActiveMenu} 
                />
              )}

              {activeMenu === 'pemakaian' && (
                <PemakaianView 
                  stokTersedia={stokTersedia} 
                  onRefresh={loadAllData} 
                  onNavigate={setActiveMenu} 
                />
              )}

              {activeMenu === 'riwayat-beli' && (
                <RiwayatBeliView 
                  riwayatBeli={riwayatBeli} 
                  onRefresh={loadAllData} 
                  onNavigate={setActiveMenu} 
                />
              )}

              {activeMenu === 'riwayat-pakai' && (
                <RiwayatPakaiView 
                  riwayatPakai={riwayatPakai} 
                  onRefresh={loadAllData} 
                  onNavigate={setActiveMenu} 
                />
              )}

              {activeMenu === 'laporan' && (
                <LaporanAnalisisView 
                  rekapLahan={rekapLahan} 
                  stok={stok} 
                  riwayatBeli={riwayatBeli} 
                  riwayatPakai={riwayatPakai} 
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
