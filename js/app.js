// ================= DATOS (lo que vas a editar) =================
// Fotos: ponlas en img/ y escribe aquí el nombre con su extensión.
// Se acomodan solas, sin espacios vacíos.
const fotos = [
  "recuerdos01.jpeg"
  // , "recuerdos2.jpeg"
];

const integrantes = [
  "BARROS MOSCOSO, Danyely Mia",
  "CHAVARRIA HUARCAYA, Jheyson Jhadiel",
  "CHAVEZ BENDEZU, Anahi Arelhi",
  "CORDOVA ALEJANDRO, Abner Alexis",
  "FERNANDES PARIONA, Lizeth",
  "FLORES GARCIA, Diana Sonilda",
  "JAUCHA HUAYRA, Nadine Edeliza",
  "LINARES TAIPE, Liang Sharik",
  "LINARES TAIPE, Yuritza Yamileth",
  "MENESES TITO, Yhon Mauricio",
  "MONTES CONDORI, Angela Rosario",
  "MOSCOSO VILLEGAS, Albert Einsten",
  "PASACA VILLALVA, Dylan Benjamin",
  "PEZUA ALMINAGORDA, Ivana Medaly",
  "PEZUA TAIPE, Luz Angela",
  "TAIPE ACEVEDO, Fran Yenson",
  "TAIPE BALTAZAR, Mayumi",
  "TAIPE JAUCHA, Damaris Akira",
  "VELASQUEZ ASTO, Dafne Brihana",
  "VILLALOBOS CORDOVA, Danail Shandi",
  "YUCRA ENRIQUEZ, Dereck Harols"
];

// Fiesta: miércoles 2 de diciembre 2026, 6:00 pm (hora de Perú)
const fechaFiesta = new Date("2026-12-02T18:00:00-05:00");

// Cuánto dura cada historia (milisegundos)
const DURACIONES = {
  "pantalla-portada": 7000,
  "pantalla-integrantes": 16000,
  "pantalla-gracias": 8000
};

// ================= ELEMENTOS =================
const $ = (id) => document.getElementById(id);
const escenario = $("escenario");
const slides = [...document.querySelectorAll(".pantalla")];
const total = slides.length;
const ultima = total - 1;
const musica = $("musica");
const btnMusica = $("btn-musica");
const cabecera = $("cabecera");
const pie = $("pie");
const sobre = $("sobre");

let idx = 0, acum = 0, pausado = false, iniciado = false;

// Orden de entrada de los elementos de cada pantalla
slides.forEach((s) => [...s.children].forEach((c, i) => c.style.setProperty("--i", i)));

// ================= CONSTRUIR CONTENIDO =================
// Integrantes
const lista = $("lista-integrantes");
integrantes.forEach((nombre) => {
  const li = document.createElement("li");
  li.textContent = nombre;
  lista.appendChild(li);
});

// Fotos
const fotosEl = $("fotos");
const contador = $("contador");
const imgs = fotos.map((nombre) => {
  const im = document.createElement("img");
  im.src = "img/" + nombre;
  im.alt = "Recuerdo de la promoción";
  fotosEl.appendChild(im);
  return im;
});
let fi = 0;
function mostrarFoto(i) {
  if (!imgs.length) return;
  fi = (i + imgs.length) % imgs.length;
  imgs.forEach((im, k) => im.classList.toggle("on", k === fi));
  contador.textContent = imgs.length > 1 ? `${fi + 1} / ${imgs.length}` : "";
}
setInterval(() => {
  if (iniciado && !pausado && slides[idx].id === "pantalla-recuerdos" && imgs.length > 1) {
    mostrarFoto(fi + 1);
  }
}, 3500);

// Barras de progreso (una por historia, sin contar el sobre)
const barras = [];
for (let i = 1; i < total; i++) {
  const b = document.createElement("div");
  b.className = "barra";
  b.innerHTML = "<i></i>";
  $("barras").appendChild(b);
  barras[i] = b.firstElementChild;
}

function duracion(i) {
  const id = slides[i].id;
  if (id === "pantalla-recuerdos") return Math.max(7000, imgs.length * 3500);
  return DURACIONES[id] || 7000;
}

// ================= NAVEGACIÓN =================
function ir(n) {
  if (n > ultima) return false;
  if (n < 1) n = 1;
  slides[idx].classList.remove("activa");
  idx = n;
  acum = 0;
  for (let i = 1; i < total; i++) barras[i].style.width = i < idx ? "100%" : "0%";
  if (idx === ultima) barras[ultima].style.width = "100%";
  slides[idx].classList.add("activa");
  entrar(slides[idx].id);
  return true;
}
const siguiente = () => ir(idx + 1);
const anterior = () => ir(idx > 1 ? idx - 1 : 1);

function entrar(id) {
  if (id === "pantalla-portada") escribirLema();
  if (id === "pantalla-integrantes") {
    lista.style.setProperty("--ch", lista.parentElement.clientHeight + "px");
  }
  if (id === "pantalla-recuerdos") mostrarFoto(0);
  if (id === "pantalla-invitacion") {
    iniciarRasca();
    soltarGlobos(8);
    for (let i = 0; i < 3; i++) setTimeout(() => cohete(), 500 + i * 450);
  }
}

// Reloj de las historias
let ult = 0;
function ciclo(ts) {
  const dt = Math.min(ts - (ult || ts), 100);
  ult = ts;
  if (iniciado && !pausado && idx < ultima) {
    acum += dt;
    const d = duracion(idx);
    barras[idx].style.width = Math.min(100, (acum / d) * 100) + "%";
    if (acum >= d) ir(idx + 1);
  }
  requestAnimationFrame(ciclo);
}
requestAnimationFrame(ciclo);

function pausar(v) {
  pausado = v;
  document.body.classList.toggle("en-pausa", v);
}

// ================= TOQUES: izquierda/derecha, mantener, deslizar =================
let tDown = 0, xDown = 0, mantuvo = false, tMant;

escenario.addEventListener("pointerdown", (e) => {
  if (!iniciado || e.target.closest("button, .globo, .rasca")) return;
  tDown = Date.now();
  xDown = e.clientX;
  mantuvo = false;
  tMant = setTimeout(() => { mantuvo = true; pausar(true); }, 250);
});

escenario.addEventListener("pointerup", (e) => {
  if (!tDown) return;
  clearTimeout(tMant);
  tDown = 0;
  reiniciarTilt();
  if (mantuvo) { pausar(false); return; }
  const dx = e.clientX - xDown;
  if (Math.abs(dx) > 50) { dx < 0 ? siguiente() : anterior(); return; }
  if (e.clientX < window.innerWidth * 0.3) { anterior(); return; }
  if (!siguiente()) {            // ya es la última: fuegos artificiales donde toques
    cohete(e.clientX, e.clientY);
    confeti(e.clientX, e.clientY, 25);
  }
});

escenario.addEventListener("pointercancel", () => {
  clearTimeout(tMant);
  tDown = 0;
  if (mantuvo) pausar(false);
  reiniciarTilt();
});

// ================= EFECTO 3D =================
escenario.addEventListener("pointermove", (e) => {
  document.querySelectorAll(".pantalla.activa .tilt").forEach((el) => {
    const r = el.getBoundingClientRect();
    const nx = Math.max(-0.8, Math.min(0.8, (e.clientX - r.left) / r.width - 0.5));
    const ny = Math.max(-0.8, Math.min(0.8, (e.clientY - r.top) / r.height - 0.5));
    el.style.setProperty("--ry", nx * 18 + "deg");
    el.style.setProperty("--rx", -ny * 18 + "deg");
    el.style.setProperty("--gx", (nx + 0.5) * 100 + "%");
    el.style.setProperty("--gy", (ny + 0.5) * 100 + "%");
  });
});
function reiniciarTilt() {
  document.querySelectorAll(".tilt").forEach((el) => {
    el.style.removeProperty("--rx");
    el.style.removeProperty("--ry");
  });
}

// ================= SOBRE + MÚSICA =================
sobre.addEventListener("click", () => {
  if (sobre.classList.contains("abierto")) return;
  sobre.classList.add("abierto");
  musica.play().catch(() => {});
  const r = sobre.getBoundingClientRect();
  confeti(r.left + r.width / 2, r.top + r.height / 2, 130);
  soltarGlobos(8);
  setTimeout(() => {
    cabecera.classList.remove("oculto");
    pie.classList.remove("oculto");
    iniciado = true;
    ir(1);
  }, 1900);
});

btnMusica.addEventListener("click", () => {
  if (musica.paused) { musica.play(); btnMusica.textContent = "🔊"; }
  else { musica.pause(); btnMusica.textContent = "🔇"; }
});

// ================= LEMA ESCRIBIÉNDOSE =================
let tLema, tLemaIni;
function escribirLema() {
  const el = $("lema");
  const txt = el.dataset.texto;
  clearInterval(tLema);
  clearTimeout(tLemaIni);
  el.textContent = "";
  el.classList.add("cursor");
  tLemaIni = setTimeout(() => {
    let i = 0;
    tLema = setInterval(() => {
      el.textContent = txt.slice(0, ++i);
      if (i >= txt.length) { clearInterval(tLema); el.classList.remove("cursor"); }
    }, 45);
  }, 900);
}

// ================= RASCA Y DESCUBRE =================
let rascaListo = false, revelado = false, rascando = false, mov = 0;
const cv = $("rasca-cv");
const rc = cv.getContext("2d");

function iniciarRasca() {
  if (rascaListo) return;
  rascaListo = true;
  const w = (cv.width = cv.parentElement.clientWidth);
  const h = (cv.height = cv.parentElement.clientHeight);
  const g = rc.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, "#b8902f");
  g.addColorStop(0.5, "#f0d77a");
  g.addColorStop(1, "#b8902f");
  rc.fillStyle = g;
  rc.fillRect(0, 0, w, h);
  rc.fillStyle = "rgba(255,255,255,0.22)";
  for (let i = 0; i < 50; i++) {
    rc.beginPath();
    rc.arc(Math.random() * w, Math.random() * h, Math.random() * 3 + 1, 0, 6.28);
    rc.fill();
  }
  rc.fillStyle = "#5c4410";
  rc.font = "600 16px Poppins, sans-serif";
  rc.textAlign = "center";
  rc.textBaseline = "middle";
  rc.fillText("✦ RASCA AQUÍ ✦", w / 2, h / 2);
}

function rascar(e) {
  const r = cv.getBoundingClientRect();
  const x = (e.clientX - r.left) * (cv.width / r.width);
  const y = (e.clientY - r.top) * (cv.height / r.height);
  rc.globalCompositeOperation = "destination-out";
  rc.beginPath();
  rc.arc(x, y, 24, 0, 6.28);
  rc.fill();
  if (++mov % 8 === 0) revisarRasca();
}

function revisarRasca() {
  if (revelado) return;
  const d = rc.getImageData(0, 0, cv.width, cv.height).data;
  let limpio = 0, muestras = 0;
  for (let i = 3; i < d.length; i += 16) {
    muestras++;
    if (d[i] < 128) limpio++;
  }
  if (limpio / muestras > 0.5) revelar();
}

function revelar() {
  revelado = true;
  cv.classList.add("fuera");
  $("pista").textContent = "¡Los esperamos! 🎉";
  confeti(window.innerWidth / 2, window.innerHeight * 0.45, 100);
  for (let i = 0; i < 4; i++) setTimeout(() => cohete(), i * 350);
}

cv.addEventListener("pointerdown", (e) => { rascando = true; cv.setPointerCapture(e.pointerId); rascar(e); });
cv.addEventListener("pointermove", (e) => { if (rascando) rascar(e); });
["pointerup", "pointercancel"].forEach((ev) => cv.addEventListener(ev, () => { rascando = false; }));

// ================= CUENTA REGRESIVA =================
function poner(id, val) {
  const el = $(id);
  if (el.textContent !== val) {
    el.textContent = val;
    el.classList.remove("flip");
    void el.offsetWidth;
    el.classList.add("flip");
  }
}
function cuentaRegresiva() {
  const falta = fechaFiesta - new Date();
  if (falta <= 0) {
    $("cuenta").innerHTML = "<p>¡Hoy es la fiesta! 🎉</p>";
    return;
  }
  const dos = (n) => String(n).padStart(2, "0");
  poner("c-dias", dos(Math.floor(falta / 86400000)));
  poner("c-horas", dos(Math.floor(falta / 3600000) % 24));
  poner("c-min", dos(Math.floor(falta / 60000) % 60));
  poner("c-seg", dos(Math.floor(falta / 1000) % 60));
}
cuentaRegresiva();
setInterval(cuentaRegresiva, 1000);

// ================= CANVAS: ESTRELLAS, CONFETI Y FUEGOS ARTIFICIALES =================
const canvas = $("fx");
const ctx = canvas.getContext("2d");
function ajustarCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
ajustarCanvas();
window.addEventListener("resize", ajustarCanvas);

const coloresConfeti = ["#d4af37", "#f0d77a", "#fff3c4", "#b8902f", "#f6f1e7", "#8c1d2b"];
const coloresFuego = ["#f0d77a", "#d4af37", "#fff3c4", "#ff4d6d", "#c8102e", "#ffffff"];
let particulas = [], cohetes = [], chispas = [];

const estrellas = Array.from({ length: 40 }, () => ({
  x: Math.random(), y: Math.random(),
  r: 0.8 + Math.random() * 1.6,
  f: Math.random() * 6.28,
  v: 0.5 + Math.random()
}));

function nuevaParticula(x, y, vx, vy) {
  particulas.push({
    x, y, vx, vy,
    w: 5 + Math.random() * 6, h: 3 + Math.random() * 4,
    rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.4,
    c: coloresConfeti[Math.floor(Math.random() * coloresConfeti.length)]
  });
}
function confeti(x, y, cantidad = 70) {
  for (let i = 0; i < cantidad; i++) {
    nuevaParticula(x, y, (Math.random() - 0.5) * 12, -Math.random() * 11 - 2);
  }
}
function lluviaConfeti() {
  let veces = 0;
  const t = setInterval(() => {
    for (let i = 0; i < 8; i++) {
      nuevaParticula(Math.random() * canvas.width, -10, (Math.random() - 0.5) * 2, 2 + Math.random() * 3);
    }
    if (++veces >= 25) clearInterval(t);
  }, 100);
}

// Fuegos artificiales: el cohete sube y explota en chispas con estela
function cohete(x, y) {
  cohetes.push({
    x: x ?? canvas.width * (0.15 + Math.random() * 0.7),
    y: canvas.height,
    ty: y ?? canvas.height * (0.12 + Math.random() * 0.35),
    vy: -(11 + Math.random() * 3)
  });
}
function explotar(x, y) {
  const par = [
    coloresFuego[Math.floor(Math.random() * coloresFuego.length)],
    coloresFuego[Math.floor(Math.random() * coloresFuego.length)]
  ];
  const n = 70;
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 * i) / n + Math.random() * 0.1;
    const v = (i % 2 ? 2 : 4) + Math.random() * 2.5;
    chispas.push({
      x, y, px: x, py: y,
      vx: Math.cos(a) * v, vy: Math.sin(a) * v,
      vida: 1, decay: 0.011 + Math.random() * 0.01,
      c: par[i % 2]
    });
  }
}
// Fuegos suaves mientras estás en la invitación
setInterval(() => {
  if (iniciado && !pausado && idx === ultima && cohetes.length < 2) cohete();
}, 1800);

function dibujar(t) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // estrellas que titilan
  estrellas.forEach((e) => {
    ctx.globalAlpha = 0.25 + 0.6 * Math.abs(Math.sin((t / 1000) * e.v + e.f));
    ctx.fillStyle = "#f0d77a";
    ctx.beginPath();
    ctx.arc(e.x * canvas.width, e.y * canvas.height, e.r, 0, 6.28);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  // confeti
  particulas = particulas.filter((p) => p.y < canvas.height + 20);
  particulas.forEach((p) => {
    p.vy = Math.min(p.vy + 0.25, 7);
    p.vx *= 0.99;
    p.x += p.vx; p.y += p.vy; p.rot += p.vr;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.c;
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.restore();
  });

  // fuegos artificiales
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  cohetes = cohetes.filter((c) => {
    c.y += c.vy;
    ctx.strokeStyle = "#fff3c4";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(c.x, c.y);
    ctx.lineTo(c.x, c.y + 14);
    ctx.stroke();
    if (c.y <= c.ty) { explotar(c.x, c.y); return false; }
    return true;
  });
  chispas = chispas.filter((s) => s.vida > 0);
  chispas.forEach((s) => {
    s.px = s.x; s.py = s.y;
    s.vx *= 0.97;
    s.vy = s.vy * 0.97 + 0.06;
    s.x += s.vx; s.y += s.vy;
    s.vida -= s.decay;
    ctx.globalAlpha = Math.max(0, s.vida);
    ctx.strokeStyle = s.c;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(s.px, s.py);
    ctx.lineTo(s.x, s.y);
    ctx.stroke();
  });
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";

  requestAnimationFrame(dibujar);
}
requestAnimationFrame(dibujar);

// ================= GLOBOS (solo en ráfagas) =================
const contGlobos = $("globos");
const coloresGlobo = ["#d4af37", "#f0d77a", "#c9a24a", "#fff3c4", "#8c1d2b"];

function crearGlobo() {
  const g = document.createElement("div");
  g.className = "globo";
  g.style.left = Math.random() * 88 + "%";
  g.style.setProperty("--tam", 38 + Math.random() * 28 + "px");
  g.style.setProperty("--color", coloresGlobo[Math.floor(Math.random() * coloresGlobo.length)]);
  g.style.setProperty("--dur", 5 + Math.random() * 3 + "s");
  g.addEventListener("click", () => {
    const r = g.getBoundingClientRect();
    confeti(r.left + r.width / 2, r.top + r.height / 2, 40);
    if (navigator.vibrate) navigator.vibrate(30);
    g.remove();
  });
  g.addEventListener("animationend", (e) => {
    if (e.animationName === "subirGlobo") g.remove();
  });
  contGlobos.appendChild(g);
}
function soltarGlobos(n) {
  for (let i = 0; i < n; i++) setTimeout(crearGlobo, i * 220);
}

// ================= BIRRETE, CELEBRAR, CORAZONES, COMPARTIR =================
document.querySelectorAll(".birrete").forEach((b) => {
  b.addEventListener("click", () => {
    b.classList.add("lanzar");
    const r = b.getBoundingClientRect();
    confeti(r.left + r.width / 2, r.top, 60);
    setTimeout(() => b.classList.remove("lanzar"), 1000);
  });
});

$("btn-celebrar").addEventListener("click", () => {
  lluviaConfeti();
  confeti(window.innerWidth / 2, window.innerHeight * 0.6, 100);
  for (let i = 0; i < 4; i++) setTimeout(() => cohete(), i * 300);
});

$("btn-corazon").addEventListener("click", () => {
  const emojis = ["💛", "🤍", "❤️"];
  for (let i = 0; i < 7; i++) {
    setTimeout(() => {
      const h = document.createElement("span");
      h.className = "corazon";
      h.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      h.style.setProperty("--dx", Math.random() * 120 - 90 + "px");
      h.style.fontSize = 18 + Math.random() * 16 + "px";
      document.body.appendChild(h);
      setTimeout(() => h.remove(), 2200);
    }, i * 90);
  }
});

function avisar(texto) {
  const t = $("toast");
  t.textContent = texto;
  t.classList.add("ver");
  setTimeout(() => t.classList.remove("ver"), 2200);
}

$("btn-compartir").addEventListener("click", async () => {
  const datos = {
    title: "Promoción 2026 · 6.° B",
    text: "¡Estás invitado a nuestra fiesta de promoción! Miércoles 2 de diciembre, 6:00 PM.",
    url: location.href
  };
  if (navigator.share) {
    try { await navigator.share(datos); } catch (e) {}
  } else {
    try { await navigator.clipboard.writeText(location.href); avisar("Enlace copiado"); }
    catch (e) { avisar("Copia el enlace de la barra"); }
  }
});