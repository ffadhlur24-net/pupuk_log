import React from 'react';
import { TrendingUp, Download, Printer, FileSpreadsheet, MapPin, DollarSign, Sprout, ArrowUpRight } from 'lucide-react';
import { exportToExcel, exportToPdf } from '../utils/exportHelpers';

export default function LaporanAnalisisView({ rekapLahan, stok, riwayatBeli, riwayatPakai }) {
  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
  };

  // Perhitungan Rata-Rata Biaya per Hektar Gabungan Seluruh Lahan
  const lahanDenganLuas = rekapLahan.filter(l => Number(l.luas_lahan_ha || 0) > 0);
  const totalBiayaSemuaLahan = lahanDenganLuas.reduce((acc, curr) => acc + Number(curr.total_biaya || 0), 0);
  const totalLuasSemuaLahan = lahanDenganLuas.reduce((acc, curr) => acc + Number(curr.luas_lahan_ha || 0), 0);

  const rataRataBiayaPerHaNasional = totalLuasSemuaLahan > 0 
    ? Math.round(totalBiayaSemuaLahan / totalLuasSemuaLahan) 
    : 1250000; // Sesuai angka Figma jika data kosong

  const biayaPerMeterPersegi = Math.round(rataRataBiayaPerHaNasional / 10000);

  const handleExportExcel = () => {
    exportToExcel({ stok, riwayatBeli, riwayatPakai, rekapLahan });
  };

  const handleExportPdf = () => {
    exportToPdf({ stok, riwayatBeli, riwayatPakai, rekapLahan });
  };

  return (
    <div className="space-y-6">
      {/* Bilah Header Laporan & Tombol Ekspor Sesuai Proposal */}
      <div className="bg-white/60 backdrop-blur-md border border-slate-200/80 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-700" /> Analisis Efisiensi Biaya & Laporan Manajerial
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluasi perbandingan rasio biaya pemupukan terhadap luas lahan serta unduh laporan cetak.
          </p>
        </div>

        {/* Tombol Ekspor Excel & PDF (Penyempurnaan Wajib Tugas SIM) */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={handleExportExcel}
            className="flex-1 md:flex-initial px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-2"
            title="Unduh Laporan Lengkap Format Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleExportPdf}
            className="flex-1 md:flex-initial px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-2"
            title="Cetak Dokumen Laporan Formal Format PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak PDF</span>
          </button>
        </div>
      </div>

      {/* 2 WIDGET ANALISIS SESUAI FIGMA (GROUP 38 / LAPORAN) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* WIDGET 1: RASIO BIAYA VS LUAS (SESUAI FIGMA: RP. 1.250.000 PERHEKTAR) */}
        <div className="lg:col-span-6 bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  RASIO BIAYA VS LUAS LAHAN
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">Rata-rata tertimbang biaya aplikasi pupuk</p>
              </div>
              <span className="p-3 bg-emerald-100/80 text-emerald-800 rounded-2xl">
                <DollarSign className="w-6 h-6" />
              </span>
            </div>

            {/* Nilai Per Hektar Highlight */}
            <div className="mt-6 p-5 bg-gradient-to-br from-emerald-500/10 to-emerald-700/10 border border-emerald-500/30 rounded-2xl">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                PER HEKTAR (HA)
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-emerald-900 font-mono mt-1 tracking-tight">
                {formatRupiah(rataRataBiayaPerHaNasional)}
              </h2>
              <p className="text-xs text-slate-600 mt-2 flex items-center gap-1 font-medium">
                <ArrowUpRight className="w-4 h-4 text-emerald-700" /> Berdasarkan akumulasi {totalLuasSemuaLahan} Ha lahan aktif
              </p>
            </div>
          </div>

          {/* Nilai Per Meter Persegi (Sesuai Figma: PER METER PERSEGI) */}
          <div className="mt-4 p-4 bg-white/60 border border-slate-200/80 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">PER METER PERSEGI (M²)</p>
              <p className="text-xl font-bold text-slate-900 font-mono mt-0.5">
                {formatRupiah(biayaPerMeterPersegi)} <span className="text-xs font-normal text-slate-500">/ m²</span>
              </p>
            </div>
            <span className="text-xs text-slate-400 font-medium">Estimasi 1 Ha = 10.000 m²</span>
          </div>
        </div>

        {/* WIDGET 2: TREN PEMAKAIAN (KG & LITER) */}
        <div className="lg:col-span-6 bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  TREN PEMAKAIAN (KG & LITER)
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">Distribusi konsumsi pupuk di blok-blok kebun</p>
              </div>
              <span className="p-3 bg-sky-100/80 text-sky-800 rounded-2xl">
                <TrendingUp className="w-6 h-6" />
              </span>
            </div>

            {/* Bar Visualisasi Proporsi Penggunaan */}
            <div className="mt-6 space-y-4">
              {rekapLahan.map((item, idx) => {
                const totalSemuaKg = rekapLahan.reduce((acc, curr) => acc + Number(curr.total_pupuk_terpakai_kg || 0), 0);
                const persentase = totalSemuaKg > 0 ? Math.round((Number(item.total_pupuk_terpakai_kg || 0) / totalSemuaKg) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-800 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" /> {item.nama_lahan} ({item.jenis_tanaman})
                      </span>
                      <span className="font-mono text-slate-900">
                        {Number(item.total_pupuk_terpakai_kg || 0).toLocaleString('id-ID')} kg ({persentase}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-600 rounded-full transition-all duration-500" 
                        style={{ width: `${persentase}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-500">
            <span>Total Aplikasi: {riwayatPakai.length} kali pemupukan</span>
            <span className="font-semibold text-emerald-700">Data Terintegrasi Cloud</span>
          </div>
        </div>

      </div>

      {/* TABEL REKAPITULASI DARI VIEW v_analisis_lahan */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200/60 bg-white/40 flex justify-between items-center">
          <div>
            <h4 className="font-extrabold text-sm text-slate-900">Tabel Evaluasi Efisiensi per Blok Lahan</h4>
            <p className="text-xs text-slate-500">Dihitung otomatis oleh view PostgreSQL <code>v_analisis_lahan</code> di database Supabase.</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-xl">
            {rekapLahan.length} Lahan Aktif
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100/70 text-slate-600 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200/60">
              <tr>
                <th className="py-3.5 px-6">BLOK LAHAN</th>
                <th className="py-3.5 px-4">KOMODITAS TANAMAN</th>
                <th className="py-3.5 px-4 text-center">FREKUENSI APLIKASI</th>
                <th className="py-3.5 px-4 text-right">LUAS LAHAN</th>
                <th className="py-3.5 px-4 text-right">TOTAL PUPUK (KG)</th>
                <th className="py-3.5 px-6 text-right">TOTAL BIAYA (RP)</th>
                <th className="py-3.5 px-6 text-right font-bold text-emerald-800">RATA-RATA BIAYA / HA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rekapLahan.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400 text-xs">
                    Belum ada data pemupukan lahan untuk dianalisis.
                  </td>
                </tr>
              ) : (
                rekapLahan.map((item, idx) => (
                  <tr key={idx} className="hover:bg-white/60 transition">
                    <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      {item.nama_lahan}
                    </td>

                    <td className="py-4 px-4 text-xs font-semibold text-slate-700">
                      {item.jenis_tanaman}
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                        {item.total_pemupukan}x pemupukan
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right font-medium text-slate-700 text-xs">
                      {item.luas_lahan_ha ? `${item.luas_lahan_ha} Ha` : <span className="text-slate-400 italic">Non-lahan</span>}
                    </td>

                    <td className="py-4 px-4 text-right font-extrabold text-slate-900 text-xs">
                      {Number(item.total_pupuk_terpakai_kg || 0).toLocaleString('id-ID')} kg
                    </td>

                    <td className="py-4 px-6 text-right font-mono font-bold text-slate-900 text-xs">
                      {formatRupiah(item.total_biaya)}
                    </td>

                    <td className="py-4 px-6 text-right font-mono font-extrabold text-emerald-800 text-sm">
                      {item.rata_rata_biaya_per_ha ? (
                        formatRupiah(item.rata_rata_biaya_per_ha)
                      ) : (
                        <span className="text-slate-400 font-normal italic text-xs">Non-lahan</span>
                      )}
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
