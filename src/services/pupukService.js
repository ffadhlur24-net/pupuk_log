import { supabase } from '../lib/supabase';

/**
 * ==============================================================================
 * SERVICE LAYER: SIM PUPUK
 * Kumpulan fungsi komunikasi frontend ke database Supabase
 * Sesuai dokumen SYSTEM_REQUIREMENTS_SPEC.md
 * ==============================================================================
 */

// 1. Mengambil Seluruh Katalog Pupuk (Hierarki Kategori & Produk)
export const getCatalogPupuk = async () => {
  const { data, error } = await supabase
    .from('master_pupuk')
    .select(`
      id,
      nama_pupuk,
      status_subsidi,
      nama_lengkap,
      bentuk,
      satuan_standar,
      deskripsi,
      kategori:kategori_pupuk (
        id,
        jenis,
        kode_unsur,
        nama_unsur,
        deskripsi
      )
    `)
    .order('nama_pupuk', { ascending: true });

  if (error) throw error;
  return data;
};

// 2. Mengambil Seluruh Kategori Pupuk (Level 1 - 3)
export const getKategoriList = async () => {
  const { data, error } = await supabase
    .from('kategori_pupuk')
    .select('*')
    .order('jenis', { ascending: true });

  if (error) throw error;
  return data;
};

// 3. Mengambil Stok Fisik Gudang & Status Peringatan Ambang Batas
export const getStokGudang = async () => {
  const { data, error } = await supabase
    .from('stok_gudang')
    .select(`
      id,
      jumlah_stok,
      stok_minimum,
      satuan,
      harga_rata_rata_per_kg,
      lokasi_gudang,
      status_stok,
      updated_at,
      pupuk:master_pupuk (
        id,
        nama_pupuk,
        status_subsidi,
        nama_lengkap,
        bentuk,
        kategori:kategori_pupuk (
          jenis,
          kode_unsur,
          nama_unsur
        )
      )
    `)
    .order('jumlah_stok', { ascending: true }); // Mengutamakan stok yang sedikit/kritis di atas

  if (error) throw error;
  return data;
};

// 4. Mengambil Pupuk yang Tersedia Saja (Stok > 0) untuk Form Pemakaian Lahan
export const getPupukTersedia = async () => {
  const { data, error } = await supabase
    .from('stok_gudang')
    .select(`
      id,
      jumlah_stok,
      satuan,
      harga_rata_rata_per_kg,
      pupuk:master_pupuk (
        id,
        nama_pupuk,
        status_subsidi,
        nama_lengkap
      )
    `)
    .gt('jumlah_stok', 0)
    .order('jumlah_stok', { ascending: false });

  if (error) throw error;
  return data;
};

// 5. Input Transaksi Pembelian Pupuk (Restock Masuk)
// Otomatis men-trigger penambahan stok dan perhitungan HPP WAC di backend
export const createTransaksiBeli = async (pembelianData) => {
  const { data, error } = await supabase
    .from('transaksi_beli')
    .insert([
      {
        no_transaksi: pembelianData.no_transaksi || `TB-${Date.now().toString().slice(-8)}`,
        pupuk_id: pembelianData.pupuk_id,
        tanggal_beli: pembelianData.tanggal_beli || new Date().toISOString().split('T')[0],
        jumlah_kemasan: Number(pembelianData.jumlah_kemasan),
        satuan_kemasan: pembelianData.satuan_kemasan || 'kg',
        faktor_pengali: Number(pembelianData.faktor_pengali || 1),
        harga_per_kemasan: Number(pembelianData.harga_per_kemasan),
        update_stok_minimum: pembelianData.update_stok_minimum ? Number(pembelianData.update_stok_minimum) : null,
        supplier: pembelianData.supplier || null,
        catatan: pembelianData.catatan || null
      }
    ])
    .select();

  if (error) throw error;
  return data;
};

// 6. Input Transaksi Pemakaian Pupuk di Lahan
// Otomatis men-trigger validasi defisit stok, pemotongan stok gudang, dan rasio biaya per Ha
export const createPemakaianPupuk = async (pemakaianData) => {
  const { data, error } = await supabase
    .from('pemakaian_pupuk')
    .insert([
      {
        no_pemakaian: pemakaianData.no_pemakaian || `PK-${Date.now().toString().slice(-8)}`,
        pupuk_id: pemakaianData.pupuk_id,
        tanggal_pemupukan: pemakaianData.tanggal_pemupukan || new Date().toISOString().split('T')[0],
        nama_lahan: pemakaianData.nama_lahan,
        luas_lahan_ha: pemakaianData.luas_lahan_ha ? Number(pemakaianData.luas_lahan_ha) : null,
        jenis_tanaman: pemakaianData.jenis_tanaman,
        jumlah_pakai_kg: Number(pemakaianData.jumlah_pakai_kg),
        keterangan: pemakaianData.keterangan || null
      }
    ])
    .select();

  if (error) throw error;
  return data;
};

// 7. Mengambil Riwayat Pembelian Pupuk
export const getRiwayatBeli = async () => {
  const { data, error } = await supabase
    .from('transaksi_beli')
    .select(`
      id,
      no_transaksi,
      tanggal_beli,
      jumlah_kemasan,
      satuan_kemasan,
      faktor_pengali,
      jumlah_kg,
      harga_per_kemasan,
      total_harga,
      supplier,
      catatan,
      alasan_koreksi,
      created_at,
      pupuk:master_pupuk (
        id,
        nama_pupuk,
        status_subsidi,
        nama_lengkap
      )
    `)
    .order('tanggal_beli', { ascending: false });

  if (error) throw error;
  return data;
};

// 8. Mengambil Riwayat Pemakaian Pupuk di Lahan
export const getRiwayatPemakaian = async () => {
  const { data, error } = await supabase
    .from('pemakaian_pupuk')
    .select(`
      id,
      no_pemakaian,
      tanggal_pemupukan,
      nama_lahan,
      luas_lahan_ha,
      jenis_tanaman,
      jumlah_pakai_kg,
      biaya_per_kg,
      total_biaya,
      biaya_per_ha,
      keterangan,
      alasan_koreksi,
      created_at,
      pupuk:master_pupuk (
        id,
        nama_pupuk,
        status_subsidi,
        nama_lengkap
      )
    `)
    .order('tanggal_pemupukan', { ascending: false });

  if (error) throw error;
  return data;
};

// 9. Mengambil Rekapitulasi Analisis Efisiensi Lahan (View Database)
export const getRekapAnalisisLahan = async () => {
  const { data, error } = await supabase
    .from('v_analisis_lahan')
    .select('*')
    .order('total_biaya', { ascending: false });

  if (error) throw error;
  return data;
};

// 10. Update / Koreksi Transaksi Beli (Safety Guard Active di Database)
export const updateTransaksiBeli = async (id, updatedFields, alasanKoreksi) => {
  const { data, error } = await supabase
    .from('transaksi_beli')
    .update({
      ...updatedFields,
      alasan_koreksi: alasanKoreksi,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select();

  if (error) throw error;
  return data;
};

// 11. Update / Koreksi Transaksi Pemakaian Lahan
export const updatePemakaianPupuk = async (id, updatedFields, alasanKoreksi) => {
  const { data, error } = await supabase
    .from('pemakaian_pupuk')
    .update({
      ...updatedFields,
      alasan_koreksi: alasanKoreksi,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select();

  if (error) throw error;
  return data;
};

