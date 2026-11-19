/* =========================================================
   app.js - Lógica de ProArena Sport (JavaScript puro)
   Conceptos que se demuestran (rúbrica del examen):
   1. DOM: document.getElementById, createElement, addEventListener
   2. Funciones definidas por el programa
   3. Recursividad (sumarRecursivo) e iteración (for / forEach / filter)
   4-6. Arreglos y objetos (productos, carrito) y su sintaxis
   7. Programación estructurada: variables, operadores, if/else, ciclos
   ========================================================= */

// ---------- 1. DATOS: arreglo de objetos ----------
// Cada producto es un OBJETO { propiedad: valor }; todos juntos forman un ARREGLO [ ].
const productos = [
  { id: 1, nombre: "Balón Fútbol #5",        categoria: "Fútbol",     precioCRC: 18000, imagen: "img/balon-futbol.svg" },
  { id: 2, nombre: "Tacos Césped Sintético", categoria: "Fútbol",     precioCRC: 42000, imagen: "img/tacos-cesped.svg" },
  { id: 3, nombre: "Balón Baloncesto",       categoria: "Baloncesto", precioCRC: 22000, imagen: "img/balon-baloncesto.svg" },
  { id: 4, nombre: "Short Running DryFit",   categoria: "Running",    precioCRC: 15000, imagen: "img/short-running.svg" },
  { id: 5, nombre: "Guantes Gym (par)",      categoria: "Gym",        precioCRC: 12000, imagen: "img/guantes-gym.svg" },
  { id: 6, nombre: "Botella Deportiva 750ml",categoria: "Running",    precioCRC: 8000,  imagen: "img/botella-deportiva.svg" },
  { id: 7, nombre: "Malla Baloncesto",       categoria: "Baloncesto", precioCRC: 6000,  imagen: "img/malla-baloncesto.svg" },
  { id: 8, nombre: "Medias Compresión",      categoria: "Running",    precioCRC: 9000,  imagen: "img/medias-compresion.svg" }
];

const TASA_CAMBIO = 500;      // 1 USD = 500 colones (valor aproximado; se puede editar)
const PRECIO_MAXIMO = 60000;  // límite del control deslizante (en colones)

// ---------- 2. ESTADO de la aplicación ----------
let moneda = "CRC";           // "CRC" o "USD"
let carrito = [];             // arreglo de objetos { id, cantidad }

// ---------- 3. REFERENCIAS AL DOM ----------
const grid        = document.getElementById("gridProductos");
const buscador    = document.getElementById("buscador");
const selCategoria= document.getElementById("selCategoria");
const selOrden    = document.getElementById("selOrden");
const rango       = document.getElementById("rangoPrecio");
const textoRango  = document.getElementById("textoRango");
const sinResultados = document.getElementById("msgSinResultados");
const selMoneda   = document.getElementById("selMoneda");
const btnTema     = document.getElementById("btnTema");
const contador    = document.getElementById("contadorCarrito");
const panel       = document.getElementById("panelCarrito");
const fondo       = document.getElementById("fondoCarrito");
const listaCarrito= document.getElementById("listaCarrito");
const totalCarrito= document.getElementById("totalCarrito");
const aviso       = document.getElementById("aviso");
const menu        = document.getElementById("menu");
const btnMenu     = document.getElementById("btnMenu");

// ---------- 4. FUNCIONES DE PRECIO ----------
// Convierte un precio en colones a la moneda elegida y le da formato.
function formatearPrecio(colones) {
  if (moneda === "USD") {
    return "$" + (colones / TASA_CAMBIO).toFixed(2);
  }
  return "₡" + colones.toLocaleString("es-CR").replace(/\u00a0/g, " ");
}

// ---------- 5. CATÁLOGO: mostrar productos dinámicamente ----------
// Crea una tarjeta (elemento del DOM) por cada producto recibido.
function mostrarProductos(lista) {
  grid.innerHTML = "";                       // limpiar el contenedor
  lista.forEach(function (p) {               // iteración sobre el arreglo
    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta";
    tarjeta.innerHTML =
      '<img src="' + p.imagen + '" alt="' + p.nombre + '" loading="lazy">' +
      '<div class="tarjeta-info">' +
        "<h3>" + p.nombre + "</h3>" +
        '<span class="categoria">' + p.categoria + "</span>" +
        '<p class="precio">' + formatearPrecio(p.precioCRC) + "</p>" +
        '<button class="btn" data-id="' + p.id + '">Añadir</button>' +
      "</div>";
    grid.appendChild(tarjeta);
  });
  sinResultados.hidden = lista.length > 0;   // mensaje si no hay resultados
}

// Aplica búsqueda + categoría + precio + orden y vuelve a dibujar.
function aplicarFiltros() {
  const texto = buscador.value.trim().toLowerCase();
  const categoria = selCategoria.value;
  const maximo = Number(rango.value);

  let resultado = productos.filter(function (p) {
    const coincideTexto = p.nombre.toLowerCase().includes(texto) || p.categoria.toLowerCase().includes(texto);
    const coincideCat = categoria === "todas" || p.categoria === categoria;
    return coincideTexto && coincideCat && p.precioCRC <= maximo;
  });

  // sort() ordena una copia del arreglo según la opción elegida
  if (selOrden.value === "menor")  resultado.sort((a, b) => a.precioCRC - b.precioCRC);
  if (selOrden.value === "mayor")  resultado.sort((a, b) => b.precioCRC - a.precioCRC);
  if (selOrden.value === "nombre") resultado.sort((a, b) => a.nombre.localeCompare(b.nombre));

  textoRango.textContent = "Hasta: " + formatearPrecio(maximo);
  mostrarProductos(resultado);
}

// Llena el selector de categorías sin repetir (usa un arreglo auxiliar).
function llenarCategorias() {
  const categorias = [];
  productos.forEach(function (p) {
    if (!categorias.includes(p.categoria)) categorias.push(p.categoria);
  });
  categorias.forEach(function (c) {
    const op = document.createElement("option");
    op.value = c;
    op.textContent = c;
    selCategoria.appendChild(op);
  });
}

// ---------- 6. CARRITO ----------
function buscarProducto(id) {
  return productos.find(p => p.id === id);
}

function agregarAlCarrito(id) {
  const existente = carrito.find(item => item.id === id);
  if (existente) {
    existente.cantidad++;                    // ya estaba: sube la cantidad
  } else {
    carrito.push({ id: id, cantidad: 1 });   // nuevo objeto en el arreglo
  }
  actualizarCarrito();
  mostrarAviso("✔ " + buscarProducto(id).nombre + " añadido al carrito");
  contador.classList.remove("pulso");
  void contador.offsetWidth;                 // reinicia la animación
  contador.classList.add("pulso");
}

function cambiarCantidad(id, cambio) {
  const item = carrito.find(i => i.id === id);
  if (!item) return;
  item.cantidad += cambio;
  if (item.cantidad <= 0) quitarDelCarrito(id); else actualizarCarrito();
}

function quitarDelCarrito(id) {
  carrito = carrito.filter(i => i.id !== id);
  actualizarCarrito();
}

function vaciarCarrito() {
  carrito = [];
  actualizarCarrito();
}

// RECURSIVIDAD: una función que se llama a sí misma con un problema más pequeño.
// Caso base: si ya no quedan artículos (posicion llegó al final) devuelve 0.
// Caso recursivo: precio del artículo actual + total de los artículos restantes.
function sumarRecursivo(items, posicion) {
  if (posicion >= items.length) return 0;                       // caso base
  const subtotal = buscarProducto(items[posicion].id).precioCRC * items[posicion].cantidad;
  return subtotal + sumarRecursivo(items, posicion + 1);        // llamada recursiva
}

// ITERACIÓN: la misma idea con un ciclo for (se compara con la recursiva).
function contarArticulos(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].cantidad;
  }
  return total;
}

function actualizarCarrito() {
  contador.textContent = "Carrito: " + contarArticulos(carrito);
  listaCarrito.innerHTML = "";

  if (carrito.length === 0) {
    listaCarrito.innerHTML = '<p class="vacio">Tu carrito está vacío.</p>';
  }
  carrito.forEach(function (item) {
    const p = buscarProducto(item.id);
    const fila = document.createElement("div");
    fila.className = "item";
    fila.innerHTML =
      "<div><strong>" + p.nombre + "</strong><br><small>" + p.categoria + "</small></div>" +
      "<div>" + formatearPrecio(p.precioCRC * item.cantidad) + "</div>" +
      '<div class="controles">' +
        '<button data-accion="menos" data-id="' + p.id + '" aria-label="Quitar una unidad">−</button>' +
        "<span>" + item.cantidad + "</span>" +
        '<button data-accion="mas" data-id="' + p.id + '" aria-label="Añadir una unidad">+</button>' +
        '<button class="quitar" data-accion="quitar" data-id="' + p.id + '">Quitar</button>' +
      "</div>";
    listaCarrito.appendChild(fila);
  });
  totalCarrito.textContent = "Total: " + formatearPrecio(sumarRecursivo(carrito, 0));
  localStorage.setItem("carritoProArena", JSON.stringify(carrito)); // recordar el carrito
}

function abrirCarrito(abrir) {
  panel.classList.toggle("abierto", abrir);
  panel.setAttribute("aria-hidden", String(!abrir));
  fondo.hidden = !abrir;
}

// ---------- 7. TEMA, MONEDA, AVISO ----------
function cambiarTema() {
  const html = document.documentElement;
  const nuevo = html.dataset.tema === "oscuro" ? "claro" : "oscuro";
  html.dataset.tema = nuevo;
  localStorage.setItem("temaProArena", nuevo);
}

function cambiarMoneda() {
  moneda = selMoneda.value;
  aplicarFiltros();        // vuelve a dibujar los productos con la nueva moneda
  actualizarCarrito();     // y el carrito con su total
}

let temporizadorAviso;
function mostrarAviso(mensaje) {
  aviso.textContent = mensaje;
  aviso.classList.add("visible");
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => aviso.classList.remove("visible"), 2200);
}

// ---------- 8. EVENTOS ----------
// Un solo "escuchador" en la cuadrícula detecta clics en cualquier botón Añadir.
grid.addEventListener("click", function (e) {
  const boton = e.target.closest("button[data-id]");
  if (boton) agregarAlCarrito(Number(boton.dataset.id));
});

listaCarrito.addEventListener("click", function (e) {
  const b = e.target.closest("button[data-accion]");
  if (!b) return;
  const id = Number(b.dataset.id);
  if (b.dataset.accion === "mas") cambiarCantidad(id, 1);
  if (b.dataset.accion === "menos") cambiarCantidad(id, -1);
  if (b.dataset.accion === "quitar") quitarDelCarrito(id);
});

buscador.addEventListener("input", aplicarFiltros);
selCategoria.addEventListener("change", aplicarFiltros);
selOrden.addEventListener("change", aplicarFiltros);
rango.addEventListener("input", aplicarFiltros);
selMoneda.addEventListener("change", cambiarMoneda);
btnTema.addEventListener("click", cambiarTema);
document.getElementById("btnAbrirCarrito").addEventListener("click", () => abrirCarrito(true));
contador.addEventListener("click", () => abrirCarrito(true));
document.getElementById("btnCerrarCarrito").addEventListener("click", () => abrirCarrito(false));
fondo.addEventListener("click", () => abrirCarrito(false));
document.getElementById("btnVaciar").addEventListener("click", vaciarCarrito);
document.addEventListener("keydown", e => { if (e.key === "Escape") abrirCarrito(false); });

btnMenu.addEventListener("click", function () {
  const abierto = menu.classList.toggle("abierto");
  btnMenu.setAttribute("aria-expanded", String(abierto));
});
menu.addEventListener("click", e => { if (e.target.tagName === "A") menu.classList.remove("abierto"); });

// ---------- 9. INICIO ----------
function iniciar() {
  rango.min = 0;
  rango.max = PRECIO_MAXIMO;
  rango.step = 1000;
  rango.value = PRECIO_MAXIMO;

  // recuperar tema y carrito guardados (con try/catch por si el navegador lo bloquea)
  try {
    const tema = localStorage.getItem("temaProArena");
    if (tema) document.documentElement.dataset.tema = tema;
    const guardado = JSON.parse(localStorage.getItem("carritoProArena") || "[]");
    carrito = guardado.filter(i => buscarProducto(i.id));
  } catch (error) {
    carrito = [];
  }

  llenarCategorias();
  aplicarFiltros();
  actualizarCarrito();
}
iniciar();
