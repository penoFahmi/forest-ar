/* Project: ForestAR (Tugas Akhir AR/VR)
  Author: Peno (ElHalc8n) - NIM 221220095
  Description: Edukasi Banjir & Longsor berbasis WebAR
*/

// --- VARIABEL GLOBAL ---
let modelHijau, modelGundul; // Wadah untuk aset 3D
let currentModel;            // Model yang sedang aktif
let fontRegular;             // Font (opsional)

// Variabel Status
let gameState = 'HOME';      // 'HOME' atau 'AR'
let isRaining = false;       // Status hujan
let rainDrops = [];          // Array untuk partikel hujan
let pesanEdukasi = "";       // Teks untuk panel bawah

// Elemen UI (HTML DOM)
let btnMulai;
let btnHijau, btnGundul, btnHujan, btnReset;
let panelPenjelasan;

// --- 1. PRELOAD ASSETS ---
function preload() {
  // Ganti nama file ini sesuai aset yang kamu download nanti
  // Pastikan file .obj dan .mtl (atau .glb) ada di folder 'assets'
  try {
    modelHijau = loadModel('assets/part.obj', true);
    modelGundul = loadModel('assets/part.obj', true);
  } catch (e) {
    console.log("Aset belum ada, menggunakan placeholder kotak dulu.");
  }
}

// --- 2. SETUP ---
function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  
  // Setup Font & Style
  textFont('Arial');
  textSize(16);

  // --- MEMBUAT UI (Sesuai Sketsa) ---
  
  // A. Tombol Start (Halaman Depan)
  btnMulai = createButton('Mulai AR');
  styleButton(btnMulai);
  btnMulai.position(windowWidth/2 - 60, windowHeight - 100);
  btnMulai.mousePressed(() => {
    gameState = 'AR';
    hideHomeUI();
    showARUI();
  });

  // B. Tombol Mode (Kiri Atas)
  btnHijau = createButton('Gunung Hijau');
  styleButtonSmall(btnHijau);
  btnHijau.position(20, 20);
  btnHijau.mousePressed(() => setMode('HIJAU'));

  btnGundul = createButton('Gunung Gundul');
  styleButtonSmall(btnGundul);
  btnGundul.position(20, 60);
  btnGundul.mousePressed(() => setMode('GUNDUL'));

  // C. Tombol Aksi (Kanan Atas)
  btnHujan = createButton('Hujan');
  styleButtonSmall(btnHujan);
  btnHujan.position(windowWidth - 100, 20);
  btnHujan.mousePressed(() => { isRaining = !isRaining; });

  btnReset = createButton('Reset');
  styleButtonSmall(btnReset);
  btnReset.position(windowWidth - 100, 60);
  btnReset.mousePressed(() => { 
    // Reset posisi kamera atau model (sederhana)
    camera(0, 0, (height/2) / tan(PI/6), 0, 0, 0, 0, 1, 0);
  });

  // D. Panel Penjelasan (Bawah)
  panelPenjelasan = createDiv('<h4>Penjelasan</h4><p id="teks-info">Siap memulai.</p>');
  panelPenjelasan.style('background', 'white');
  panelPenjelasan.style('border-radius', '15px');
  panelPenjelasan.style('padding', '10px');
  panelPenjelasan.style('position', 'absolute');
  panelPenjelasan.style('bottom', '20px');
  panelPenjelasan.style('left', '20px');
  panelPenjelasan.style('right', '20px');
  panelPenjelasan.style('font-family', 'sans-serif');
  panelPenjelasan.style('box-shadow', '0px -2px 10px rgba(0,0,0,0.1)');
  
  // Inisialisasi awal UI: Sembunyikan UI AR, Tampilkan UI Home
  hideARUI();
  
  // Set default model
  currentModel = modelHijau; 
  pesanEdukasi = "Arahkan kamera ke meja untuk melihat gunung.";
}

// --- 3. DRAW LOOP ---
function draw() {
  background(255); // Background putih bersih (atau transparan jika AR aktif)
  
  if (gameState === 'HOME') {
    drawHomeScreen();
  } else if (gameState === 'AR') {
    drawARScreen();
  }
}

// --- FUNGSI LAYAR ---

function drawHomeScreen() {
  // Tampilan 2D sederhana di kanvas WEBGL
  push();
  fill(0);
  noStroke();
  textAlign(CENTER);
  text("ForestAR", 0, -50);
  textSize(12);
  text("Edukasi Banjir & Longsor", 0, -30);
  pop();
}

function drawARScreen() {
  // 1. Kontrol Orbit (Biar bisa diputar pakai mouse/touch saat testing)
  orbitControl();

  // 2. Pencahayaan
  ambientLight(150);
  directionalLight(255, 255, 255, 0.5, 1, -1);

  // 3. Render Model dengan Animasi Melayang
  push();
  let floatingY = sin(frameCount * 0.05) * 5; // Animasi naik turun halus
  translate(0, floatingY, 0); 
  
  rotateX(PI);
  // Rotasi pelan
  rotateY(frameCount * 0.005);
  
  noStroke();
  
  // Cek apakah model sudah di-load, jika belum pakai Box/Sphere dulu
  if (currentModel) {
    // Pewarnaan manual jika model tidak punya tekstur
    if (currentModel === modelHijau) fill(34, 139, 34); // Hijau Hutan
    else fill(139, 69, 19); // Coklat Tanah
    
    scale(2); // Sesuaikan skala modelmu nanti di sini
    model(currentModel);
  } else {
    // Placeholder jika aset belum ada
    fill(200);
    box(50); 
  }
  pop();

  // 4. Efek Hujan
  if (isRaining) {
    jalankanHujan();
  }
}

// --- LOGIKA HUJAN ---
function jalankanHujan() {
  // Tambah partikel hujan baru
  for (let i = 0; i < 5; i++) {
    rainDrops.push({
      x: random(-200, 200),
      y: -300,
      z: random(-200, 200),
      speed: random(10, 20)
    });
  }

  push();
  stroke(100, 100, 255);
  strokeWeight(2);
  
  for (let i = rainDrops.length - 1; i >= 0; i--) {
    let drop = rainDrops[i];
    drop.y += drop.speed;
    
    line(drop.x, drop.y, drop.z, drop.x, drop.y + 10, drop.z);
    
    // Hapus hujan jika sudah lewat bawah layar
    if (drop.y > 300) {
      rainDrops.splice(i, 1);
    }
  }
  pop();
}

// --- LOGIKA INTERAKSI ---

function setMode(mode) {
  let infoText = select('#teks-info'); // Ambil elemen <p> di dalam panel
  
  if (mode === 'HIJAU') {
    currentModel = modelHijau;
    pesanEdukasi = "Hutan utuh. Akar pohon menyerap air. Desa aman dari banjir.";
    // Ubah style panel jadi hijau (aman)
    panelPenjelasan.style('border-left', '5px solid green');
  } else {
    currentModel = modelGundul;
    pesanEdukasi = "Hutan gundul! Air meluncur deras membawa tanah. AWAS LONGSOR!";
    // Ubah style panel jadi merah (bahaya)
    panelPenjelasan.style('border-left', '5px solid red');
  }
  
  infoText.html(pesanEdukasi);
}

// --- HELPER UI ---

function hideHomeUI() {
  btnMulai.hide();
}

function hideARUI() {
  btnHijau.hide();
  btnGundul.hide();
  btnHujan.hide();
  btnReset.hide();
  panelPenjelasan.hide();
}

function showARUI() {
  btnHijau.show();
  btnGundul.show();
  btnHujan.show();
  btnReset.show();
  panelPenjelasan.show();
}

function styleButton(btn) {
  btn.style('background-color', '#fff');
  btn.style('border', '2px solid #000');
  btn.style('border-radius', '20px');
  btn.style('padding', '10px 30px');
  btn.style('font-size', '16px');
  btn.style('font-weight', 'bold');
}

function styleButtonSmall(btn) {
  btn.style('background-color', '#fff');
  btn.style('border', '1px solid #333');
  btn.style('border-radius', '8px');
  btn.style('padding', '5px 10px');
  btn.style('font-size', '12px');
}

// Resize Canvas responsif
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}