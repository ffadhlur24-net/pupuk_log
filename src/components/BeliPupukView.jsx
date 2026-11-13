import React, { useState } from 'react';
import { Search, ShoppingCart, Calendar, Plus, CheckCircle2, AlertCircle, Package } from 'lucide-react';
import { createTransaksiBeli } from '../services/pupukService';

export default function BeliPupukView({ katalog, onRefresh, onNavigate }) {
  // Selected Fertilizer from Left Catalog Panel
  const [selectedPupuk, setSelectedPupuk] = useState(katalog[0] || null);

  // Search & Filter in Left Panel (Penyempurnaan Cascading)
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJenis, setFilterJenis] = useState('ALL'); // 'ALL' | 'Tunggal' | 'Majemuk'
  const [filterSubsidi, setFilterSubsidi] = useState('ALL'); // 'ALL' | 'Subsidi' | 'Non Subsidi'

  // Form State
  const [tanggalBeli, setTanggalBeli] = useState(new Date().toISOString().split('T')[0]);
  const [satuanKemasan, setSatuanKemasan] = useState('kg');
  const [jumlahKemasan, setJumlahKemasan] = useState('');
  const [hargaPerKemasan, setHargaPerKemasan] = useState('');
  const [stokMinBaru, setStokMinBaru] = useState('');
  const [supplier, setSupplier] = useState('');
  const [catatan, setCatatan] = useState('');

  // UI Feedback
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: '' }

  // Faktor Pengali Konversi Kemasan (Standardisasi Base Unit: kg)
  const getFaktorPengali = (satuan) => {
    if (satuan === 'sak (50kg)') return 50.0;
    if (satuan === 'ton') return 1000.0;
    return 1.0;
  };

  // Kalkulasi Otomatis Total Harga
  const faktor = getFaktorPengali(satuanKemasan);
  const totalKg = Number(jumlahKemasan || 0) * faktor;
  const totalHarga = Number(jumlahKemasan || 0) * Number(hargaPerKemasan || 0);

  // Filter List Katalog Kiri
  const filteredKatalog = katalog.filter(item => {
    const matchesSearch = 
      item.nama_pupuk?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kategori?.nama_unsur?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesJenis = filterJenis === 'ALL' || item.kategori?.jenis === filterJenis;
    const matchesSubsidi = filterSubsidi === 'ALL' || item.status_subsidi === filterSubsidi;

    return matchesSearch && matchesJenis && matchesSubsidi;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPupuk) {
      setFeedback({ type: 'error', message: 'Silakan pilih pupuk dari katalog sebelah kiri terlebih dahulu!' });
      return;
    }
    if (!jumlahKemasan || Number(jumlahKemasan) <= 0) {
      setFeedback({ type: 'error', message: 'Jumlah pembelian harus lebih besar dari 0!' });
      return;
    }
    if (!hargaPerKemasan || Number(hargaPerKemasan) < 0) {
      setFeedback({ type: 'error', message: 'Harga satuan harus valid!' });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      await createTransaksiBeli({
        pupuk_id: selectedPupuk.id,
        tanggal_beli: tanggalBeli,
        jumlah_kemasan: Number(jumlahKemasan),
        satuan_kemasan: satuanKemasan,
        faktor_pengali: faktor,
        harga_per_kemasan: Number(hargaPerKemasan),
        update_stok_minimum: stokMinBaru ? Number(stokMinBaru) : null,
        supplier: supplier || null,
        catatan: catatan || null,
      });

      setFeedback({
        type: 'success',
        message: `Berhasil mencatat restock! Stok ${selectedPupuk.nama_lengkap} bertambah ${totalKg.toLocaleString('id-ID')} kg dan HPP WAC telah diperbarui otomatis.`
      });

      // Reset form input
      setJumlahKemasan('');
      setHargaPerKemasan('');
      setStokMinBaru('');
      setSupplier('');
      setCatatan('');

      // Refresh data global
      onRefresh();
    } catch (err) {
      console.error('Error transaksi beli:', err);
      setFeedback({
        type: 'error',
        message: err.message || 'Gagal menyimpan transaksi pembelian ke Supabase.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
  };

  return (
    <div className="space-y-6">
      {/* Pengantar Layar Beli */}
      <div className="bg-white/60 backdrop-blur-md border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <p className="text-xs text-slate-600">
          Pilih pupuk dari panel <strong>Katalog Pupuk</strong> di sisi kiri, lalu isi rincian kuantitas dan harga pada <strong>Formulir Pembelian</strong> di sisi kanan.
        </p>
        <button
          onClick={() => onNavigate('riwayat-beli')}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition"
        >
          Lihat Riwayat Pembelian &rarr;
        </button>
      </div>

      {feedback && (
        <div className={`p-4 rounded-2xl text-xs font-medium flex items-center gap-3 border shadow-sm ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" /> : <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* TATA LETAK DUA KOLOM SESUAI FIGMA (DESKTOP - 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ============================================================== */}
        {/* PANEL KIRI: KATALOG PUPUK (5 Kolom Grid)                       */}
        {/* ============================================================== */}
        <div className="lg:col-span-5 bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">KATALOG PUPUK</h3>
              <p className="text-[11px] text-slate-400">Pilih pupuk yang ingin Anda restock</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-lg">
              {filteredKatalog.length} Item
            </span>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Cari pupuk atau unsur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/90 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
            />
          </div>

          {/* Penyempurnaan Filter Cascading Ringkas */}
          <div className="space-y-2 pt-1">
            <div className="flex gap-1.5 overflow-x-auto text-[11px]">
              <span className="text-slate-400 text-[10px] uppercase font-bold py-1">Jenis:</span>
              {['ALL', 'Tunggal', 'Majemuk'].map((j) => (
                <button
                  key={j}
                  type="button"
                  onClick={() => setFilterJenis(j)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    filterJenis === j ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {j === 'ALL' ? 'Semua' : j}
                </button>
              ))}
            </div>

            <div className="flex gap-1.5 overflow-x-auto text-[11px]">
              <span className="text-slate-400 text-[10px] uppercase font-bold py-1">Status:</span>
              {['ALL', 'Subsidi', 'Non Subsidi'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFilterSubsidi(s)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    filterSubsidi === s ? 'bg-emerald-700 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s === 'ALL' ? 'Semua' : s}
                </button>
              ))}
            </div>
          </div>

          {/* Daftar Kartu Pupuk (Liquid Glass Cards) */}
          <div className="max-h-[520px] overflow-y-auto space-y-2.5 pr-1">
            {filteredKatalog.map((item) => {
              const isSelected = selectedPupuk?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedPupuk(item)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-emerald-50/90 border-emerald-500 shadow-md ring-1 ring-emerald-500'
                      : 'bg-white/60 hover:bg-white border-slate-200/80 shadow-xs'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">
                        {item.nama_pupuk}
                      </h4>
                      <p className="text-xs text-slate-600 font-medium">
                        Kandungan: {item.kategori?.nama_unsur} ({item.kategori?.kode_unsur})
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.status_subsidi === 'Subsidi' ? 'bg-sky-100 text-sky-800 border border-sky-200' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {item.status_subsidi}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-2 line-clamp-1">
                    Bentuk: {item.bentuk} • Satuan dasar: {item.satuan_standar}
                  </p>

                  {isSelected && (
                    <div className="absolute right-3 bottom-3 text-emerald-600 flex items-center gap-1 text-[11px] font-bold">
                      <CheckCircle2 className="w-4 h-4" /> Terpilih
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ============================================================== */}
        {/* PANEL KANAN: FORMULIR PEMBELIAN (7 Kolom Grid)                */}
        {/* ============================================================== */}
        <div className="lg:col-span-7 bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-sm">
          <div className="pb-4 mb-5 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">Formulir Rincian Pembelian</h3>
            <p className="text-xs text-slate-500">
              Mencatat stok masuk. Sistem otomatis mengonversi satuan dan menghitung Weighted Average Cost (WAC).
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Highlight Pupuk Terpilih */}
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-emerald-600 text-white rounded-lg">
                  <Package className="w-5 h-5" />
                </span>
                <div>
                  <p className="text-[11px] font-bold uppercase text-emerald-800 tracking-wider">Pupuk yang Dipilih</p>
                  <p className="text-sm font-extrabold text-slate-900">{selectedPupuk?.nama_lengkap || 'Belum dipilih'}</p>
                </div>
              </div>
              <span className="text-xs text-slate-500 font-medium">Bentuk: {selectedPupuk?.bentuk || '-'}</span>
            </div>

            {/* Grid 1: Tanggal & Setting Stok Minimum */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tanggal Pembelian
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={tanggalBeli}
                    onChange={(e) => setTanggalBeli(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white/90 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Setting Stok Minimum (Alert Threshold)
                </label>
                <input
                  type="number"
                  placeholder="Misal: 50 (Opsional)"
                  value={stokMinBaru}
                  onChange={(e) => setStokMinBaru(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/90 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">Batas minimum untuk memicu alert peringatan.</p>
              </div>
            </div>

            {/* Grid 2: Satuan Kemasan, Jumlah (Qty), & Harga Persatuan */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Pilihan Satuan
                </label>
                <select
                  value={satuanKemasan}
                  onChange={(e) => setSatuanKemasan(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/90 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                >
                  <option value="kg">Kilogram (kg)</option>
                  <option value="sak (50kg)">Sak / Karung (50 kg)</option>
                  <option value="ton">Ton (1.000 kg)</option>
                  <option value="liter">Liter (Pupuk Cair)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Jumlah (Qty)
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  placeholder="Contoh: 10"
                  value={jumlahKemasan}
                  onChange={(e) => setJumlahKemasan(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/90 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  required
                />
                {jumlahKemasan && satuanKemasan !== 'kg' && (
                  <p className="text-[11px] text-emerald-700 font-bold mt-1">
                    &approx; {totalKg.toLocaleString('id-ID')} kg fisik
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Harga Persatuan (Rp)
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="Contoh: 115000"
                  value={hargaPerKemasan}
                  onChange={(e) => setHargaPerKemasan(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/90 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  required
                />
              </div>
            </div>

            {/* Grid 3: Supplier & Catatan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Supplier / Distributor (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Misal: PT Petrokimia Gresik Official"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/90 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Catatan Pengadaan
                </label>
                <input
                  type="text"
                  placeholder="Misal: Alokasi RDKK Tahap II"
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/90 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Total Harga Pembelian (Auto-Calculation Card) */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between shadow-md">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Harga Pembelian</p>
                <p className="text-2xl font-extrabold text-emerald-400 mt-0.5 tracking-tight font-mono">
                  {formatRupiah(totalHarga)}
                </p>
              </div>
              <div className="text-right text-[11px] text-slate-400">
                <p>{Number(jumlahKemasan || 0)} {satuanKemasan}</p>
                <p>@ {formatRupiah(hargaPerKemasan)}</p>
              </div>
            </div>

            {/* Tombol Simpan Transaksi */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-700/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{submitting ? 'Menyimpan ke Cloud Supabase...' : 'Simpan Transaksi Pembelian'}</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
