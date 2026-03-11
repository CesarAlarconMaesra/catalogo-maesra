let productos = [];
let listaPrecioActiva = localStorage.getItem("listaPrecio") || "LP4";
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let cliente = localStorage.getItem("cliente");
let logoBase64 = null;

const URL_BASE_IMAGENES = "https://cesaralarconmaesra.github.io/catalogo-maesra/"; // <-- AJUSTAR
const cacheImagenes = {};


fetch("img/MAESRA.jpg")
    .then(res => res.blob())
    .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => {
            logoBase64 = reader.result;
        };
        reader.readAsDataURL(blob);
    });

/* ===============================
INICIO
=============================== */

document.addEventListener("DOMContentLoaded", () => {

  if (!cliente) {
    cliente = prompt("Ingresa el nombre del cliente:");
    localStorage.setItem("cliente", cliente);
  }

  conectarBotones();
  actualizarIndicadorLista();
  actualizarContadorCarrito();
  calcularTotalCarrito();
  cargarProductos();

  /* ===== BUSCADOR ===== */

  const buscador = document.getElementById("buscador");

  if (buscador) {
    buscador.addEventListener("input", e => {

      const texto = e.target.value.toLowerCase();

      const filtrados = productos.filter(p =>
        (p.producto && p.producto.toLowerCase().includes(texto)) ||
        (p.codigo && p.codigo.toLowerCase().includes(texto)) ||
        (p.marca && p.marca.toLowerCase().includes(texto))
      );

      mostrarProductos(filtrados);
    });
  }

  /* ===== MODAL PASSWORD ===== */

  const formPassword = document.getElementById("formPassword");
  const modalPassword = document.getElementById("modalPassword");
  const inputPassword = document.getElementById("inputPassword");
  const errorPassword = document.getElementById("errorPassword");

  if (formPassword) {
    formPassword.addEventListener("submit", function (e) {
      e.preventDefault();

      if (inputPassword.value === "MaesraFebrero2026") {

        listaPrecioActiva = "LP1";
        localStorage.setItem("listaPrecio", "LP1");

        actualizarIndicadorLista();
        mostrarProductos(productos);

        modalPassword.classList.add("oculto");
        inputPassword.value = "";
        errorPassword.style.display = "none";

      } else {
        errorPassword.style.display = "block";
      }
    });
  }

  const btnCancelarPassword = document.getElementById("btnCancelarPassword");

  if (btnCancelarPassword) {
    btnCancelarPassword.addEventListener("click", function () {
      modalPassword.classList.add("oculto");
      inputPassword.value = "";
      errorPassword.style.display = "none";
    });
  }

});

/* ===============================
BOTONES
=============================== */

function conectarBotones() {

  const btnCarrito = document.getElementById("btnCarrito");
  const btnPrecio = document.getElementById("btnPrecio");

  if (btnCarrito) btnCarrito.onclick = abrirCarrito;
  if (btnPrecio) btnPrecio.onclick = toggleListaPrecio;

}

/* ===============================
INDICADOR LISTA
=============================== */

function actualizarIndicadorLista() {
  const info = document.getElementById("infoLista");
  if (info) {
    info.textContent = "📊 " + listaPrecioActiva;
  }
}

/* ===============================
CARGAR PRODUCTOS
=============================== */

function cargarProductos() {

  fetch("productos.json")
    .then(r => r.json())
    .then(data => {

      productos = data;

      productos.sort((a, b) => {
        const ap = Number(a.precioPromocion) > 0;
        const bp = Number(b.precioPromocion) > 0;
        return bp - ap;
      });

      mostrarPromociones(productos);
      mostrarTopProductos(productos);
      mostrarProductos(productos);

      activarCarruselAutomatico("promoTrack");
      activarCarruselAutomatico("topProductos");
    });
}

/* ===============================
PROMOCIONES
=============================== */

function mostrarPromociones(lista) {

  const contenedor = document.getElementById("promoTrack");
  if (!contenedor) return;

  contenedor.innerHTML = "";

  const promos = lista.filter(p =>
    Number(p.precioPromocion) > 0 &&
    Number(p.precioPromocion) < Number(p.precioLP4)
  );

  promos.forEach(p => {

    const card = document.createElement("div");
    card.className = "card card-promo";

    card.innerHTML = `
      <div class="badge-promo">🔥 PROMOCIÓN</div>
      <img src="${p.imagen}" onerror="this.src='img/sin_imagen.jpg'">
      <h4>${p.producto}</h4>
      <p>${p.codigo}</p>
      <div class="precio-anterior">$${Number(p.precioLP4).toFixed(2)}</div>
      <div class="precio-promo">$${Number(p.precioPromocion).toFixed(2)}</div>
    `;

    card.onclick = () => abrirDetalle(p);
    contenedor.appendChild(card);
  });
}

/* ===============================
TOP PRODUCTOS
=============================== */

function mostrarTopProductos(lista) {

  const contenedor = document.getElementById("topProductos");
  if (!contenedor) return;

  contenedor.innerHTML = "";

  const top = lista.filter(p => p.top === true);

  top.forEach(p => {

    const card = document.createElement("div");
    card.className = "card-top";

    card.innerHTML = `
      <img src="${p.imagen}" onerror="this.src='img/sin_imagen.jpg'">
      <h4>${p.producto}</h4>
      <p>${p.codigo}</p>
    `;

    card.onclick = () => abrirDetalle(p);
    contenedor.appendChild(card);
  });
}

/* ===============================
CARRUSEL OPTIMIZADO
=============================== */

function activarCarruselAutomatico(id) {

  const contenedor = document.getElementById(id);
  if (!contenedor) return;

  let animando = false;

  function moverBloque() {

    if (animando) return;
    animando = true;

    const cards = contenedor.querySelectorAll(".card, .card-top");

    if (cards.length === 0) {
      animando = false;
      return;
    }

    const anchoCard = cards[0].offsetWidth;
    const anchoVisible = contenedor.clientWidth;

    // Cuántas tarjetas caben en pantalla
    const tarjetasVisibles = Math.floor(anchoVisible / anchoCard);

    const desplazamiento = tarjetasVisibles * anchoCard;

    contenedor.scrollBy({
      left: desplazamiento,
      behavior: "smooth"
    });

    setTimeout(() => {

      if (contenedor.scrollLeft + anchoVisible >= contenedor.scrollWidth) {
        contenedor.scrollTo({ left: 0, behavior: "smooth" });
      }

      animando = false;

    }, 1200);
  }

  setInterval(moverBloque, 4000);
}

/* ===============================
PRODUCTOS
=============================== */

function mostrarProductos(lista) {

  const contenedor = document.getElementById("listaProductos");
  if (!contenedor) return;

  contenedor.innerHTML = "";

  lista.forEach(p => {

    const enPromo =
      Number(p.precioPromocion) > 0 &&
      Number(p.precioPromocion) < Number(p.precioLP4);

    let precio =
      listaPrecioActiva === "LP1"
        ? Number(p.precioLP1)
        : enPromo
          ? Number(p.precioPromocion)
          : Number(p.precioLP4);

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      ${enPromo ? `<div class="badge-promo">🔥 PROMOCIÓN</div>` : ""}
      <img src="${p.imagen}" onerror="this.src='img/sin_imagen.jpg'">
      <h4>${p.producto}</h4>
      <p>${p.codigo}</p>
      <div class="precio-normal">$${precio.toFixed(2)}</div>
    `;

    card.onclick = () => abrirDetalle(p);
    contenedor.appendChild(card);
  });
}

/* ===============================
CARRITO
=============================== */

function abrirCarrito() {
  document.getElementById("modalCarrito").classList.remove("oculto");
  renderizarCarrito();
}

function cerrarCarrito() {
  document.getElementById("modalCarrito").classList.add("oculto");
}

function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
  renderizarCarrito();
  actualizarContadorCarrito();
  calcularTotalCarrito();
}

function actualizarContadorCarrito() {
  const contador = document.getElementById("contadorCarrito");
  if (!contador) return;
  const total = carrito.reduce((a, b) => a + b.cantidad, 0);
  contador.textContent = total;
  contador.style.display = total > 0 ? "inline-block" : "none";
}

function calcularTotalCarrito() {
  const total = carrito.reduce((a, b) => a + (b.precio * b.cantidad), 0);

  const totalCarrito = document.getElementById("totalCarrito");
  const totalHeader = document.getElementById("totalHeader");

  if (totalCarrito) totalCarrito.textContent = total.toFixed(2);
  if (totalHeader) totalHeader.textContent = total.toFixed(2);
}

/* ===============================
TOGGLE LISTA
=============================== */

function toggleListaPrecio() {

  if (listaPrecioActiva === "LP4") {
    document.getElementById("modalPassword").classList.remove("oculto");
  } else {
    listaPrecioActiva = "LP4";
    localStorage.setItem("listaPrecio", "LP4");
    actualizarIndicadorLista();
    mostrarProductos(productos);
  }
}
function abrirDetalle(p){

  document.getElementById("modal").classList.remove("oculto");

  document.getElementById("dImagen").src = p.imagen;
  document.getElementById("dNombre").textContent = p.producto;
  document.getElementById("dCodigo").textContent = "Código: " + p.codigo;
  document.getElementById("dMarca").textContent = "Marca: " + (p.marca || "");
  document.getElementById("dUnidad").textContent = "Unidad: " + (p.unidad || "");
  document.getElementById("dMaster").textContent = "Master: " + (p.master || "");
  document.getElementById("dInner").textContent = "Inner: " + (p.inner || "");

  const enPromo =
    Number(p.precioPromocion) > 0 &&
    Number(p.precioPromocion) < Number(p.precioLP4);

  let precio =
    listaPrecioActiva === "LP1"
      ? Number(p.precioLP1)
      : enPromo
        ? Number(p.precioPromocion)
        : Number(p.precioLP4);

  document.getElementById("dPrecio").textContent =
    "Precio: $" + precio.toFixed(2);

  const btnAgregar = document.getElementById("btnAgregarCarrito");
  btnAgregar.onclick = () => agregarAlCarrito(p, precio);
}

function cerrarModal(){
  document.getElementById("modal").classList.add("oculto");
}

document.getElementById("cerrar").onclick = cerrarModal;

/* ===============================
AGREGAR AL CARRITO
=============================== */

function agregarAlCarrito(p, precio){

  const existe = carrito.find(item => item.codigo === p.codigo);

  if(existe){
    existe.cantidad++;
  } else {
    carrito.push({
      producto: p.producto,
      codigo: p.codigo,
      precio: precio,
      cantidad: 1
    });
  }

  guardarCarrito();
  cerrarModal();
}

/* ===============================
RENDER CARRITO
=============================== */

function renderizarCarrito(){

  const contenedor = document.getElementById("contenidoCarrito");
  if (!contenedor) return;

  contenedor.innerHTML = "";

  if (carrito.length === 0) {
    contenedor.innerHTML = "<p>El carrito está vacío</p>";
    return;
  }

  carrito.forEach((p, index) => {

    const subtotal = p.precio * p.cantidad;

    const div = document.createElement("div");
    div.className = "item-carrito";

    div.innerHTML = `
      <strong>${p.producto}</strong><br>
      Código: ${p.codigo}<br>
      Precio unitario: $${p.precio.toFixed(2)}<br><br>

      <button class="menos">➖</button>
      <input type="number" value="${p.cantidad}" min="1">
      <button class="mas">➕</button>

      <br><br>
      Subtotal: $${subtotal.toFixed(2)}<br><br>

      <button class="eliminar">🗑 Eliminar</button>
      <hr>
    `;

    div.querySelector(".menos").onclick = () => cambiarCantidad(index, -1);
    div.querySelector(".mas").onclick = () => cambiarCantidad(index, 1);
    div.querySelector(".eliminar").onclick = () => eliminarProducto(index);

    div.querySelector("input").onchange = (e)=>{
      actualizarCantidad(index, e.target.value);
    };

    contenedor.appendChild(div);

  });
}

function cambiarCantidad(index,cambio){
  carrito[index].cantidad += cambio;
  if(carrito[index].cantidad <= 0){
    carrito.splice(index,1);
  }
  guardarCarrito();
}

function actualizarCantidad(index,cantidad){
  cantidad = parseInt(cantidad);
  if(isNaN(cantidad) || cantidad <= 0){
    carrito.splice(index,1);
  }else{
    carrito[index].cantidad = cantidad;
  }
  guardarCarrito();
}

function eliminarProducto(index){
  carrito.splice(index,1);
  guardarCarrito();
}

/* ===============================
WHATSAPP
=============================== */

function enviarWhatsApp(){

  if(carrito.length === 0){
    alert("Carrito vacío");
    return;
  }

  let total = 0;
  let msg = "🛒 Pedido MAESRA %0A%0A";

  carrito.forEach(p=>{
    const sub = p.precio * p.cantidad;
    total += sub;

    msg += `📦 ${p.producto}%0A`;
    msg += `Código: ${p.codigo}%0A`;
    msg += `Cantidad: ${p.cantidad}%0A`;
    msg += `Precio unitario: $${p.precio.toFixed(2)}%0A`;
    msg += `Subtotal: $${sub.toFixed(2)}%0A%0A`;
  });

  msg += `💰 TOTAL: $${total.toFixed(2)}`;

  window.open(`https://wa.me/5216565292879?text=${msg}`);
}



// ===============================
// CARGAR LOGO
// ===============================

async function cargarLogo() {
    try {
        const res = await fetch("img/MAESRA.jpg");
        const blob = await res.blob();

        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                logoBase64 = reader.result;
                resolve();
            };
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        console.warn("No se pudo cargar logo");
    }
}


// ===============================
// OPTIMIZADOR DE IMÁGENES
// ===============================

async function cargarImagenOptimizada(rutaImagen, tamañoMax = 200) {

    if (!rutaImagen) return null;

    if (cacheImagenes[rutaImagen]) {
        return cacheImagenes[rutaImagen];
    }

    try {

        // 🔥 IMPORTANTE: usar la constante global correctamente
    const url = rutaImagen.startsWith("http")
    ? rutaImagen
    : URL_BASE_IMAGENES + rutaImagen;

        const response = await fetch(url);

        if (!response.ok) {
            console.warn("No se pudo cargar:", url);
            return null;
        }

        const blob = await response.blob();

        return new Promise((resolve) => {

            const img = new Image();

            img.onload = function () {

                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > tamañoMax) {
                        height *= tamañoMax / width;
                        width = tamañoMax;
                    }
                } else {
                    if (height > tamañoMax) {
                        width *= tamañoMax / height;
                        height = tamañoMax;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                ctx.drawImage(img, 0, 0, width, height);

                const base64 = canvas.toDataURL("image/jpeg", 0.75);

                cacheImagenes[rutaImagen] = base64;

                URL.revokeObjectURL(img.src);

                resolve(base64);
            };

            img.onerror = function () {
                console.warn("Error cargando imagen:", url);
                resolve(null);
            };

            img.src = URL.createObjectURL(blob);
        });

    } catch (error) {
        console.warn("Error general imagen:", rutaImagen);
        return null;
    }
}


// ===============================
// GENERADOR PDF COMPLETO
// ===============================

async function generarCatalogoCompletoPDF(){

mostrarProgreso();

const totalProductos = productos.length;
let contadorGlobal = 0;

/* permitir que el navegador pinte la barra */

await new Promise(r => requestAnimationFrame(r));

const { jsPDF } = window.jspdf;
const doc = new jsPDF("p","mm","letter");

const margen = 10;
const pageW = doc.internal.pageSize.getWidth();
const pageH = doc.internal.pageSize.getHeight();

let x = margen;
let y = 35;

let cols = 3;
let filas = 4;

let cardW = (pageW - margen*2) / cols;
let cardH = 55;

let col = 0;
let fila = 0;



/* ==============================
ETIQUETA PROMO
============================== */

function etiquetaPromo(){

doc.setFillColor(220,0,0);
doc.rect(x+cardW-12,y,12,5,"F");

doc.setTextColor(255);
doc.setFontSize(6);

doc.text("PROMO",x+cardW-6,y+3.5,{align:"center"});

doc.setTextColor(0);

}

/* ==============================
ETIQUETA TOP
============================== */

function etiquetaTop(){

doc.setFillColor(255,140,0);
doc.rect(x,y,12,5,"F");

doc.setTextColor(255);
doc.setFontSize(6);

doc.text("TOP",x+6,y+3.5,{align:"center"});

doc.setTextColor(0);

}

/* ==============================
DIBUJAR TARJETA
============================== */

async function dibujarProducto(p){

let ty = y + 5;

/* detectar promo */

const enPromo =
Number(p.precioPromocion) > 0 &&
Number(p.precioPromocion) < Number(p.precioLP4);

/* etiquetas */

if(enPromo) etiquetaPromo();
if(p.top) etiquetaTop();

/* =========================
IMAGEN PROPORCIONAL
========================= */

const base64 = await cargarImagenOptimizada(p.imagen,200);

if(base64){

const img = new Image();

await new Promise(resolve=>{
img.onload = resolve;
img.src = base64;
});

/* tamaño máximo imagen */

const maxW = cardW - 12;
const maxH = 14;

let w = img.width;
let h = img.height;

const ratio = Math.min(maxW / w, maxH / h);

w *= ratio;
h *= ratio;

/* centrado */

const imgX = x + (cardW - w) / 2;

doc.addImage(base64,"JPEG",imgX,ty,w,h);

}

ty += 18;

/* =========================
TEXTO PRODUCTO
========================= */

doc.setFontSize(7);

doc.text(`Código: ${p.codigo}`,x+2,ty);
ty += 3;

let nombre = doc.splitTextToSize(p.producto,cardW-4);
doc.text(nombre,x+2,ty);
ty += nombre.length*3;

/* marca */

if(p.marca){
doc.text(`Marca: ${p.marca}`,x+2,ty);
ty += 3;
}

/* =========================
UNIDAD MASTER INNER EN UNA LÍNEA
========================= */

let lineaEmpaque = [];

if(p.unidad) lineaEmpaque.push(`Unidad:${p.unidad}`);
if(p.master) lineaEmpaque.push(`Master:${p.master}`);
if(p.inner) lineaEmpaque.push(`Inner:${p.inner}`);

if(lineaEmpaque.length){

doc.text(lineaEmpaque.join("  "),x+2,ty);
ty += 3;

}

/* =========================
PRECIO SOLO LP1
========================= */

if(listaPrecioActiva==="LP1" && p.precioLP1){

doc.setFontSize(8);
doc.text(`$${Number(p.precioLP1).toFixed(2)}`,x+2,ty);
ty += 4;

}

/* =========================
RESTRICCIONES
MAXIMO 3 LINEAS
========================= */

if(p.restricciones){

doc.setTextColor(200,0,0);

let r = doc.splitTextToSize("⚠ "+p.restricciones,cardW-4);

/* máximo 3 líneas */

r = r.slice(0,3);

doc.text(r,x+2,ty);

doc.setTextColor(0);

}

contadorGlobal++;
actualizarProgreso(contadorGlobal, totalProductos);

// Permitir que el navegador respire
if (contadorGlobal % 5 === 0) {
    await new Promise(r => setTimeout(r, 0));
}

/* ==============================
SIGUIENTE POSICION
============================== */

function siguiente(){

col++;

if(col>=cols){

col=0;
fila++;
x=margen;
y+=cardH;

}else{

x+=cardW;

}

}

/* ==============================
NUEVA PAGINA
============================== */

function nuevaPagina(titulo){

doc.addPage();

doc.setFontSize(18);
doc.text(titulo,pageW/2,20,{align:"center"});

x=margen;
y=35;

col=0;
fila=0;

}

/* ==============================
PROMOCIONES
============================== */

let promos = productos.filter(p =>
Number(p.precioPromocion) > 0 &&
Number(p.precioPromocion) < Number(p.precioLP4)
);

if(promos.length){

doc.setFontSize(18);
doc.text("PROMOCIONES",pageW/2,20,{align:"center"});

cols=3;
filas=4;

cardW=(pageW-margen*2)/cols;
cardH=55;

for(let p of promos){

await dibujarProducto(p);

siguiente();

if(fila>=filas){

nuevaPagina("PROMOCIONES");

}

}

}

/* ==============================
TOP PRODUCTOS
============================== */

let tops = productos.filter(p=>p.top);

if(tops.length){

nuevaPagina("PRODUCTOS TOP");

cols=4;
filas=4;

cardW=(pageW-margen*2)/cols;
cardH=45;

for(let p of tops){

await dibujarProducto(p);

siguiente();

if(fila>=filas){

nuevaPagina("PRODUCTOS TOP");

}

}

}

/* ==============================
RESTO PRODUCTOS
============================== */

let resto = productos.filter(p => {

const enPromo =
Number(p.precioPromocion) > 0 &&
Number(p.precioPromocion) < Number(p.precioLP4);

return !enPromo && !p.top;

});

if(resto.length){

nuevaPagina("PRODUCTOS");

cols=4;
filas=5;

cardW=(pageW-margen*2)/cols;
cardH=45;

for(let p of resto){

await dibujarProducto(p);

siguiente();

if(fila>=filas){

nuevaPagina("PRODUCTOS");

}

}

}

doc.save("Catalogo MAESRA 2026.pdf");

ocultarProgreso();

}
function mostrarProgreso() {
    document.getElementById("progresoContainer").style.display = "block";
}

function ocultarProgreso() {
    document.getElementById("progresoContainer").style.display = "none";
}

function actualizarProgreso(actual, total) {

    const porcentaje = Math.floor((actual / total) * 100);

    document.getElementById("barraProgreso").style.width = porcentaje + "%";
    document.getElementById("progresoTexto").innerText = porcentaje + "%";

}