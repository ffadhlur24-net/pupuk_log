import React, { useState } from 'react';
import { Search, Sprout, CheckCircle2, AlertCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { createPemakaianPupuk } from '../services/pupukService';

export default function PemakaianView({ stokTersedia, onRefresh, onNavigate }) {
  // Pupuk Terpilih dari Stok Gudang
  const [selectedPupuk, setSelectedPupuk] = useState(stokTersedia[0] || null);

  // Search Filter Pupuk Tersedia
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [tanggalPakai, setTanggalPakai] = useState(new Date().toISOString().split('T')[0]);
  const [namaLahan, setNamaLahan] = useState('');
  const [luasLahanHa, setLuasLahanHa] = useState('');
  const [jenisTanaman, setJenisTanaman] = useState(''); // Penyempurnaan 1
  const [jumlahPakaiKg, setJumlahPakaiKg] = useState('');
  const [keterangan, setKeterangan] = useState(''); // Penyempurnaan 2 (Cuaca & Umur)

  // Feedback State
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Ketersediaan Stok Item Terpilih
  const stokMaksimal = Number(selectedPupuk?.jumlah_stok || 0);
  const isStokKurang = Number(jumlahPakaiKg || 0) > stokMaksimal;

  // Estimasi Biaya Pemakaian (Jumlah * HPP WAC)
  const hppPerKg = Number(selectedPupuk?.harga_rata_rata_per_kg || 0);
  const estimasiBiaya = Number(jumlahPakaiKg || 0) * hppPerKg;
  const biayaPerHa = luasLahanHa && Number(luasLahanHa) > 0 ? estimasiBiaya / Number(luasLahanHa) : null;

  // Filter List Stok Kiri
  const filteredStok = stokTersedia.filter(item => {
    return (
      item.pupuk?.nama_pupuk?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.pupuk?.status_subsidi?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPupuk) {
      setFeedback({ type: 'error', message: 'Silakan pilih pupuk dari persediaan di sebelah kiri!' });
      return;
    }
    if (!namaLahan.trim()) {
      setFeedback({ type: 'error', message: 'Nama lahan / blok wajib diisi!' });
      return;
    }
    if (!jenisTanaman.trim()) {
      setFeedback({ type: 'error', message: 'Komoditas / jenis tanaman wajib diisi!' });
      return;
    }
    if (!jumlahPakaiKg || Number(jumlahPakaiKg) <= 0) {
      setFeedback({ type: 'error', message: 'Jumlah pemakaian harus lebih besar dari 0 kg!' });
      return;
    }
    if (isStokKurang) {
      setFeedback({ 
        type: 'error', 
        message: `Stok tidak mencukupi! Sisa stok ${selectedPupuk.pupuk?.nama_pupuk} di gudang hanya ${stokMaksimal.toLocaleString('id-ID')} kg.` 
      });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      await createPemakaianPupuk({
        pupuk_id: selectedPupuk.pupuk?.id || selectedPupuk.id,
        tanggal_pemupukan: tanggalPakai,
        nama_lahan: namaLahan,
        luas_lahan_ha: luasLahanHa ? Number(luasLahanHa) : null,
        jenis_tanaman: jenisTanaman,
        jumlah_pakai_kg: Number(jumlahPakaiKg),
        keterangan: keterangan || null,
      });

      setFeedback({
        type: 'success',
        message: `Berhasil mencatat pemupukan di ${namaLahan}! Stok gudang terpotong ${Number(jumlahPakaiKg).toLocaleString('id-ID')} kg dan rasio efisiensi telah dihitung.`
      });

      // Reset form
      setNamaLahan('');
      setLuasLahanHa('');
      setJenisTanaman('');
      setJumlahPakaiKg('');
      setKeterangan('');

      // Refresh data
      onRefresh();
    } catch (err) {
      console.error('Error catat pemakaian:', err);
      setFeedback({
        type: 'error',
        message: err.message || 'Gagal menyimpan data pemakaian ke Supabase.'
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
      <div className="bg-white/60 backdrop-blur-md border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between shadow-sm">
        <p className="text-xs text-slate-600">
          Catat pengeluaran pupuk untuk pemupukan tanaman di blok lahan. Sistem akan memotong stok fisik dan menghitung biaya efisiensi per hektar.
        </p>
        <button
          onClick={() => onNavigate('riwayat-pakai')}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition flex items-center gap-1"
        >
          Lihat Riwayat Pemakaian <ArrowRight className="w-3.5 h-3.5" />
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

      {/* TATA LETAK DUA KOLOM SESUAI FIGMA (DESKTOP - 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ============================================================== */}
        {/* PANEL KIRI: PUPUK TERSEDIA DI GUDANG (5 Kolom Grid)            */}
        {/* ============================================================== */}
        <div className="lg:col-span-5 bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">STOK TERSEDIA</h3>
              <p className="text-[11px] text-slate-400">Pilih pupuk yang ada di gudang untuk dipakai</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-sky-100 text-sky-800 rounded-lg">
              {filteredStok.length} Jenis Tersedia
            </span>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Cari pupuk yang tersedia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/90 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
            />
          </div>

          {/* Daftar Kartu Pupuk Tersedia */}
          <div className="max-h-[500px] overflow-y-auto space-y-2.5 pr-1">
            {filteredStok.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Tidak ada stok pupuk yang tersedia di gudang.
              </div>
            ) : (
              filteredStok.map((item) => {
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
                          {item.pupuk?.nama_pupuk}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium">
                          Tersedia: <strong className="text-slate-900 font-bold">{Number(item.jumlah_stok).toLocaleString('id-ID')} {item.satuan}</strong>
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.pupuk?.status_subsidi === 'Subsidi' ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {item.pupuk?.status_subsidi}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mt-2.5 text-[11px] text-slate-500">
                      <span>HPP WAC: <strong className="font-mono text-slate-700">{formatRupiah(item.harga_rata_rata_per_kg)}/kg</strong></span>
                      {isSelected && (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Terpilih
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* PANEL KANAN: FORMULIR PEMAKAIAN LAHAN (7 Kolom Grid)          */}
        {/* ============================================================== */}
        <div className="lg:col-span-7 bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-sm">
          <div className="pb-4 mb-5 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">Formulir Pemakaian Pupuk di Lahan</h3>
            <p className="text-xs text-slate-500">
              Input data aplikasi pupuk ke tanaman dan kondisi cuaca di lapangan.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Kartu Highlight Pupuk yang Dipakai */}
            <div className="p-3.5 bg-slate-900 text-white rounded-xl flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pupuk yang Digunakan</p>
                <p className="text-sm font-extrabold text-emerald-400">{selectedPupuk?.pupuk?.nama_lengkap || 'Belum dipilih'}</p>
              </div>
              <div className="text-right text-xs">
                <p className="text-slate-400 text-[10px] uppercase font-bold">Stok Gudang</p>
                <p className="font-bold text-white">{stokMaksimal.toLocaleString('id-ID')} {selectedPupuk?.satuan || 'kg'}</p>
              </div>
            </div>

            {/* Baris 1: Tanggal Pemupukan */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tanggal Pemupukan
              </label>
              <input
                type="date"
                value={tanggalPakai}
                onChange={(e) => setTanggalPakai(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/90 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            {/* Baris 2: Nama Lahan / Blok & Luas Lahan (Ha) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nama Lahan / Blok
                </label>
                <input
                  type="text"
                  placeholder="Misal: Blok B - Sawah Utara"
                  value={namaLahan}
                  onChange={(e) => setNamaLahan(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/90 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Luas Lahan (Hektar) <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Misal: 2.5 (Kosongkan jika pot/bibit)"
                  value={luasLahanHa}
                  onChange={(e) => setLuasLahanHa(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/90 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Baris 3: Komoditas Tanaman & Jumlah Pemakaian (kg) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Komoditas / Jenis Tanaman <span className="text-emerald-700 font-semibold">(Wajib)</span>
                </label>
                <input
                  type="text"
                  placeholder="Misal: Padi Inpari 32 / Jagung Hibrida"
                  value={jenisTanaman}
                  onChange={(e) => setJenisTanaman(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/90 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Jumlah Pupuk yang Dipakai (kg)
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.1"
                  placeholder={`Maks: ${stokMaksimal} kg`}
                  value={jumlahPakaiKg}
                  onChange={(e) => setJumlahPakaiKg(e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-white/90 border rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-bold ${
                    isStokKurang ? 'border-rose-500 focus:ring-2 focus:ring-rose-500 bg-rose-50/50' : 'border-slate-200 focus:ring-2 focus:ring-emerald-500'
                  }`}
                  required
                />
                {isStokKurang && (
                  <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Melebihi stok gudang ({stokMaksimal.toLocaleString('id-ID')} kg)!
                  </p>
                )}
              </div>
            </div>

            {/* Baris 4: Textarea Keterangan Kondisi Cuaca & Catatan Lapangan */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Keterangan Lapangan & Kondisi Cuaca
              </label>
              <textarea
                rows={3}
                placeholder="Tuliskan kondisi cuaca saat pemupukan (cerah/hujan), umur tanaman dalam HST/bulan, metode pemupukan (tabur/kocor), dan catatan penting lainnya..."
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/90 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              ></textarea>
            </div>

            {/* Preview Estimasi Biaya & Efisiensi Rasio Per Hektar */}
            <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Estimasi Biaya Pemakaian</p>
                <p className="text-xl font-extrabold text-slate-900 mt-0.5 font-mono">
                  {formatRupiah(estimasiBiaya)}
                </p>
                <p className="text-[10px] text-slate-500">Dihitung otomatis dari HPP WAC @ {formatRupiah(hppPerKg)}/kg</p>
              </div>

              {biayaPerHa ? (
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Biaya per Hektar</p>
                  <p className="text-lg font-extrabold text-emerald-700 font-mono">
                    {formatRupiah(biayaPerHa)} <span className="text-xs font-normal text-slate-600">/ Ha</span>
                  </p>
                  <p className="text-[10px] text-slate-500">Luas: {luasLahanHa} Ha</p>
                </div>
              ) : (
                <div className="text-right text-[11px] text-slate-400 italic">
                  Biaya/Ha tidak dihitung (non-lahan)
                </div>
              )}
            </div>

            {/* Tombol Simpan Pemakaian */}
            <button
              type="submit"
              disabled={submitting || isStokKurang}
              className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-700/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Sprout className="w-4 h-4" />
              <span>{submitting ? 'Memproses Pengeluaran Stok...' : 'Catat Pemakaian Pupuk di Lahan'}</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
