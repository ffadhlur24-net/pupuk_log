import React, { useState } from 'react';
import { Search, Edit3, Sprout, Calendar, ArrowRight } from 'lucide-react';
import ModalEditTransaksi from './ModalEditTransaksi';

export default function RiwayatPakaiView({ riwayatPakai, onRefresh, onNavigate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItemForEdit, setSelectedItemForEdit] = useState(null);

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
  };

  const filtered = riwayatPakai.filter(item => {
    return (
      item.no_pemakaian?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nama_lahan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.jenis_tanaman?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.pupuk?.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Pengantar & Aksi Cepat */}
      <div className="bg-white/60 backdrop-blur-md border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sprout className="w-4 h-4 text-emerald-700" /> Riwayat Pemakaian Pupuk di Lahan (Distribusi Lapangan)
          </h3>
          <p className="text-xs text-slate-500">Mencatat aplikasi pupuk per lahan, varietas komoditas, catatan cuaca, dan efisiensi biaya per hektar.</p>
        </div>
        <button
          onClick={() => onNavigate('pemakaian')}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
        >
          <Sprout className="w-4 h-4" /> + Catat Pemakaian Baru
        </button>
      </div>

      {/* Tabel Riwayat Pemakaian (Sesuai Desain Figma Desktop - 6) */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200/60 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 bg-white/40">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Cari lahan, tanaman, pupuk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/90 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
            />
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-slate-100 rounded-lg text-slate-600 self-end md:self-auto">
            {filtered.length} Pemupukan Tercatat
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100/70 text-slate-600 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200/60">
              <tr>
                <th className="py-3.5 px-6">NO PEMAKAIAN & TANGGAL</th>
                <th className="py-3.5 px-4">LAHAN & LUAS</th>
                <th className="py-3.5 px-4">KOMODITAS TANAMAN</th>
                <th className="py-3.5 px-4">PUPUK YANG DIPAKAI</th>
                <th className="py-3.5 px-4 text-right">JUMLAH (KG)</th>
                <th className="py-3.5 px-6 text-right">BIAYA PER HEKTAR</th>
                <th className="py-3.5 px-4">CATATAN CUACA / UMUR</th>
                <th className="py-3.5 px-4 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400 text-xs">
                    Belum ada riwayat pemakaian pupuk yang tercatat.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-white/60 transition">
                    <td className="py-4 px-6">
                      <p className="font-mono font-bold text-slate-900 text-xs">{item.no_pemakaian}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {item.tanggal_pemupukan}
                      </p>
                    </td>

                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-900">{item.nama_lahan}</p>
                      <p className="text-xs text-slate-500 font-medium">
                        {item.luas_lahan_ha ? `${item.luas_lahan_ha} Ha` : <span className="text-slate-400 italic">Non-lahan</span>}
                      </p>
                    </td>

                    <td className="py-4 px-4 text-xs font-semibold text-slate-700">
                      {item.jenis_tanaman}
                    </td>

                    <td className="py-4 px-4 font-semibold text-slate-800 text-xs">
                      {item.pupuk?.nama_lengkap}
                    </td>

                    <td className="py-4 px-4 text-right font-extrabold text-slate-900">
                      {Number(item.jumlah_pakai_kg).toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-500">kg</span>
                    </td>

                    <td className="py-4 px-6 text-right font-mono font-bold text-emerald-800 text-xs">
                      {item.biaya_per_ha ? (
                        formatRupiah(item.biaya_per_ha)
                      ) : (
                        <span className="text-slate-400 font-normal italic">-</span>
                      )}
                      <p className="text-[10px] text-slate-400 font-normal">
                        Total: {formatRupiah(item.total_biaya)}
                      </p>
                    </td>

                    <td className="py-4 px-4 text-xs text-slate-500 max-w-xs">
                      <p className="line-clamp-2">{item.keterangan || '-'}</p>
                      {item.alasan_koreksi && (
                        <p className="text-[10px] text-amber-700 bg-amber-50 p-1 rounded border border-amber-200 mt-1">
                          Koreksi: {item.alasan_koreksi}
                        </p>
                      )}
                    </td>

                    {/* Tombol Aksi */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => setSelectedItemForEdit(item)}
                        className="p-2 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200/60 shadow-xs transition"
                        title="Koreksi / Edit Data Pemakaian"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edit Transaksi */}
      <ModalEditTransaksi
        isOpen={Boolean(selectedItemForEdit)}
        onClose={() => setSelectedItemForEdit(null)}
        data={selectedItemForEdit}
        type="pemakaian"
        onRefresh={onRefresh}
      />
    </div>
  );
}
