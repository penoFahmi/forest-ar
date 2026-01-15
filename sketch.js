/* Project: ForestAR (UAS Final Polish)
  Author: Peno (221220095)
*/

let modelHijau, modelGundul;
let currentModel;
let bgmSound;

// Status Game
let gameState = 'HOME';
let isRaining = false;
let rainDrops = [];
let pesanEdukasi = "";

// UI Elements
let btnMulai;
let btnHijau, btnGundul, btnHujan, btnReset;
let panelPenjelasan;

function preload() {
  try {
    // Pastikan path assets benar (Huruf Besar/Kecil berpengaruh di hosting!)
    // saran: rename file asli jadi huruf kecil semua (part.obj)
    modelHijau = loadModel('assets/part.obj', true);
    modelGundul = loadModel('assets/part.obj', true);
    
    soundFormats('mp3', 'ogg');
    bgmSound = loadSound('assets/bgm.mp3'); 
  } catch (e) {
    console.log("Error loading assets");
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  
  // Matikan loading screen HTML setelah setup selesai
  select('#loading').style('display', 'none');

  // --- UI SETUP DENGAN CSS CLASS ---
  
  // 1. Tombol MULAI (Tengah)
  btnMulai = createButton('Mulai ForestAR');
  btnMulai.class('btn-primary'); // Panggil class CSS
  btnMulai.position(windowWidth/2 - 90, windowHeight/2 - 25);
  btnMulai.mousePressed(startGame);

  // 2. Tombol Kiri (Pilihan Gunung)
  btnHijau = createButton('🌲 Hutan Hijau');
  btnHijau.class('btn-mode');
  btnHijau.position(20, 20);
  btnHijau.mousePressed(() => setMode('HIJAU'));

  btnGundul = createButton('🪓 Hutan Gundul');
  btnGundul.class('btn-mode');
  btnGundul.position(20, 70); // Jarak diperlebar dikit
  btnGundul.mousePressed(() => setMode('GUNDUL'));

  // 3. Tombol Kanan (Aksi)
  btnHujan = createButton('🌧️ Hujan');
  btnHujan.class('btn-mode');
  btnHujan.position(windowWidth - 100, 20); // Sesuaikan lebar tombol
  btnHujan.mousePressed(toggleRain);

  btnReset = createButton('🔄 Reset');
  btnReset.class('btn-mode');
  btnReset.position(windowWidth - 100, 70);
  btnReset.mousePressed(resetCamera);

  // 4. Panel Bawah
  panelPenjelasan = createDiv('<h4>Siap Belajar?</h4><p id="teks-info">Arahkan kamera ke meja.</p>');
  panelPenjelasan.class('info-panel');
  panelPenjelasan.position(20, windowHeight - 120); // Posisi fix di bawah
  panelPenjelasan.size(windowWidth - 80); // Lebar responsif

  // Sembunyikan UI AR dulu
  hideARUI();
  
  currentModel = modelHijau;
}

function draw() {
  // Background Transparan untuk WebAR
  background(255); 
  // Kalau mau transparan total (lihat kamera asli), ganti jadi: background(0,0);
  // Tapi untuk test di laptop pakai putih dulu gapapa.

  if (gameState === 'HOME') {
    drawHomeScreen();
  } else if (gameState === 'AR') {
    drawARScreen();
  }
}

// --- FUNGSI UTAMA ---

function drawHomeScreen() {
  // Teks Judul di Layar Awal
  push();
  fill(50);
  noStroke();
  textAlign(CENTER);
  textSize(28);
  textStyle(BOLD);
  text("ForestAR", 0, -80);
  
  textSize(14);
  textStyle(NORMAL);
  fill(100);
  text("Edukasi Banjir & Longsor\nOleh: Peno (221220095)", 0, -40);
  pop();
}

function drawARScreen() {
  orbitControl(); // Biar bisa diputar pakai jari

  // --- PERBAIKAN WARNA (FIXING WEIRD COLORS) ---
  // Kita ganti lightingnya biar lebih netral
  ambientLight(150); // Cahaya dasar (tidak terlalu gelap)
  directionalLight(255, 255, 255, 0.5, 1, -1); // Cahaya matahari putih
  
  push();
  // Animasi Melayang Halus
  let floatingY = sin(frameCount * 0.03) * 5; 
  translate(0, floatingY, 0);
  rotateX(PI); // Membalik model
  rotateY(frameCount * 0.005); // Rotasi otomatis pelan
  
  noStroke();

  if (currentModel) {
    // --- KUNCI WARNA ALAMI ---
    // Jangan pakai specularMaterial() karena bikin silau/putih di hosting
    // Pakai ambientMaterial() biar warnanya "doff" dan jelas
    
    if (currentModel === modelHijau) {
      ambientMaterial(34, 139, 34); // Hijau Daun Asli
    } else {
      ambientMaterial(139, 69, 19); // Coklat Tanah
    }

    scale(2.5);
    model(currentModel);
  } else {
    // Fallback kalau aset gagal load
    ambientMaterial(200);
    box(50);
  }
  pop();

  if (isRaining) jalankanHujan();
}

function jalankanHujan() {
  let rainCount = (currentModel === modelGundul) ? 10 : 5; // Gundul = Hujan deras
  
  // Warna Hujan
  if (currentModel === modelGundul) stroke(120, 100, 100); // Air keruh/coklat dikit
  else stroke(100, 200, 255); // Air jernih
  
  strokeWeight(2);

  for (let i = 0; i < rainCount; i++) {
    let x = random(-200, 200);
    let y = random(-300, 0);
    let z = random(-200, 200);
    let len = random(10, 20);
    
    // Bikin efek hujan turun cepat
    // Kita gambar banyak garis acak tiap frame tanpa simpan di array biar ringan
    line(x, y, z, x, y + len, z);
  }
}

// --- LOGIKA TOMBOL ---

function startGame() {
  gameState = 'AR';
  btnMulai.hide(); // Sembunyikan tombol mulai
  showARUI(); // Munculkan UI AR
  
  // Play Music
  if (bgmSound && bgmSound.isLoaded()) {
    bgmSound.setVolume(0.5);
    bgmSound.loop();
  }
}

function setMode(mode) {
  let infoText = select('#teks-info');
  
  // Reset style tombol biar gak aktif dua-duanya
  btnHijau.removeClass('btn-active');
  btnGundul.removeClass('btn-active');

  if (mode === 'HIJAU') {
    currentModel = modelHijau;
    btnHijau.addClass('btn-active'); // Highlight tombol
    pesanEdukasi = "<b>Kondisi Aman:</b><br>Akar pohon menyerap air hujan. Sungai jernih, desa terlindungi.";
    panelPenjelasan.style('border-left', '8px solid #2ecc71'); // Garis Hijau
  } else {
    currentModel = modelGundul;
    btnGundul.addClass('btn-active'); // Highlight tombol
    pesanEdukasi = "<b>BAHAYA!</b><br>Tanpa pohon, air membawa tanah (longsor). Banjir bandang menerjang desa!";
    panelPenjelasan.style('border-left', '8px solid #e74c3c'); // Garis Merah
  }
  infoText.html(pesanEdukasi);
}

function toggleRain() {
  isRaining = !isRaining;
  if (isRaining) btnHujan.addClass('btn-active');
  else btnHujan.removeClass('btn-active');
}

function resetCamera() {
  camera(0, 0, (height/2) / tan(PI/6), 0, 0, 0, 0, 1, 0);
}

function hideARUI() {
  btnHijau.hide(); btnGundul.hide(); btnHujan.hide(); btnReset.hide(); panelPenjelasan.hide();
}

function showARUI() {
  btnHijau.show(); btnGundul.show(); btnHujan.show(); btnReset.show(); panelPenjelasan.show();
  // Set default state
  setMode('HIJAU');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // Reposisi tombol saat layar diputar/resize
  btnMulai.position(windowWidth/2 - 90, windowHeight/2 - 25);
  btnHujan.position(windowWidth - 100, 20);
  btnReset.position(windowWidth - 100, 70);
  panelPenjelasan.position(20, windowHeight - 120);
  panelPenjelasan.size(windowWidth - 80);
}