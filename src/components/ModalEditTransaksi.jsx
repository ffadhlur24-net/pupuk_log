import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle2, Save } from 'lucide-react';
import { updateTransaksiBeli, updatePemakaianPupuk } from '../services/pupukService';

export default function ModalEditTransaksi({ isOpen, onClose, data, type, onRefresh }) {
  if (!isOpen || !data) return null;

  const isBeli = type === 'beli';

  // Form State
  const [jumlah, setJumlah] = useState(isBeli ? data.jumlah_kemasan : data.jumlah_pakai_kg);
  const [harga, setHarga] = useState(isBeli ? data.harga_per_kemasan : data.biaya_per_kg);
  const [namaLahan, setNamaLahan] = useState(data.nama_lahan || '');
  const [luasLahanHa, setLuasLahanHa] = useState(data.luas_lahan_ha || '');
  const [jenisTanaman, setJenisTanaman] = useState(data.jenis_tanaman || '');
  const [catatan, setCatatan] = useState(isBeli ? (data.catatan || '') : (data.keterangan || ''));
  const [alasanKoreksi, setAlasanKoreksi] = useState('');

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    if (!alasanKoreksi.trim()) {
      setErrorMsg('Alasan perubahan/koreksi wajib diisi sebagai catatan audit internal!');
      return;
    }
    if (Number(jumlah) <= 0) {
      setErrorMsg('Jumlah harus lebih besar dari 0!');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    try {
      if (isBeli) {
        await updateTransaksiBeli(
          data.id,
          {
            jumlah_kemasan: Number(jumlah),
            harga_per_kemasan: Number(harga),
            catatan: catatan
          },
          alasanKoreksi
        );
      } else {
        await updatePemakaianPupuk(
          data.id,
          {
            nama_lahan: namaLahan,
            luas_lahan_ha: luasLahanHa ? Number(luasLahanHa) : null,
            jenis_tanaman: jenisTanaman,
            jumlah_pakai_kg: Number(jumlah),
            keterangan: catatan
          },
          alasanKoreksi
        );
      }

      onRefresh();
      onClose();
    } catch (err) {
      console.error('Error saat update transaksi:', err);
      setErrorMsg(err.message || 'Gagal menyimpan perubahan. Sistem database menolak pengeditan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-xl border border-white/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        {/* Header Modal */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              Koreksi Riwayat {isBeli ? 'Pembelian' : 'Pemakaian Pupuk'}
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              {isBeli ? data.no_transaksi : data.no_pemakaian} • {data.pupuk?.nama_lengkap}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 mt-4 text-xs">
          {/* Kolom Khusus Pembelian */}
          {isBeli ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Jumlah ({data.satuan_kemasan})
                </label>
                <input
                  type="number"
                  step="any"
                  value={jumlah}
                  onChange={(e) => setJumlah(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Harga Satuan (Rp)
                </label>
                <input
                  type="number"
                  step="any"
                  value={harga}
                  onChange={(e) => setHarga(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  required
                />
              </div>
            </div>
          ) : (
            /* Kolom Khusus Pemakaian */
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Lahan / Blok</label>
                  <input
                    type="text"
                    value={namaLahan}
                    onChange={(e) => setNamaLahan(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Luas Lahan (Ha)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={luasLahanHa}
                    onChange={(e) => setLuasLahanHa(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Komoditas Tanaman</label>
                  <input
                    type="text"
                    value={jenisTanaman}
                    onChange={(e) => setJenisTanaman(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jumlah Pemakaian (kg)</label>
                  <input
                    type="number"
                    step="any"
                    value={jumlah}
                    onChange={(e) => setJumlah(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Catatan Tambahan */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Catatan / Keterangan
            </label>
            <input
              type="text"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Kolom Wajib: Alasan Koreksi */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
            <label className="block font-bold text-amber-900 mb-1">
              Alasan Koreksi / Perubahan Data <span className="text-rose-600">* (Wajib)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Salah input nota nomor 12, atau revisi luas blok lahan..."
              value={alasanKoreksi}
              onChange={(e) => setAlasanKoreksi(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none text-xs"
              required
            ></textarea>
            <p className="text-[10px] text-amber-700 mt-1">
              Safety Guard Aktif: Database akan menolak jika perubahan menyebabkan stok gudang menjadi minus.
            </p>
          </div>

          {/* Tombol Aksi */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Memvalidasi...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
