import React, { useState } from 'react';
import { Search, AlertTriangle, ArrowUpRight, ArrowDownRight, Warehouse, ShoppingCart, Sprout } from 'lucide-react';

export default function DashboardView({ stok, onNavigate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'AMAN' | 'KRITIS' | 'HABIS'

  // Perhitungan KPI Sesuai Desain Figma:
  // 1. Total Stok (KG)
  const totalKg = stok
    .filter(s => s.satuan?.toLowerCase() === 'kg')
    .reduce((acc, curr) => acc + Number(curr.jumlah_stok || 0), 0);

  // 2. Total Stok (LITER)
  const totalLiter = stok
    .filter(s => s.satuan?.toLowerCase() === 'liter' || s.satuan?.toLowerCase() === 'l')
    .reduce((acc, curr) => acc + Number(curr.jumlah_stok || 0), 0);

  // 3. Total Stok (KARUNG/SAK) - Estimasi 50 kg per karung
  const totalSak = Math.floor(totalKg / 50);

  // Filter Data Tabel
  const filteredStok = stok.filter(item => {
    const matchesSearch = 
      item.pupuk?.nama_pupuk?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.pupuk?.kategori?.nama_unsur?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.pupuk?.status_subsidi?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'AMAN') return matchesSearch && item.status_stok === 'Aman';
    if (filterStatus === 'KRITIS') return matchesSearch && item.status_stok === 'Menipis (Alert)';
    if (filterStatus === 'HABIS') return matchesSearch && item.status_stok === 'Habis';
    return matchesSearch;
  });

  const criticalItems = stok.filter(s => s.status_stok !== 'Aman');

  return (
    <div className="space-y-6">
      {/* Banner Peringatan Dini Stok Minimum */}
      {criticalItems.length > 0 && (
        <div className="bg-amber-500/10 backdrop-blur-md border border-amber-500/30 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-amber-500 text-white rounded-xl shadow-sm">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Peringatan Stok Gudang: {criticalItems.length} jenis pupuk berada di bawah ambang batas minimum!
              </h4>
              <p className="text-xs text-slate-600">
                Segera lakukan pengadaan restock agar jadwal pemupukan tanaman tidak terganggu.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('beli')}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1.5 shrink-0"
          >
            <ShoppingCart className="w-4 h-4" /> Beli Pupuk Sekarang
          </button>
        </div>
      )}

      {/* 3 KARTU METRIK KPI UTAMA (SESUAI FIGMA DESKTOP - 2) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* KPI 1: TOTAL STOK (KG) */}
        <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                TOTAL STOK (KG)
              </p>
              <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-2 tracking-tight">
                {totalKg.toLocaleString('id-ID')} <span className="text-lg font-semibold text-slate-500">KG</span>
              </h3>
            </div>
            <span className="p-3 bg-emerald-100/70 text-emerald-800 rounded-2xl">
              <Warehouse className="w-6 h-6" />
            </span>
          </div>
          <p className="text-xs text-emerald-700 font-semibold mt-3 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Persediaan Padat / Butiran & Prill
          </p>
        </div>

        {/* KPI 2: TOTAL STOK (LITER) */}
        <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                TOTAL STOK (LITER)
              </p>
              <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-2 tracking-tight">
                {totalLiter.toLocaleString('id-ID')} <span className="text-lg font-semibold text-slate-500">L</span>
              </h3>
            </div>
            <span className="p-3 bg-sky-100/70 text-sky-800 rounded-2xl">
              <Sprout className="w-6 h-6" />
            </span>
          </div>
          <p className="text-xs text-sky-700 font-semibold mt-3 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Pupuk Organik Cair & Booster
          </p>
        </div>

        {/* KPI 3: TOTAL STOK (KARUNG / SAK) */}
        <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                TOTAL STOK (KARUNG)
              </p>
              <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-2 tracking-tight">
                {totalSak.toLocaleString('id-ID')} <span className="text-lg font-semibold text-slate-500">Sak</span>
              </h3>
            </div>
            <span className="p-3 bg-amber-100/70 text-amber-800 rounded-2xl">
              <ShoppingCart className="w-6 h-6" />
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-3">
            Konversi basis standard 50 kg / karung
          </p>
        </div>
      </div>

      {/* TABEL PERSEDIAAN GUDANG (LIQUID GLASS CONTAINER) */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl shadow-sm overflow-hidden">
        {/* Header Tabel & Search Bar */}
        <div className="p-5 border-b border-slate-200/60 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white/40">
          <div>
            <h3 className="text-base font-bold text-slate-900">Ketersediaan Stok Fisik Gudang</h3>
            <p className="text-xs text-slate-500">Daftar stok riil dengan ambang batas minimum dan peringatan otomatis.</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Input Bar (Sesuai Desain Figma) */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Cari pupuk, unsur, subsidi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white/80 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition shadow-inner"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setFilterStatus('ALL')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                  filterStatus === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilterStatus('KRITIS')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                  filterStatus === 'KRITIS' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Kritis
              </button>
              <button
                onClick={() => setFilterStatus('HABIS')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                  filterStatus === 'HABIS' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Habis
              </button>
            </div>
          </div>
        </div>

        {/* Tabel Data (Struktur Kolom Sesuai Figma) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100/70 text-slate-600 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200/60">
              <tr>
                <th className="py-3.5 px-6">NAMA PUPUK & INFO</th>
                <th className="py-3.5 px-4">KANDUNGAN & JENIS</th>
                <th className="py-3.5 px-4 text-center">SATUAN</th>
                <th className="py-3.5 px-6 text-right">STOCK TERSEDIA</th>
                <th className="py-3.5 px-6 text-center">STATUS</th>
                <th className="py-3.5 px-4 text-center">AKSI CEPAT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStok.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400 text-xs">
                    Tidak ada pupuk yang cocok dengan pencarian "{searchTerm}"
                  </td>
                </tr>
              ) : (
                filteredStok.map((item) => (
                  <tr key={item.id} className="hover:bg-white/60 transition group">
                    {/* NAMA PUPUK & INFO */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 group-hover:text-emerald-700 transition">
                          {item.pupuk?.nama_pupuk}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.pupuk?.status_subsidi === 'Subsidi' 
                            ? 'bg-sky-100 text-sky-800 border border-sky-200' 
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {item.pupuk?.status_subsidi}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">Bentuk: {item.pupuk?.bentuk || 'Butiran'} • Lokasi: {item.lokasi_gudang}</p>
                    </td>

                    {/* KANDUNGAN & JENIS */}
                    <td className="py-4 px-4 text-slate-600 text-xs">
                      <p className="font-semibold text-slate-800">{item.pupuk?.kategori?.nama_unsur}</p>
                      <p className="text-[11px] text-slate-400">Pupuk {item.pupuk?.kategori?.jenis}</p>
                    </td>

                    {/* SATUAN */}
                    <td className="py-4 px-4 text-center font-bold text-slate-700 uppercase text-xs">
                      {item.satuan}
                    </td>

                    {/* STOCK TERSEDIA */}
                    <td className="py-4 px-6 text-right">
                      <span className="text-base font-extrabold text-slate-900">
                        {Number(item.jumlah_stok).toLocaleString('id-ID')}
                      </span>
                      <span className="text-xs text-slate-500 ml-1">{item.satuan}</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Min. {Number(item.stok_minimum).toLocaleString('id-ID')} {item.satuan}
                      </p>
                    </td>

                    {/* STATUS BADGE (SESUAI FIGMA: Aman / Kritis Min.X / Habis) */}
                    <td className="py-4 px-6 text-center">
                      {item.status_stok === 'Aman' && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100/80 text-emerald-800 border border-emerald-200 inline-block">
                          Aman
                        </span>
                      )}
                      {item.status_stok === 'Menipis (Alert)' && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 inline-block animate-pulse">
                          Kritis Min.{item.stok_minimum}
                        </span>
                      )}
                      {item.status_stok === 'Habis' && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 inline-block">
                          Habis
                        </span>
                      )}
                    </td>

                    {/* AKSI CEPAT */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => onNavigate('beli')}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-600 hover:text-white rounded-xl text-xs font-semibold text-slate-700 transition"
                      >
                        + Beli
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
