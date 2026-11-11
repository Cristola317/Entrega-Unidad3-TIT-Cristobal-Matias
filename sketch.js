//Desarrollo entrega Unidad 3
//Integrantes: Cristóbal Pérez, Matías Tapia.
//Definición de parámetros del enjambre
let enjambre = [];
let cantidad = 67;
let diametro = 11;
let limiteVelocidad = 4;
let minimo = 0.1;
let maximo = 0.9;
let ultimo = null; // lo último que llegó (o null)
let senal = 0; // Señal booleana (0 o 1)
let suavidad = 0.1; // cuánto se acerca en cada cuadro (como en lerp)
//Definición de dos umbrales para evitar oscilaciones
let alerta = false;
let umbralSubir = 0.8;
let umbralBajar = 0.2;
let fallaSimulada = false;
//Creación de señal simulada. Posee saltos ocasionales para simular fallas.
function leerCrudo() {
if (fallaSimulada) {
return null;
}
//Definición de señal simulada
let v = noise(frameCount * 0.02);
if (random() < 0.005) {
v = random(); //Salto de señal
}
return v;
}
function hayDatos() {
return ultimo !== null;
}
function actualizarSenal() {
ultimo = leerCrudo();
if (!hayDatos()) {
return; // Solo actualiza si hay datos
}
let s = map(ultimo, minimo, maximo, 0, 1);
s = constrain(s, 0, 1);
senal = lerp(senal, s, suavidad);
}
function actualizarAlerta() {
if (!alerta && senal > umbralSubir) alerta = true;
if (alerta && senal < umbralBajar) 
alerta = false;
} //Cambia el estado de alerta según la señal.
//Creación de las funciones que definen el enjambre
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
fill(190); //El sistema reconoce cuando no hay datos. Lo expresa por medio del color gris.
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
crearEnjambre();
}
function draw() {
background(245, 243, 235);
actualizarSenal();
actualizarAlerta();
for (let a of enjambre) {
if (hayDatos()) {
mover(a); // Si no hay datos, el enjambre se queda quieto. CONDICIÓN IMPORTANTE.
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
