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
            : URL_BASE_IMAGENES + rutaImagen.replace(/^\/+/, "");

        const response = await fetch(url, { cache: "force-cache" });

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

async function generarCatalogoCompletoPDF() {

const { jsPDF } = window.jspdf;
const doc = new jsPDF("p","mm","letter");

let productosPorPagina = 12;
let contadorPagina = 1;

const margenX = 10;
const margenY = 30;

const tarjetaW = 60;
const tarjetaH = 70;

const columnas = 3;
const filas = 4;

const cacheImagenes = {};

function agregarNumeroPagina(){
doc.setFontSize(8);
doc.text("Página " + contadorPagina, 195, 275, {align:"right"});
contadorPagina++;
}

function dibujarHeader(titulo){

doc.setFontSize(18);
doc.text(titulo,105,15,{align:"center"});

doc.setLineWidth(0.5);
doc.line(10,18,200,18);

if(logoBase64){
doc.addImage(logoBase64,"PNG",175,5,25,10);
}

}

async function cargarImagen(url){

if(cacheImagenes[url]) return cacheImagenes[url];

try{

const response = await fetch(url);
const blob = await response.blob();

return new Promise(resolve=>{
const reader = new FileReader();

reader.onloadend = function(){
cacheImagenes[url] = reader.result;
resolve(reader.result);
};

reader.readAsDataURL(blob);

});

}catch(e){
return null;
}

}

function dibujarTarjeta(x,y,p){

doc.setDrawColor(200);
doc.rect(x,y,tarjetaW,tarjetaH);

}

function escribirTextoProducto(x,y,p){

let linea = y + 40;

doc.setFontSize(8);

doc.text(`Código: ${p.codigo}`,x+2,linea);

linea +=4;

let nombre = doc.splitTextToSize(p.producto, tarjetaW-4);
doc.text(nombre,x+2,linea);

linea += nombre.length*4 +2;

doc.text(`Marca: ${p.marca}`,x+2,linea);

linea+=4;

doc.text(`Unidad: ${p.unidad}`,x+2,linea);

linea+=4;

doc.text(`Master: ${p.master || "-"}`,x+2,linea);

linea+=4;

if(p.restriccion){

doc.setFontSize(7);

let restr = doc.splitTextToSize(p.restriccion, tarjetaW-4);

doc.text(restr,x+2,linea);

}

}

async function dibujarImagenProducto(x,y,p){

let url = URL_BASE_IMAGENES + "img/" + p.codigo + ".jpg";

let img = await cargarImagen(url);

if(!img) return;

doc.addImage(img,"JPEG",x+10,y+5,40,30);

}

async function imprimirSeccion(lista,titulo){

doc.addPage();

dibujarHeader(titulo);

let index = 0;

for(const producto of lista){

let posicion = index % productosPorPagina;

let col = posicion % columnas;
let fila = Math.floor(posicion/columnas);

let x = margenX + col * (tarjetaW + 5);
let y = margenY + fila * (tarjetaH + 5);

if(posicion === 0 && index !== 0){

agregarNumeroPagina();

doc.addPage();
dibujarHeader(titulo);

}

dibujarTarjeta(x,y,producto);

await dibujarImagenProducto(x,y,producto);

escribirTextoProducto(x,y,producto);

index++;

}

agregarNumeroPagina();

}

let productosTOP = productos.filter(p=>p.top === "SI");
let promociones = productos.filter(p=>p.promo === "SI");

await imprimirSeccion(productosTOP,"PRODUCTOS TOP");

await imprimirSeccion(promociones,"PROMOCIONES");

doc.save("catalogo_maesra.pdf");

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