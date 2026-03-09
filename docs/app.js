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
            : `${URL_BASE_IMAGENES}/${rutaImagen}`;

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

async function generarCatalogoPDF(){

const { jsPDF } = window.jspdf;

const doc = new jsPDF("p","mm","letter");

const margen = 10;
const pageW = 216;
const pageH = 279;

let x = margen;
let y = 40;

const cols = 3;
const cardW = (pageW - margen*2) / cols;
const cardH = 55;

let col = 0;

let progreso = document.getElementById("progresoPDF");

function setProgreso(p){
  if(progreso) progreso.style.width = p + "%";
}

/* =========================
   CACHE
========================= */

const cache = await caches.open("catalogo-cache-v21");

/* =========================
   DETECTAR IMAGEN
========================= */

async function obtenerImagenProducto(codigo){

  const extensiones = ["jpg","png","webp"];

  for(let ext of extensiones){

    const url = `${URL_BASE_IMAGENES}img/${codigo}.${ext}`;

    let cached = await cache.match(url);

    if(cached){

      const blob = await cached.blob();
      return blob;

    }

    try{

      const resp = await fetch(url,{method:"HEAD"});

      if(resp.ok){

        const img = await fetch(url);
        const blob = await img.blob();

        cache.put(url,img.clone());

        return blob;

      }

    }catch(e){}

  }

  return null;
}

/* =========================
   CONVERTIR BLOB A BASE64
========================= */

function blobToBase64(blob){

  return new Promise(resolve=>{

    const reader = new FileReader();

    reader.onloadend = ()=> resolve(reader.result);

    reader.readAsDataURL(blob);

  });

}

/* =========================
   DIBUJAR TARJETA
========================= */

async function dibujarProducto(p){

  let ty = y;

  doc.rect(x,y,cardW,cardH);

  ty += 5;

  /* IMAGEN */

  const blob = await obtenerImagenProducto(p.codigo);

  if(blob){

    const base64 = await blobToBase64(blob);

    doc.addImage(base64,"JPEG",x+5,ty,cardW-10,20);

  }

  ty += 25;

  doc.setFontSize(7);

  doc.text(`Código: ${p.codigo}`,x+2,ty);

  ty += 3;

  let nombre = doc.splitTextToSize(p.producto,cardW-4);

  doc.text(nombre,x+2,ty);

  ty += nombre.length * 3;

  doc.text(`Marca: ${p.marca}`,x+2,ty);
  ty+=3;

  doc.text(`Unidad: ${p.unidad}`,x+2,ty);
  ty+=3;

  doc.text(`Master: ${p.master}`,x+2,ty);
  ty+=3;

  /* PRECIO SOLO LP1 */

  if(listaPrecioActiva === "LP1" && p.LP1){

    doc.setFontSize(8);

    doc.text(`$${p.LP1}`,x+2,ty);

    ty+=4;

  }

  /* RESTRICCIONES */

  if(p.restricciones){

    doc.setTextColor(90);

    let restr = doc.splitTextToSize("⚠ "+p.restricciones,cardW-4);

    restr = restr.slice(0,4);

    doc.text(restr,x+2,ty);

    ty += restr.length * 3;

    doc.setTextColor(0);

  }

}

/* =========================
   SECCIÓN
========================= */

function nuevaPagina(titulo){

  doc.addPage();

  doc.setFontSize(18);

  doc.text(titulo,pageW/2,20,{align:"center"});

  x = margen;
  y = 40;
  col = 0;

}

/* =========================
   FILTRAR SECCIONES
========================= */

const promociones = productos.filter(p=>p.promo).slice(0,12);

const top = productos.filter(p=>p.top).slice(0,16);

const resto = productos.filter(p=>!p.promo && !p.top).slice(0,20);

/* =========================
   PROMOCIONES
========================= */

doc.setFontSize(18);
doc.text("PROMOCIONES",pageW/2,20,{align:"center"});

for(let i=0;i<promociones.length;i++){

  await dibujarProducto(promociones[i]);

  col++;

  if(col===cols){

    col=0;
    x=margen;
    y+=cardH;

    if(y + cardH > pageH){

      nuevaPagina("PROMOCIONES");

    }

  }else{

    x+=cardW;

  }

  setProgreso((i/promociones.length)*30);

}

/* =========================
   TOP
========================= */

nuevaPagina("PRODUCTOS TOP");

for(let i=0;i<top.length;i++){

  await dibujarProducto(top[i]);

  col++;

  if(col===cols){

    col=0;
    x=margen;
    y+=cardH;

    if(y + cardH > pageH){

      nuevaPagina("PRODUCTOS TOP");

    }

  }else{

    x+=cardW;

  }

  setProgreso(30 + (i/top.length)*30);

}

/* =========================
   RESTO
========================= */

nuevaPagina("PRODUCTOS");

for(let i=0;i<resto.length;i++){

  await dibujarProducto(resto[i]);

  col++;

  if(col===cols){

    col=0;
    x=margen;
    y+=cardH;

    if(y + cardH > pageH){

      nuevaPagina("PRODUCTOS");

    }

  }else{

    x+=cardW;

  }

  setProgreso(60 + (i/resto.length)*40);

}

doc.save("Catalogo MAESRA 2026.pdf");

setProgreso(100);

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