# GitHub Actions Crawler — Migrasi dari VPS

## Alasan Migrasi

Crawler `scripts/download-all-pdfs.mjs` (`npm run sync-pdfs`) mengambil PDF BIMA, Hiliriset, BRIN dan menyimpan ke `public/pdfs/{bima,hiliriset,brin}/*.pdf` (gitignored, 140 PDF ~79 MB).

Di VPS Linux `ns21` (`/var/www/WP/fast`) crawler gagal khusus BRIN:

```
BRIN fetch error: Connect Timeout Error (103.144.45.95:443, timeout 10000ms)
curl: Trying 103.144.45.95:443... Connection timed out
nc -vz 103.144.45.95 443 → timeout
DNS resolve OK (103.144.45.95), Hiliriset Skipped:15 OK, GitHub/Google OK
```

Kesimpulan: routing/IP VPS diblokir WAF BRIN (`pendanaan-risnov.brin.go.id`), bukan bug kode. Di local Windows & GitHub Actions runner koneksi OK.

Solusi: pindahkan eksekusi crawler ke **GitHub Actions runner** (`ubuntu-latest`, egress tidak diblokir), lalu sync hasil ke VPS via SSH/SCP. VPS tidak lagi menjalankan crawler.

## Arsitektur Baru

```
GitHub Actions Runner (ubuntu-latest, Node 20)
  |-- checkout → npm ci (cache npm)
  |-- npm run sync-pdfs  (BIMA + Hiliriset + BRIN)
  |-- validate: ls -R public/pdfs, count >0
  |-- appleboy/scp-action → public/pdfs/** → /var/www/WP/fast/public/pdfs (additive)
  |-- appleboy/ssh-action → chown www-data, chmod 644, curl POST /api/revalidate
        |
VPS ns21 /var/www/WP/fast/public/pdfs/{bima,brin,hiliriset}/*.pdf
  |-- Next.js serve static /pdfs/*
  |-- ISR /info-dikti revalidate 5m + on-demand via /api/revalidate
```

Additive: file baru ditimpa, file lama di VPS tidak dihapus (`rm: false`, tidak `--delete`). Aman untuk rollback.

## GitHub Secrets

Tambahkan di GitHub: Repo → Settings → Secrets and variables → Actions → New repository secret.

| Secret | Contoh | Wajib | Keterangan |
|--------|--------|-------|------------|
| `VPS_HOST` | `103.xxx.xxx.xxx` atau `ns21.example.com` | ya | IP/domain VPS |
| `VPS_USER` | `dharmo` | ya | user SSH VPS |
| `VPS_SSH_KEY` | `-----BEGIN OPENSSH PRIVATE KEY-----...` | ya | private key ed25519 |
| `VPS_PORT` | `22` | tidak | default 22 |
| `REVALIDATE_SECRET` | sama dengan `.env` VPS `REVALIDATE_SECRET` | tidak | jika kosong, revalidate tetap dicoba tanpa header (non-fatal) |

Cara buat key:

```bash
ssh-keygen -t ed25519 -C "github-crawler" -f ~/.ssh/github_crawler
cat ~/.ssh/github_crawler      # paste ke VPS_SSH_KEY (private)
cat ~/.ssh/github_crawler.pub  # append ke VPS ~/.ssh/authorized_keys
# di VPS:
mkdir -p ~/.ssh && chmod 700 ~/.ssh
cat >> ~/.ssh/authorized_keys  # paste .pub
chmod 600 ~/.ssh/authorized_keys
sudo sshd -t && sudo systemctl reload sshd
```

## Cara Menjalankan Manual

GitHub → Actions → `crawler-sync` → Run workflow → Run workflow.

Otomatis tiap 6 jam via `schedule: 0 */6 * * *` (UTC 00,06,12,18).

Log job menampilkan:

```
BIMA — New: x | Skipped: y | Failed: 0
Hiliriset — New: ...
BRIN — New: ... (retry 3x jika timeout)
pdf count=...
scp ... overwite true
VPS pdfs ...
revalidate OK
```

## Troubleshooting

| Gejala | Penyebab | Fix |
|--------|----------|-----|
| `ReferenceError: File is not defined` | Node 18 + undici | Workflow pakai `node-version: 20`, VPS `v22.22.3` sudah OK. Polyfill `global.File` ada di `download-all-pdfs.mjs` untuk 18. |
| `Connect Timeout 103.144.45.95:443` di GA | GA IP juga diblokir BRIN | Tambah retry 3x 30s + ssl-bypass sudah di `lib/scrapers/brin.ts` & `downloadBrinPdfs`. Jika tetap, cek `curl -v https://pendanaan-risnov.brin.go.id/pendanaan` dari GA log `run` step debug. |
| `scp Permission denied` | `authorized_keys` salah / port salah | Cek `VPS_PORT`, `VPS_USER`, key tanpa passphrase, `ssh -i key -p PORT user@host` manual. Pastikan `target: /var/www/WP/fast/` writable, `chown` di step ssh. |
| `revalidate 404` | `SITE_URL` salah | Workflow tidak pakai `SITE_URL`, langsung `https://fast.unsil.ac.id/api/revalidate`. Jika ganti domain, edit workflow `curl` URL. |
| `pdf count=0` | crawler tidak hasilkan PDF | Cek BIMA `signed-url` 403 atau Hiliriset `data-page` berubah — lihat log `Failed:`. |
| Cron VPS masih jalan | Duplikat sync | Nonaktifkan: `crontab -l | grep -v download-all-pdfs | crontab -` di VPS. Biarkan GA yang sync. |

## Cron VPS Lama

Nonaktifkan setelah migrasi sukses:

```bash
crontab -l  # lihat baris 0 */6 * * * ... download-all-pdfs.mjs
crontab -l | grep -v "download-all-pdfs" | crontab -
crontab -l  # verifikasi hilang
sudo tail -f /var/log/pdf-sync.log  # last run
```

## Testing

1. Push workflow ke `main`, buka Actions → `crawler-sync` → Run workflow
2. Tunggu 2-4 menit, cek log `Validate` `pdf count` >0 dan `Upload` success
3. SSH VPS: `ls -lh /var/www/WP/fast/public/pdfs/brin/ | head` harus ada `...Gelombang_6.pdf` 28 Aug, `chmod 644`
4. Buka `https://fast.unsil.ac.id/info-dikti` — BRIN top item Gel 6 setelah `revalidate` (max 5m ISR)
5. Schedule test: tunggu 6 jam atau ubah cron sementara ke `*/10 * * * *` untuk test

## Potensi Masalah

* GA runner IP sewaktu-waktu bisa diblokir BRIN juga (sama seperti VPS) — mitigasi sudah retry + ssl-bypass, alternatif: self-hosted runner di provider lain.
* Upload 79 MB tiap 6 jam pakai GA minutes & bandwidth — additive hanya kirim file baru/ganti (scp overwrite tetap kirim semua `public/pdfs/**` saat ini; optimasi: `rsync --update` jika perlu, sekarang sengaja full additive untuk simplicity).
* Secret `VPS_SSH_KEY` harus tanpa passphrase; jika pakai passphrase, `appleboy/scp-action` gagal.
* VPS `www-data` vs `dharmo` owner — step `chown` coba `sudo`, fallback ke `$USER`.
* PDF gitignored — `git pull` di VPS tidak hapus PDF (karena ignored, tetap ada). GA upload additive tidak hapus PDF lama VPS — jika ada PDF usang perlu `ssh rm` manual.
