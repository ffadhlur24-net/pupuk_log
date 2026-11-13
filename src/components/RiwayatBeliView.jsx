import React, { useState } from 'react';
import { Search, Edit3, Receipt, ShoppingCart, Calendar, ArrowRight } from 'lucide-react';
import ModalEditTransaksi from './ModalEditTransaksi';

export default function RiwayatBeliView({ riwayatBeli, onRefresh, onNavigate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItemForEdit, setSelectedItemForEdit] = useState(null);

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
  };

  const filtered = riwayatBeli.filter(item => {
    return (
      item.no_transaksi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.pupuk?.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Pengantar & Aksi Cepat */}
      <div className="bg-white/60 backdrop-blur-md border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-700" /> Riwayat Transaksi Pembelian Pupuk (Restock Masuk)
          </h3>
          <p className="text-xs text-slate-500">Mencatat seluruh pasokan pupuk masuk, konversi kemasan, dan histori audit koreksi.</p>
        </div>
        <button
          onClick={() => onNavigate('beli')}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
        >
          <ShoppingCart className="w-4 h-4" /> + Tambah Pembelian
        </button>
      </div>

      {/* Tabel Riwayat Pembelian (Sesuai Desain Figma Desktop - 5) */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200/60 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 bg-white/40">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Cari nota, pupuk, supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/90 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
            />
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-slate-100 rounded-lg text-slate-600 self-end md:self-auto">
            {filtered.length} Transaksi Tercatat
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100/70 text-slate-600 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200/60">
              <tr>
                <th className="py-3.5 px-6">NO TRANSAKSI & TANGGAL</th>
                <th className="py-3.5 px-4">PUPUK YANG DIBELI</th>
                <th className="py-3.5 px-4">KEMASAN INPUT</th>
                <th className="py-3.5 px-4 text-right">TOTAL FISIK (KG)</th>
                <th className="py-3.5 px-6 text-right">TOTAL HARGA (RP)</th>
                <th className="py-3.5 px-4">SUPPLIER & CATATAN</th>
                <th className="py-3.5 px-4 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400 text-xs">
                    Belum ada riwayat pembelian pupuk yang tercatat.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-white/60 transition">
                    <td className="py-4 px-6">
                      <p className="font-mono font-bold text-slate-900 text-xs">{item.no_transaksi}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {item.tanggal_beli}
                      </p>
                    </td>

                    <td className="py-4 px-4 font-bold text-slate-800">
                      {item.pupuk?.nama_lengkap}
                    </td>

                    <td className="py-4 px-4 text-xs text-slate-600 font-semibold">
                      {Number(item.jumlah_kemasan).toLocaleString('id-ID')} {item.satuan_kemasan}
                      <p className="text-[10px] text-slate-400 font-normal">@ {formatRupiah(item.harga_per_kemasan)}</p>
                    </td>

                    <td className="py-4 px-4 text-right font-extrabold text-slate-900">
                      {Number(item.jumlah_kg).toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-500">kg</span>
                    </td>

                    <td className="py-4 px-6 text-right font-mono font-extrabold text-emerald-700 text-sm">
                      {formatRupiah(item.total_harga)}
                    </td>

                    <td className="py-4 px-4 text-xs text-slate-600">
                      <p className="font-semibold text-slate-800">{item.supplier || '-'}</p>
                      {item.catatan && <p className="text-[11px] text-slate-400 italic mt-0.5">{item.catatan}</p>}
                      {item.alasan_koreksi && (
                        <p className="text-[10px] text-amber-700 bg-amber-50 p-1 rounded border border-amber-200 mt-1">
                          Koreksi: {item.alasan_koreksi}
                        </p>
                      )}
                    </td>

                    {/* Tombol Aksi Nyata (Sesuai Penyempurnaan Analisis) */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => setSelectedItemForEdit(item)}
                        className="p-2 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200/60 shadow-xs transition"
                        title="Koreksi / Edit Transaksi"
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
        type="beli"
        onRefresh={onRefresh}
      />
    </div>
  );
}
