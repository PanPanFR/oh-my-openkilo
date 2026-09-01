# Changelog

Catatan perubahan penting di oh-my-openkilo.

## [0.5.1] - 2026-09-01

### Ditambah
- **Aturan versi di CONTRIBUTING.md.** Perubahan kecil (dokumen, hitungan, contoh) naik patch (`0.5.0` → `0.5.1`). Perubahan besar (hapus plugin/skill/agent, ubah nama command, ubah cara install dependensi) naik minor (`0.5.0` → `0.6.0`). Ragu? Pilih minor.
- **`/configcheck` memperingatkan kalau agentmemory MCP pakai npx.** Selama masih `["npx", "-y", "@agentmemory/mcp"]`, laporan akan minta diganti ke path lokal supaya OpenCode tidak download ulang tiap mulai dan tidak mati saat registry down.
- **Kontrak aman di `/update-pack`.** Awalan command sekarang punya daftar MUST-NOT: tidak boleh ubah `opencode.json`, tidak boleh hapus file user, tidak boleh install npm/Python, tidak boleh ganti model/provider/kunci/MCP server, berhenti kalau `git pull` gagal. Ditambah catatan soal jebakan folder bersarang.
- **Perintah "install ini dulu" di README + install.ps1 + INSTALL.md.** Dulu cuma satu baris, sekarang blok besar di atas: `uv tool install graphifyy` (atau `npm i -g graphify`) + `npm i -g @agentmemory/server` + `@agentmemory/mcp`, lalu `agentmemory serve`. Tujuannya biar user baru lihat sebelum mulai sesi pertama.

### Diubah
- **`examples/opencode.example.json`** dikembalikan ke bentuk npx supaya install pertama langsung jalan. Saran pin lokal ada di dokumentasi dan dicek oleh `/configcheck`.
- **`docs/INSTALL.md`** bagian "Setelah install" ditata ulang: deps dulu, saran pin lokal kedua, ringkasan MCP ketiga. Bagian "apa yang hilang" dan catatan validator env var tetap ada.

## [0.5.0] - 2026-09-01

### Ditambah
- **`plugins/checkpoint.ts`** — jaring pengaman. Setiap `edit`/`write` disimpan diam-diam ke repo git lokal di `~/.cache/opencode/checkpoints/<hash-project>` (maks 500 commit per project). Cara pulih: `git -C ~/.cache/opencode/checkpoints/<hash> checkout <sha> -- <relpath>`. Tidak pernah masuk ke project repo, tidak pernah di-push.
- **`plugins/recall-first.ts`** — gerbang recall satu kali. Memblokir edit pertama di sebuah sesi sampai memory recall jalan (cocok dengan `memory_smart_search` atau `memory_recall` berdasarkan akhiran nama, jadi bare dan ber-prefix MCP tetap kena). Kalau server memory mati, model diminta tetap jalan dan kasih tahu user.

### Diubah
- **Pack disinkronkan dari konfigurasi live maintainer** (sumber: `~/.config/opencode/`). Semua 8 agent, `commands/configcheck.md`, `rules/skill-reminder.md`, dan beberapa plugin/skill mengikuti versi live.
- **3 agent `cavecrew-*` dihapus.** Pack sekarang kirim 8 agent, sama dengan live. Agent-agent itu memang tidak ada di live.
- **Folder `skills/cavecrew/` dan `skills/stitch/` dihapus.** Pack sekarang kirim 46 skill, sama dengan live.
- **`plugins/auto-commit.ts` dihapus.** Diganti alur `/commit` biasa.
- **`plugins/graphify.js` jadi `plugins/graphify.ts`.** Live pindah ke TS, pack ikut.
- **Dokumen publik diperbarui ke 8 agent / 46 skill / 3 rule / 6 plugin / 10 command** di semua file yang tercantum.
- **`examples/opencode.example.json` diperbarui:** path `graphify.ts`, `agentmemory` env `AGENTMEMORY_TOOLS: "core"`, `chrome-devtools` aktif default, MCP pribadi `perplexity`/`tinypuppet` tetap tidak ikut.
- **`AGENTS.md` (root):** hitungan jadi 8 agent / 46 skill, path graphify pribadi disamarkan jadi placeholder.

## [0.4.0] - 2026-08-28

### Diubah
- **File install/update pindah ke folder `scripts/`.** Pemegang repo lama tinggal `git pull`, akan kelihatan file lama terhapus dan yang baru masuk; aman di-commit. Cara pakai tetap sama.
- **`AGENTS.md` (root) ditulis ulang.** Bagian atas jelaskan kalau pack ini turunan Kilo Code (Code/Plan/Ask/Debug/Review) yang diadaptasi ke OpenCode, dan jelaskan kenapa lebih ringan dari pack plugin (file lebih sedikit, lebih kecil, tanpa build step). Hitungan skill dan daftar agent dikoreksi.
- **Agent `cavecrew-*` diturunkan perannya di dokumen publik.** User tidak perlu tahu mereka ada. Jumlah agent publik dari 11 jadi 8. Folder dan perilaku runtime tidak berubah.
- **Bagian "Meet the agents" di README ditulis ulang ala Pantheon.** Tabel ringkas + blok per agent (peran, kapan dipanggil, model default, model rekomendasi, panduan model, alat, siapa yang memanggil, siapa yang dipanggil).
- **`docs/AGENTS.md` ditulis ulang per agent.**
- **CONTRIBUTING.md:** hitungan skill 44 → 46, rule 6 → 7, agent 11 → 8.
- **README:** klaim jumlah plugin dikoreksi (4 → 2 bawaan + 2 npm), tabel skill dikoreksi, kotak TL;DR ditambah di atas, klaim jumlah plugin diperjelas.

### Ditambah
- **`update.ps1` dan `update.sh`** di `scripts/`. Sama seperti `/update-pack` tapi lewat terminal, buat CI/CD atau yang lebih suka command line.
- **Rule dikonsolidasikan 7 → 3.** 4 rule lama (agentmemory, graphify, delegation, workers) dipindah jadi skill yang dimuat sesuai kebutuhan.
- **3 MCP dihapus dari contoh dan dokumen: `supabase-mcp-server`, `stitch`, `remotion`.** Skill-nya tetap ada, tapi tanpa MCP opsionalnya fiturnya terbatas.
- **Hitungan pack diperbaiki di semua dokumen.** File `docs/SKILLS.md` dibangun ulang supaya cocok dengan isi folder yang sebenarnya.
- **Bagian "Updating the pack" di README ditulis ulang** menampilkan dua cara: `/update-pack` dalam sesi, dan one-liner PowerShell/bash.

## [0.3.0] - 2026-08-28

### Ditambah
- **Bagian "Configuration: start from `opencode.example.json`"** di README. File contoh diperlakukan sebagai siap pakai, bukan template kosong; dijelaskan apa yang sudah diatur dan cara ganti placeholder jadi env var asli. Pembuka `docs/CONFIGURATION.md` ditulis ulang dengan nada sama.
- **Petunjuk install per MCP** di README + `docs/CONFIGURATION.md`. Tiap MCP dapat langkah: paket `npm` (kalau ada), env var yang harus di-set, setup satu kali (misal `npx playwright install chromium`), dan apa yang rusak kalau langkah dilewati. Ditambah tabel troubleshooting.

### Diubah
- **Tanda em dash dikurangi di file tulisan maintainer** (117 → 4). Sisanya disengaja buat pemisah tabel. Pakai koma, titik, titik dua, kurung, atau susun ulang kalimat sesuai aturan di `rules/communication-style.md`.
- **Bagian "Why it's lightweight" di README** sekarang pakai perbandingan angka dengan pack plugin (oh-my-openkilo 569 file/2.6 MB vs oh-my-opencode-slim 507 file/58.5 MB, ~23× lebih kecil) dan tabel 8 baris yang menjelaskan artinya "config only" dalam praktik (tanpa build, tanpa runtime di pack, tanpa install deps di luar alat kurasi). Jujur soal batasannya.
- **Asal-usul Kilo Code dimunculkan di atas** "What is oh-my-openkilo?" supaya pembaca lihat di paragraf pertama.
- **Saran OpenChamber ditambah.** Bagian baru "Want a friendlier UI? Try OpenChamber" jelaskan kalau OpenChamber adalah workspace visual di atas OpenCode SDK (bukan bagian dari pack ini atau tim OpenCode). Tautan ke ekstensi VS Code, situs, dan source juga ditambah.
- **Bagian "Default models are free"** di README + tabel model per agent di `docs/AGENTS.md`. Tiap agent bawa `model:` gratis dari OpenCode; dijelaskan cara override lewat frontmatter agent.
- **Bagian "Example workflows"** di README. 5 prompt nyata dengan perbandingan "tanpa pack" vs "dengan pack". Tiap entri sebutkan agent, skill, rule, dan hasilnya.

### Diperbaiki
- **Sinkron dari konfigurasi runtime: hapus MCP pribadi dari pack, tambah aturan em dash.** Runtime menambah kembali MCP `tinypuppet` dan `perplexity` (alat pribadi) dan menambah bagian "Punctuation: drop em dash" di `rules/communication-style.md`. Pack disinkronkan, tapi dua MCP pribadi dihapus dari pack publik.

## [0.2.0] - 2026-08-28

### Ditambah
- **`examples/opencode.example.json`** — template config portabel dengan kredensial disamarkan. Sudah termasuk semua loader plugin, aturan, entri MCP (mayoritas `enabled: false` kecuali `agentmemory`), satu template provider, dan blok `permission`. `install.ps1` otomatis pakai file ini kalau user belum punya config.
- **Validasi env var di `install.ps1` / `install.sh`.** Setelah install, script scan `opencode.json` dan kasih tahu kalau ada MCP aktif yang env var-nya belum terisi (`{env:VAR}` tidak bisa diselesaikan). Jalankan ulang setelah edit `opencode.json` buat validasi ulang.

### Diubah
- **Tier "Plus" dilebur jadi dependensi wajib.** `graphify` dan `@agentmemory/server` tidak lagi opsional. Pack tidak jalan semestinya tanpa keduanya. Bagian README diubah dari "Performance Tiers" jadi "Required dependencies", bahasanya dikencangkan. `agentmemory` MCP ditandai wajib di tabel MCP.
- **Default MCP: hanya `agentmemory` yang aktif.** MCP lain (`chrome-devtools`, `context7`, `playwright`, `remotion`, `stitch`, `supabase-mcp-server`) kirim dengan `"enabled": false`. User nyalakan per kebutuhan dengan membalik flag. Config contoh tidak lagi sebut `perplexity`/`tinypuppet` (MCP pribadi, bukan bagian pack publik).
- **"Default models are free"** (dipindah ke changelog 0.3.0; logikanya ditambah di 0.2.0). Semua 8 agent utama di-set ke model `*-free` dari OpenCode.
- **Pengakuan jujur macOS / Linux.** Maintainer hanya develop dan test di Windows. `install.sh` disediakan tapi **belum ditest di macOS atau Linux**. README dapat bagian "macOS / Linux support": (1) pengakuan belum ditest, (2) resep copy-paste manual sebagai fallback teraman, (3) tautan buat buka issue kalau ada bug khusus Unix. Tabel kompatibilitas sekarang tunjuk macOS dan Linux sebagai "Untested by maintainer".

### Dihapus
- **`perplexity` dan `tinypuppet` dari pack publik.** Keduanya MCP pribadi maintainer, bukan bagian konfigurasi publik. Referensi dihapus dari beberapa agent, rule, dan skill. Konfigurasi runtime mempertahankan untuk penggunaan pribadi; pack tidak.

## [0.1.0] - 2026-08-28

### Ditambah
- **Kerangka awal:** `.gitignore`, `LICENSE` (MIT), `AGENTS.md`, `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `SECURITY.md`.
- **Cerminan pack maintainer** (sumber: `~/.config/opencode/`):
  - 11 prompt agent di `agents/`
  - 46 skill di `skills/`
  - 7 rule global di `rules/`
  - 9 slash command di `commands/` (termasuk `/update-pack`, `/recall`, `/remember`, plus 6 utilitas `/caveman-*`)
  - 2 sumber plugin di `plugins/` (`agentmemory-capture.ts`, `plugins/caveman/`)
- **`commands/update-pack.md`** — slash command buat update pack. Tarik versi terbaru dari GitHub, sinkron tiap file dengan diff dan backup perubahan lokal (akhiran `.local-<timestamp>`). Fast-forward saja; berhenti kalau divergen dengan instruksi re-clone.
- **`docs/INSTALL.md`** dengan install one-liner PowerShell (`irm ... | iex`) dan Unix (`curl ... | bash`), backup saat install, uninstall, troubleshooting.
- **`docs/STRUCTURE.md`**, **`docs/AGENTS.md`**, **`docs/SKILLS.md`**, **`docs/RULES.md`**, **`docs/COMMANDS.md`**, **`docs/CONFIGURATION.md`** — referensi lengkap buat tiap folder, file, agent, skill, rule, command, dan blok config.
- **`SECURITY.md`** dengan janji tanpa kredensial dan apa yang harus dilakukan kalau kredensial tidak sengaja ke-commit.

### Keamanan
- **Tanpa kredensial yang ke-commit.** `opencode.json` runtime di-git-ignore. `examples/opencode.example.json` di repo pakai placeholder `{env:VAR}` buat semua rahasia, jadi aman di-commit, dibagikan, dan di-version.
