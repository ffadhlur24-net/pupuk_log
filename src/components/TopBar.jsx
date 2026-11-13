import React, { useState } from 'react';
import { Bell, User, RefreshCw, AlertTriangle } from 'lucide-react';

export default function TopBar({ title, criticalItems, onRefresh, loading, onSelectMenu }) {
  const [showNotification, setShowNotification] = useState(false);

  return (
    <header className="h-20 bg-white/60 backdrop-blur-md border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Judul Layar Aktif (Sesuai Desain Figma: DASHBOARD PUPUK, BELI PUPUK, dll) */}
      <div>
        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 uppercase">
          {title}
        </h2>
        <p className="text-xs text-slate-500 font-medium">Sistem Monitoring & Inventaris Pupuk Pertanian</p>
      </div>

      {/* Sisi Kanan: Lonceng Notifikasi Alert + Profil ADMIN KEBUN */}
      <div className="flex items-center gap-4">
        {/* Tombol Refresh Data Cloud */}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-white/80 border border-slate-200/60 shadow-sm transition disabled:opacity-50"
          title="Sinkronisasi Data Supabase Cloud"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>

        {/* Lonceng Notifikasi */}
        <div className="relative">
          <button
            onClick={() => setShowNotification(!showNotification)}
            className="p-2.5 rounded-xl bg-white/80 hover:bg-white border border-slate-200/80 shadow-sm text-slate-700 transition relative"
            title="Peringatan Stok Gudang"
          >
            <Bell className="w-5 h-5" />
            {criticalItems.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse shadow-sm">
                {criticalItems.length}
              </span>
            )}
          </button>

          {/* Popover Notifikasi Alert */}
          {showNotification && (
            <div className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl p-4 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" /> Peringatan Stok Gudang
                </h4>
                <span className="text-[11px] font-semibold text-slate-400">{criticalItems.length} Item</span>
              </div>

              <div className="mt-2 max-h-60 overflow-y-auto space-y-2 divide-y divide-slate-50">
                {criticalItems.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">Seluruh stok pupuk dalam batas aman 👍</p>
                ) : (
                  criticalItems.map((item) => (
                    <div key={item.id} className="pt-2 text-xs flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-slate-800">{item.pupuk?.nama_pupuk}</p>
                        <p className="text-[11px] text-slate-400">
                          Sisa: <strong className="text-rose-600">{item.jumlah_stok} {item.satuan}</strong> (Min: {item.stok_minimum} {item.satuan})
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.status_stok === 'Habis' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.status_stok}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {criticalItems.length > 0 && (
                <button
                  onClick={() => {
                    setShowNotification(false);
                    onSelectMenu('beli');
                  }}
                  className="w-full mt-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                >
                  Restock Sekarang (Beli Pupuk)
                </button>
              )}
            </div>
          )}
        </div>

        {/* Profil Single Role: ADMIN KEBUN (Sesuai Desain Figma) */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200/80">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            <User className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-900">ADMIN KEBUN</p>
            <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Akses Manajer
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
