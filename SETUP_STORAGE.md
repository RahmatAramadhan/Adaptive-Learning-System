# Setup Laravel Storage Symlink

## Masalah
Gambar yang diupload tidak muncul karena Laravel storage symlink belum dibuat.

## Solusi

### Option 1: Via Artisan Command (Recommended)
```bash
cd lms-backend
php artisan storage:link
```

Ini akan membuat symlink dari `public/storage` ke `storage/app/public`.

### Option 2: Manual (Windows - PowerShell as Admin)
```powershell
cd lms-backend/public
New-Item -ItemType SymbolicLink -Name "storage" -Target "..\storage\app\public"
```

### Option 3: Manual (Linux/Mac)
```bash
cd lms-backend
ln -s storage/app/public public/storage
```

## Verifikasi

Setelah membuat symlink, cek folder `lms-backend/public/`:
- Harus ada folder/shortcut bernama `storage`
- Gambar yang diupload akan tersimpan di `lms-backend/storage/app/public/uploads/images/`
- URL akan accessible di `http://localhost:8000/storage/uploads/images/filename.jpg`

## Testing Upload

1. Login sebagai guru
2. Klik "Buat Kursus Baru"
3. Upload gambar cover
4. Pastikan gambar muncul di preview
5. Simpan kursus
6. Cek dashboard - gambar seharusnya muncul
