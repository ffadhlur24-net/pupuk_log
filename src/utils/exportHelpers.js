import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * ==============================================================================
 * EXPORT HELPERS: SIM PUPUK
 * Utilitas untuk mengunduh laporan ke format Excel (.xlsx) dan Dokumen PDF (.pdf)
 * Sesuai spesifikasi tugas akhir SIM Kelompok 3
 * ==============================================================================
 */

// 1. Ekspor Data Lengkap ke Excel (.xlsx) dengan 3 Sheet
export const exportToExcel = ({ stok, riwayatBeli, riwayatPakai, rekapLahan }) => {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Stok Fisik Gudang
  const stokRows = stok.map((s, idx) => ({
    No: idx + 1,
    'Nama Pupuk': s.pupuk?.nama_pupuk || '-',
    Kandungan: s.pupuk?.kategori?.nama_unsur || '-',
    Kategori: s.pupuk?.kategori?.jenis || '-',
    'Status Subsidi': s.pupuk?.status_subsidi || '-',
    'Jumlah Stok Fisik': Number(s.jumlah_stok || 0),
    Satuan: s.satuan || 'kg',
    'Ambang Batas Minimum': Number(s.stok_minimum || 0),
    'HPP Rata-rata (WAC)': Number(s.harga_rata_rata_per_kg || 0),
    'Status Stok': s.status_stok || 'Aman',
    'Lokasi Gudang': s.lokasi_gudang || 'Gudang Utama'
  }));
  const wsStok = XLSX.utils.json_to_sheet(stokRows);
  XLSX.utils.book_append_sheet(wb, wsStok, 'Inventaris Gudang');

  // Sheet 2: Riwayat Transaksi Beli (Restock)
  const beliRows = riwayatBeli.map((b, idx) => ({
    No: idx + 1,
    'No Transaksi': b.no_transaksi,
    Tanggal: b.tanggal_beli,
    'Nama Pupuk': b.pupuk?.nama_lengkap || '-',
    'Jumlah Input': Number(b.jumlah_kemasan || 0),
    Kemasan: b.satuan_kemasan || 'kg',
    'Total Fisik (kg)': Number(b.jumlah_kg || 0),
    'Harga Satuan (Rp)': Number(b.harga_per_kemasan || 0),
    'Total Biaya (Rp)': Number(b.total_harga || 0),
    Supplier: b.supplier || '-',
    Catatan: b.catatan || '-'
  }));
  const wsBeli = XLSX.utils.json_to_sheet(beliRows);
  XLSX.utils.book_append_sheet(wb, wsBeli, 'Riwayat Pembelian');

  // Sheet 3: Riwayat Pemakaian Lahan
  const pakaiRows = riwayatPakai.map((p, idx) => ({
    No: idx + 1,
    'No Pemakaian': p.no_pemakaian,
    Tanggal: p.tanggal_pemupukan,
    'Lahan / Blok': p.nama_lahan,
    'Luas (Ha)': p.luas_lahan_ha ? Number(p.luas_lahan_ha) : '-',
    'Komoditas Tanaman': p.jenis_tanaman,
    'Pupuk Digunakan': p.pupuk?.nama_lengkap || '-',
    'Jumlah Pakai (kg)': Number(p.jumlah_pakai_kg || 0),
    'Biaya Satuan WAC': Number(p.biaya_per_kg || 0),
    'Total Biaya (Rp)': Number(p.total_biaya || 0),
    'Rasio Biaya/Ha (Rp)': p.biaya_per_ha ? Number(p.biaya_per_ha) : '-',
    'Keterangan Lapangan': p.keterangan || '-'
  }));
  const wsPakai = XLSX.utils.json_to_sheet(pakaiRows);
  XLSX.utils.book_append_sheet(wb, wsPakai, 'Riwayat Pemakaian');

  // Unduh File Excel
  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `Laporan_SIM_PupukLog_${dateStr}.xlsx`);
};

// 2. Ekspor Dokumen Laporan Formal ke PDF Siap Cetak
export const exportToPdf = ({ stok, riwayatBeli, riwayatPakai, rekapLahan }) => {
  const doc = new jsPDF('p', 'pt', 'a4');
  const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  // Kop Laporan Resmi
  doc.setFontSize(18);
  doc.setTextColor(21, 128, 61); // Emerald 700
  doc.text('PupukLog — Sistem Informasi Manajemen Inventaris Pupuk', 40, 50);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text('Laporan Rekapitulasi Inventaris, Distribusi Lahan, & Efisiensi Biaya Pupuk', 40, 68);
  doc.text(`Dicetak pada: ${dateStr} | Otorisasi: ADMIN KEBUN`, 40, 82);

  doc.setLineWidth(1);
  doc.setDrawColor(226, 232, 240);
  doc.line(40, 95, 555, 95);

  let currentY = 115;

  // Bagian 1: Ringkasan Analisis Efisiensi Lahan (Rp / Ha)
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text('1. Rekapitulasi Efisiensi Biaya per Hektar Lahan', 40, currentY);

  const lahanTableBody = rekapLahan.map((l, idx) => [
    idx + 1,
    l.nama_lahan,
    l.jenis_tanaman,
    l.luas_lahan_ha ? `${l.luas_lahan_ha} Ha` : '-',
    `${Number(l.total_pupuk_terpakai_kg || 0).toLocaleString('id-ID')} kg`,
    `Rp ${Number(l.total_biaya || 0).toLocaleString('id-ID')}`,
    l.rata_rata_biaya_per_ha ? `Rp ${Number(l.rata_rata_biaya_per_ha).toLocaleString('id-ID')}` : '-'
  ]);

  autoTable(doc, {
    startY: currentY + 10,
    head: [['No', 'Nama Lahan', 'Tanaman', 'Luas', 'Total Pupuk', 'Total Biaya', 'Rasio Biaya / Ha']],
    body: lahanTableBody,
    theme: 'grid',
    headStyles: { fillColor: [21, 128, 61], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 4 },
    margin: { left: 40, right: 40 }
  });

  currentY = doc.lastAutoTable.finalY + 30;

  // Bagian 2: Status Persediaan Fisik Gudang & Ambang Batas
  doc.setFontSize(13);
  doc.text('2. Status Persediaan Gudang & Peringatan Ambang Batas', 40, currentY);

  const stokTableBody = stok.map((s, idx) => [
    idx + 1,
    s.pupuk?.nama_pupuk || '-',
    s.pupuk?.kategori?.nama_unsur || '-',
    s.pupuk?.status_subsidi || '-',
    `${Number(s.jumlah_stok || 0).toLocaleString('id-ID')} ${s.satuan}`,
    `${Number(s.stok_minimum || 0).toLocaleString('id-ID')} ${s.satuan}`,
    s.status_stok || 'Aman'
  ]);

  autoTable(doc, {
    startY: currentY + 10,
    head: [['No', 'Nama Pupuk', 'Kandungan', 'Subsidi', 'Stok Riil', 'Batas Min', 'Status']],
    body: stokTableBody,
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 4 },
    margin: { left: 40, right: 40 }
  });

  // Tanda Tangan Verifikasi di Halaman Bawah
  const finalY = doc.lastAutoTable.finalY + 45;
  if (finalY < 750) {
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text('Disiapkan oleh:', 40, finalY);
    doc.text('Admin Inventaris Kebun', 40, finalY + 40);

    doc.text('Mengetahui & Menyetujui:', 400, finalY);
    doc.text('Manajer Pengelolaan Lahan Pertanian', 400, finalY + 40);
  }

  // Simpan Berkas PDF
  doc.save(`Laporan_Resmi_SIM_PupukLog_${new Date().toISOString().split('T')[0]}.pdf`);
};
