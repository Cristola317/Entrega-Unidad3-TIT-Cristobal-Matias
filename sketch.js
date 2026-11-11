// Desarrollo entrega Unidad 3
// Integrantes: Cristóbal Pérez, Matías Tapia.
// PRIVACIDAD: Este programa usa el micrófono solo para medir el nivel de volumen (0 a 1). 
// No graba, no guarda ni transmite el audio captado.

let mic;
let fuente = "micro"; // Cambia a "simulada" para probar el noise si es necesario

let enjambre = [];
let cantidad = 67;
let diametro = 11;
let limiteVelocidad = 4;

// Valores calibrados para el micrófono
let minimo = 0.1;
let maximo = 0.9;

let ultimo = null; // lo último que llegó (o null)
let senal = 0; // Señal suavizada
let suavidad = 0.1; // cuánto se acerca en cada cuadro (como en lerp)

// Definición de dos umbrales para evitar oscilaciones
let alerta = false;
let umbralSubir = 0.8;
let umbralBajar = 0.2;
let fallaSimulada = false;

// Lectura de la fuente real y simulación de falla
function leerCrudo() {
  if (fallaSimulada) {
    return null;
  }
  
  if (fuente === "micro") {
    let nivel = mic.getLevel();
    // El silencio real nunca es 0 absoluto. Si marca 0, el sensor falló o no hay permiso.
    if (nivel === 0) return null; 
    return nivel;
  } else {
    // Señal simulada de respaldo
    let v = noise(frameCount * 0.02);
    if (random() < 0.005) v = random(); 
    return v;
  }
}

function hayDatos() {
  return ultimo !== null;
}

function actualizarSenal() {
  ultimo = leerCrudo();
  if (!hayDatos()) {
    return; // Solo actualiza si hay datos, frena el cálculo si es null
  }
  let s = map(ultimo, minimo, maximo, 0, 1);
  s = constrain(s, 0, 1);
  senal = lerp(senal, s, suavidad);
}

function actualizarAlerta() {
  if (!alerta && senal > umbralSubir) alerta = true;
  if (alerta && senal < umbralBajar) alerta = false;
}

// Creación de las funciones que definen el enjambre
function crearEnjambre() {
  for (let i = 0; i < cantidad; i++) {
    enjambre.push({
      x: random(diametro, width - diametro),
      y: random(diametro, height - diametro),
      vx: random(-limiteVelocidad, limiteVelocidad),
      vy: random(-limiteVelocidad, limiteVelocidad),
    });
  }
}

function mover(a) {
  a.x += a.vx;
  a.y += a.vy;
}

function aplicarBorde(a) {
  if (a.x < diametro / 2 || a.x > width - diametro / 2) {
    a.vx *= -1;
    a.x = constrain(a.x, diametro / 2, width - diametro / 2);
  }
  if (a.y < diametro / 2 || a.y > height - diametro / 2) {
    a.vy *= -1;
    a.y = constrain(a.y, diametro / 2, height - diametro / 2);
  }
}

function mostrar(a) {
  let d = map(senal, 0, 1, 6, 40);
  noStroke();
  if (!hayDatos()) {
    fill(190); // El sistema reconoce cuando no hay datos pintando de gris.
  } else if (alerta) {
    fill(237, 34, 93);
  } else {
    fill(46, 196, 230);
  }
  circle(a.x, a.y, d);
}

function keyPressed() {
  if (key === "f") {
    fallaSimulada = !fallaSimulada;
  }
}

// -----------------------------------------
// Funciones de canvas y de dibujo
// -----------------------------------------
function setup() {
  createCanvas(400, 400);
  // Inicializamos el micrófono
  mic = new p5.AudioIn();
  mic.start();
  
  crearEnjambre();
}

// Obligatorio para que el navegador permita activar el micrófono
function mousePressed() {
  userStartAudio();
}

function draw() {
  background(245, 243, 235);
  actualizarSenal();
  actualizarAlerta();
  
  for (let a of enjambre) {
    if (hayDatos()) {
      mover(a); // Si no hay datos, el enjambre se queda quieto.
      aplicarBorde(a);
    }
    mostrar(a);
  }
  
  fill(20);
  noStroke();
  if (hayDatos()) {
    text("señal: " + round(senal * 100) + " %", 10, 20);
  } else {
    text("sin datos", 10, 20);
  }
}
