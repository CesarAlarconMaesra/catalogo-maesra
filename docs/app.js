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
    const doc = new jsPDF("p","mm","a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    mostrarProgreso();

    const totalProductos = productos.length;
    let contadorGlobal = 0;

    let numeroPagina = 1;
    const fecha = new Date().toLocaleDateString();

    await cargarLogo();

    // ===============================
    // PORTADA
    // ===============================

    doc.setFillColor(245,245,245);
    doc.rect(0,0,pageWidth,pageHeight,"F");

    if(logoBase64){
        doc.addImage(logoBase64,"JPEG",pageWidth/2-45,40,90,45);
    }

    doc.setFontSize(26);
    doc.text("CATÁLOGO GENERAL",pageWidth/2,110,{align:"center"});

    doc.setFontSize(13);
    doc.text("Actualizado: "+fecha,pageWidth/2,125,{align:"center"});

    if(listaPrecioActiva === "LP1"){
        doc.setTextColor(200,0,0);
        doc.text("Lista de Precios LP1 Activa",pageWidth/2,140,{align:"center"});
    }else{
        doc.setTextColor(120);
        doc.text("Catálogo informativo sin precios",pageWidth/2,140,{align:"center"});
    }

    doc.addPage();
    numeroPagina++;

    function agregarNumeroPagina(){
        doc.setFontSize(8);
        doc.setTextColor(120);
        doc.text("Página "+numeroPagina,pageWidth-20,pageHeight-5);
        numeroPagina++;
    }
function dibujarHeader(doc, titulo){

const pageWidth = doc.internal.pageSize.getWidth();

doc.setFontSize(18);
doc.setTextColor(0);
doc.text(titulo, pageWidth/2, 20, {align:"center"});

doc.setDrawColor(180);
doc.line(10,25,pageWidth-10,25);

if(logoBase64){
doc.addImage(logoBase64,"JPEG",pageWidth-35,8,22,10);
}

}

async function imprimirSeccion(doc, productos, titulo, productosPorPagina) {

const pageWidth = doc.internal.pageSize.getWidth();

const margenX = 10;
const margenY = 35;

const columnas = titulo === "PROMOCIONES" ? 3 : 4;
const filas = titulo === "PROMOCIONES" ? 4 : 4;

const cardWidth = (pageWidth - (margenX * 2)) / columnas;
const cardHeight = titulo === "PROMOCIONES" ? 60 : 50;

let index = 0;

dibujarHeader(doc, titulo);

for (const producto of productos) {

let posicion = index % productosPorPagina;

if (posicion === 0 && index !== 0) {

agregarNumeroPagina();
doc.addPage();
dibujarHeader(doc, titulo);

}

let col = posicion % columnas;
let row = Math.floor(posicion / columnas);

let x = margenX + col * cardWidth;
let y = margenY + row * cardHeight;

dibujarTarjetaProducto(doc, producto, x, y, cardWidth, cardHeight);

index++;

}

}

async function dibujarTarjetaProducto(doc, producto, x, y, width, height) {

doc.setDrawColor(210);
doc.rect(x, y, width - 4, height - 4);

let imgY = y + 3;

let img = await cargarImagenCatalogo(producto.imagen);

if (img) {
doc.addImage(img, "JPEG", x + width/2 - 10, imgY, 20, 20);
}

let textY = y + 25;

doc.setFontSize(7);

doc.text(`Código: ${producto.codigo}`, x + 3, textY);

textY += 4;

let nombre = doc.splitTextToSize(producto.producto, width - 8);
doc.text(nombre, x + 3, textY);

textY += nombre.length * 3.5 + 2;

doc.text(`Marca: ${producto.marca}`, x + 3, textY);

textY += 4;

doc.text(`Unidad: ${producto.unidad} | Master:${producto.master} Inner:${producto.inner}`, x + 3, textY);

textY += 4;


/* RESTRICCIONES */
if (producto.restricciones) {

doc.setTextColor(80);

let restricciones = doc.splitTextToSize(producto.restricciones, width - 8);

doc.text(restricciones, x + 3, textY);

doc.setTextColor(0);

}


/* ETIQUETA PROMO */
if (producto.precioPromocion) {

doc.setFillColor(200,0,0);
doc.rect(x + width - 18, y + 1, 16, 5, "F");

doc.setTextColor(255);
doc.setFontSize(6);
doc.text("PROMO", x + width - 16, y + 4);

doc.setTextColor(0);

}


/* ETIQUETA TOP */
if (producto.top === true) {

doc.setFillColor(255,140,0);
doc.rect(x + 1, y + 1, 14, 5, "F");

doc.setTextColor(255);
doc.setFontSize(6);
doc.text("TOP", x + 4, y + 4);

doc.setTextColor(0);

}

}
        /* ===============================
           IMAGEN
        =============================== */

async function cargarImagenCatalogo(ruta) {

const base = "https://cesaralarconmaesra.github.io/catalogo-maesra/";

let extensiones = ["jpg","png","jpeg","webp"];

for (let ext of extensiones) {

try {

let url = base + ruta.replace(/\.[^/.]+$/, "") + "." + ext;

let res = await fetch(url);

if (res.ok) {

let blob = await res.blob();

return await new Promise(resolve => {

let reader = new FileReader();

reader.onload = () => resolve(reader.result);

reader.readAsDataURL(blob);

});

}

}catch(e){}

}

return null;

}
   


    agregarNumeroPagina();


    const promociones = productos.filter(p =>
    Number(p.precioPromocion) > 0 &&
    Number(p.precioPromocion) < Number(p.precioLP4)
);
    const masVendidos = productos.filter(p=>p.top===true);

await imprimirSeccion(doc, promociones, "PROMOCIONES", 12);
await imprimirSeccion(doc, masVendidos, "PRODUCTOS TOP", 16);
    const marcas = [...new Set(productos.map(p=>p.marca))];

    for(let marca of marcas){
        const listaMarca = productos.filter(p=>p.marca===marca);
        await imprimirSeccion(doc, listaMarca, "MARCA: " + marca, 20);
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