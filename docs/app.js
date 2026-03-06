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

async function cargarLogo(){

if(logoBase64) return;

try{

const res = await fetch("img/MAESRA.jpg");
const blob = await res.blob();

return new Promise(resolve=>{

const reader = new FileReader();

reader.onloadend=()=>{
logoBase64 = reader.result;
resolve();
};

reader.readAsDataURL(blob);

});

}catch(e){
console.warn("No se pudo cargar logo");
}

}


// ===============================
// CARGAR IMAGEN DESDE CACHE
// ===============================

async function cargarImagenOptimizada(rutaImagen, tamañoMax = 200){

if(!rutaImagen) return null;

if(cacheImagenes[rutaImagen]) return cacheImagenes[rutaImagen];

try{

const cache = await caches.open("catalogo-cache-v21");
const cached = await cache.match(urlImagen);

let response = await cache.match(rutaImagen);

if(!response){

const url = rutaImagen.startsWith("http")
? rutaImagen
: URL_BASE_IMAGENES + rutaImagen.replace(/^\/+/, "");

response = await fetch(url);

}

if(!response || !response.ok) return null;

const blob = await response.blob();

return new Promise(resolve=>{

const img = new Image();

img.onload=function(){

const canvas=document.createElement("canvas");
const ctx=canvas.getContext("2d");

let w=img.width;
let h=img.height;

if(w>h){
if(w>tamañoMax){
h*=tamañoMax/w;
w=tamañoMax;
}
}else{
if(h>tamañoMax){
w*=tamañoMax/h;
h=tamañoMax;
}
}

canvas.width=w;
canvas.height=h;

ctx.drawImage(img,0,0,w,h);

const base64 = canvas.toDataURL("image/jpeg",0.75);

cacheImagenes[rutaImagen]=base64;

URL.revokeObjectURL(img.src);

resolve(base64);

};

img.src = URL.createObjectURL(blob);

});

}catch(e){

console.warn("imagen no encontrada",rutaImagen);
return null;

}

}


// ===============================
// GENERADOR PDF
// ===============================

async function generarCatalogoCompletoPDF(){

mostrarProgreso();

const { jsPDF } = window.jspdf;
const doc = new jsPDF("p","mm","a4");

const pageWidth = doc.internal.pageSize.getWidth();
const pageHeight = doc.internal.pageSize.getHeight();

await cargarLogo();

let pagina = 1;
let contador = 0;
const total = productos.length;


// ===============================
// NUMERO PAGINA
// ===============================

function numeroPagina(){

doc.setFontSize(8);
doc.setTextColor(120);
doc.text("Página "+pagina,pageWidth-25,pageHeight-5);

pagina++;

}


// ===============================
// HEADER
// ===============================

function header(titulo){

doc.setFontSize(18);
doc.setTextColor(0);
doc.text(titulo,pageWidth/2,20,{align:"center"});

doc.setDrawColor(180);
doc.line(10,25,pageWidth-10,25);

if(logoBase64){
doc.addImage(logoBase64,"JPEG",pageWidth-35,8,22,10);
}

}


// ===============================
// CONFIGURACION LAYOUT
// ===============================

function layout(tipo){

if(tipo==="promo") return {cols:3,rows:4,total:12,height:60};
if(tipo==="top") return {cols:4,rows:4,total:16,height:55};

return {cols:4,rows:5,total:20,height:50};

}


// ===============================
// TARJETA PRODUCTO
// ===============================

async function dibujarTarjeta(p,x,y,w,h){

let img = await cargarImagenOptimizada(p.imagen,200);

if(img){
doc.addImage(img,"JPEG",x+w/2-15,y+3,30,22);
}

let ty = y+28;

doc.setFontSize(7);

doc.text(`Código: ${p.codigo}`,x+2,ty);
ty+=4;

let nombre = doc.splitTextToSize(p.producto,w-4);
doc.text(nombre,x+2,ty);

ty += nombre.length*3 +1;

doc.text(`Marca: ${p.marca || ""}`,x+2,ty);
ty+=3;

doc.text(`Unidad:${p.unidad || ""}`,x+2,ty);
ty+=3;

doc.text(`Master:${p.master || "-"} Inner:${p.inner || "-"}`,x+2,ty);
ty+=3;


// ===============================
// RESTRICCIONES
// ===============================

if(p.restricciones){

doc.setTextColor(90);

let restr = doc.splitTextToSize("⚠ "+p.restricciones,w-4);

doc.text(restr,x+2,ty);

doc.setTextColor(0);

}


// ===============================
// PRECIOS SOLO SI LP1
// ===============================

if(listaPrecioActiva==="LP1"){

let py = y+h-4;

doc.setFontSize(8);

if(Number(p.precioPromocion)>0){

doc.setTextColor(200,0,0);
doc.text("$"+Number(p.precioPromocion).toFixed(2),x+w-22,py);

doc.setTextColor(120);
doc.text("$"+Number(p.precioLP1).toFixed(2),x+w-40,py);

}else{

doc.setTextColor(0);
doc.text("$"+Number(p.precioLP1).toFixed(2),x+w-22,py);

}

doc.setTextColor(0);

}


// ===============================
// ETIQUETA PROMO
// ===============================

if(Number(p.precioPromocion)>0){

doc.setFillColor(200,0,0);
doc.rect(x+w-18,y+1,17,5,"F");

doc.setTextColor(255);
doc.setFontSize(6);
doc.text("PROMO",x+w-15,y+4);

doc.setTextColor(0);

}


// ===============================
// ETIQUETA TOP
// ===============================

if(p.top===true){

doc.setFillColor(255,140,0);
doc.rect(x+1,y+1,15,5,"F");

doc.setTextColor(255);
doc.setFontSize(6);
doc.text("TOP",x+4,y+4);

doc.setTextColor(0);

}

contador++;
actualizarProgreso(contador,total);

}


// ===============================
// IMPRIMIR SECCION
// ===============================

async function imprimirSeccion(lista,titulo,tipo){

if(lista.length===0) return;

const cfg = layout(tipo);

const margenX=10;
const margenY=35;

const w=(pageWidth-(margenX*2))/cfg.cols;
const h=cfg.height;

doc.addPage();
header(titulo);

let index=0;

for(const p of lista){

let pos=index%cfg.total;

if(pos===0 && index!==0){

numeroPagina();
doc.addPage();
header(titulo);

}

let col = pos%cfg.cols;
let row = Math.floor(pos/cfg.cols);

let x = margenX + col*w;
let y = margenY + row*h;

await dibujarTarjeta(p,x,y,w-3,h-3);

index++;

}

numeroPagina();

}


// ===============================
// PORTADA
// ===============================

doc.setFillColor(245,245,245);
doc.rect(0,0,pageWidth,pageHeight,"F");

if(logoBase64){
doc.addImage(logoBase64,"JPEG",pageWidth/2-50,40,100,45);
}

doc.setFontSize(28);
doc.text("CATÁLOGO MAESRA",pageWidth/2,120,{align:"center"});

doc.setFontSize(14);

if(listaPrecioActiva==="LP1"){
doc.text("Catálogo con precios",pageWidth/2,135,{align:"center"});
}else{
doc.text("Catálogo informativo",pageWidth/2,135,{align:"center"});
}


// ===============================
// SECCIONES
// ===============================

const promociones = productos.filter(p=>Number(p.precioPromocion)>0);

const top = productos.filter(p=>p.top===true);

await imprimirSeccion(promociones,"PROMOCIONES","promo");

await imprimirSeccion(top,"PRODUCTOS TOP","top");


// ===============================
// POR MARCAS
// ===============================

const marcas=[...new Set(productos.map(p=>p.marca))];

for(const m of marcas){

const lista=productos.filter(p=>p.marca===m);

await imprimirSeccion(lista,"MARCA: "+m,"catalogo");

}


// ===============================
// GUARDAR PDF
// ===============================

doc.save("Catalogo MAESRA 2026.pdf");

ocultarProgreso();

}


// ===============================
// BARRA PROGRESO
// ===============================

function mostrarProgreso(){
document.getElementById("progresoContainer").style.display="block";
}

function ocultarProgreso(){
document.getElementById("progresoContainer").style.display="none";
}

function actualizarProgreso(actual,total){

const porcentaje=Math.floor((actual/total)*100);

document.getElementById("barraProgreso").style.width=porcentaje+"%";
document.getElementById("progresoTexto").innerText=porcentaje+"%";

}