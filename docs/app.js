let productos = [];
let productosFamilias = [];
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

      if (inputPassword.value === "MaesraAbril2026") {

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

  Promise.all([
    fetch("productos.json").then(r => r.json()),
    fetch("productos_familias.json").then(r => r.json())
  ])
  .then(([productosData, familiasData]) => {

    productos = productosData;
    productosFamilias = familiasData;

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

        return new Promise(resolve => {

            const reader = new FileReader();

            reader.onloadend = () => {

                logoBase64 = reader.result;
                resolve();

            };

            reader.readAsDataURL(blob);

        });

    } catch(e){

        console.warn("No se pudo cargar logo");

    }

}


// ===============================
// OPTIMIZADOR DE IMÁGENES
// ===============================

async function cargarImagenOptimizada(rutaImagen, tamañoMax = 200){

    if(!rutaImagen) return null;

    if(cacheImagenes[rutaImagen]){
        return cacheImagenes[rutaImagen];
    }

    try{

        const url = rutaImagen.startsWith("http")
            ? rutaImagen
            : URL_BASE_IMAGENES + rutaImagen;

        const response = await fetch(url);

        if(!response.ok){
            console.warn("Imagen no encontrada:", url);
            return null;
        }

        const blob = await response.blob();

        return new Promise(resolve => {

            const img = new Image();

            img.onload = function(){

                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                let w = img.width;
                let h = img.height;

                if(w > h){

                    if(w > tamañoMax){
                        h *= tamañoMax / w;
                        w = tamañoMax;
                    }

                }else{

                    if(h > tamañoMax){
                        w *= tamañoMax / h;
                        h = tamañoMax;
                    }

                }

                canvas.width = w;
                canvas.height = h;

                ctx.drawImage(img,0,0,w,h);

                const base64 = canvas.toDataURL("image/jpeg",0.75);

                cacheImagenes[rutaImagen] = base64;

                resolve(base64);

            };

            img.onerror = () => resolve(null);

            img.src = URL.createObjectURL(blob);

        });

    }catch(e){

        console.warn("Error cargando imagen", rutaImagen);
        return null;

    }

}


// ===============================
// PRECARGA MASIVA DE IMÁGENES
// ===============================

async function precargarImagenes(productos, lote = 20){

    const imagenes = productos.map(p=>p.imagen).filter(Boolean);

    let index = 0;

    async function worker(){

        while(index < imagenes.length){

            const actual = imagenes[index++];

            if(!cacheImagenes[actual]){
                await cargarImagenOptimizada(actual,200);
            }

        }

    }

    const workers = [];

    for(let i=0;i<lote;i++){
        workers.push(worker());
    }

    await Promise.all(workers);

}



// ===============================
// GENERADOR PDF COMPLETO
// ===============================

async function generarCatalogoCompletoPDF(){

    await mostrarProgreso();

    document.getElementById("progresoTexto").innerText =
        "Cargando imágenes...";

    await precargarImagenes(productosFamilias,20);

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF("p","mm","letter");

    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    const margen = 10;

    let contadorGlobal = 0;
    const totalGrupos = productosFamilias.length;

    // ==================================================
    // SEPARAR INDIVIDUALES Y FAMILIAS
    // ==================================================

    const individuales =
        productosFamilias.filter(g => !g.esFamilia);

    const familias =
        productosFamilias.filter(g => g.esFamilia);

    // ==================================================
    // PORTADA PRODUCTOS INDIVIDUALES
    // ==================================================

    doc.setFontSize(18);
    doc.text("PRODUCTOS", pageW/2, 20, {align:"center"});

    let cols = 4;
    let filas = 5;

    let cardW = (pageW - margen*2)/cols;
    let cardH = (pageH - 45)/filas;

    let x = margen;
    let y = 35;

    let col = 0;
    let fila = 0;

    // ==================================================
    // DIBUJAR FICHA INDIVIDUAL
    // ==================================================

    async function dibujarProducto(p){

        const padding = 3;

        doc.setDrawColor(220);
        doc.rect(x,y,cardW,cardH);

        let ty = y + padding;

        const base64 =
            cacheImagenes[p.imagen] ||
            await cargarImagenOptimizada(p.imagen,300);

        if(base64){

            const img = new Image();

            await new Promise(resolve=>{
                img.onload = resolve;
                img.src = base64;
            });

            const maxW = cardW - 8;
            const maxH = cardH * 0.38;

            let w = img.width;
            let h = img.height;

            const ratio =
                Math.min(maxW/w,maxH/h);

            w*=ratio;
            h*=ratio;

            const imgX =
                x + (cardW-w)/2;

            doc.addImage(
                base64,
                "JPEG",
                imgX,
                ty,
                w,
                h
            );

            ty += h + 3;
        }

        doc.setFontSize(6);
        doc.setTextColor(100);

        doc.text(
            `Código: ${p.codigo}`,
            x+padding,
            ty
        );

        ty += 3;

        doc.setFontSize(7);
        doc.setTextColor(0);

        let nombre =
            doc.splitTextToSize(
                p.producto,
                cardW - 6
            );

        nombre = nombre.slice(0,3);

        doc.text(nombre,x+padding,ty);

        ty += nombre.length*3;

        doc.setFontSize(6);

        doc.text(
            `Marca: ${p.marca || ""}`,
            x+padding,
            ty
        );

        ty += 3;

        doc.text(
            `Unidad:${p.unidad || ""}`,
            x+padding,
            ty
        );

        ty += 3;

        doc.text(
            `Master:${p.master || ""}`,
            x+padding,
            ty
        );

        ty += 3;

        doc.text(
            `Inner:${p.inner || ""}`,
            x+padding,
            ty
        );
    }

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

    function nuevaPaginaProductos(){

        doc.addPage();

        doc.setFontSize(18);

        doc.text(
            "PRODUCTOS",
            pageW/2,
            20,
            {align:"center"}
        );

        x=margen;
        y=35;

        col=0;
        fila=0;
    }

    // ==================================================
    // PRODUCTOS INDIVIDUALES
    // ==================================================

    for(const grupo of individuales){

        const p = grupo.articulos[0];

        p.imagen = grupo.imagen;
        p.marca = grupo.marca;

        await dibujarProducto(p);

        siguiente();

        if(fila>=filas){
            nuevaPaginaProductos();
        }
    }

    // ==================================================
    // INICIO SECCIÓN FAMILIAS
    // ==================================================

    doc.addPage();

    doc.setFontSize(18);

    doc.text(
        "FAMILIAS DE PRODUCTOS",
        pageW/2,
        20,
        {align:"center"}
    );

    let yActual = 35;

    // ==================================================
    // DIBUJAR FAMILIA
    // ==================================================

    async function dibujarFamilia(familia){

        const alturaBase =
            40 +
            (familia.articulos.length * 5);

        if(yActual + alturaBase > pageH - 15){

            doc.addPage();

            doc.setFontSize(18);

            doc.text(
                "FAMILIAS DE PRODUCTOS",
                pageW/2,
                20,
                {align:"center"}
            );

            yActual = 35;
        }

        doc.setFontSize(14);

        doc.text(
            familia.familia,
            45,
            yActual + 5
        );

        const base64 =
            cacheImagenes[familia.imagen] ||
            await cargarImagenOptimizada(
                familia.imagen,
                250
            );

        if(base64){

            try{

                doc.addImage(
                    base64,
                    "JPEG",
                    10,
                    yActual,
                    28,
                    28
                );

            }catch(e){}
        }

        let inicioTablaX = 45;
        let filaY = yActual + 15;

        doc.setFontSize(8);

        doc.text("Marca",inicioTablaX,filaY);
        doc.text("Código",inicioTablaX+25,filaY);
        doc.text("Producto",inicioTablaX+55,filaY);
        doc.text("Unidad",inicioTablaX+120,filaY);
        doc.text("M",inicioTablaX+138,filaY);
        doc.text("I",inicioTablaX+148,filaY);

        filaY += 4;

        for(const a of familia.articulos){

            const productoLineas =
                doc.splitTextToSize(
                    a.producto,
                    60
                );

            const altoFila =
                Math.max(
                    4,
                    productoLineas.length * 4
                );

            doc.setFontSize(7);

            doc.text(
                familia.marca || "",
                inicioTablaX,
                filaY
            );

            doc.text(
                a.codigo,
                inicioTablaX+25,
                filaY
            );

            doc.text(
                productoLineas,
                inicioTablaX+55,
                filaY
            );

            doc.text(
                a.unidad || "",
                inicioTablaX+120,
                filaY
            );

            doc.text(
                String(a.master || ""),
                inicioTablaX+138,
                filaY
            );

            doc.text(
                String(a.inner || ""),
                inicioTablaX+148,
                filaY
            );

            filaY += altoFila;
        }

        yActual = filaY + 10;

        contadorGlobal++;

        actualizarProgreso(
            contadorGlobal,
            totalGrupos
        );

        await new Promise(
            r=>setTimeout(r,0)
        );
    }

    // ==================================================
    // FAMILIAS
    // ==================================================

    for(const familia of familias){

        await dibujarFamilia(familia);

    }

    doc.save(
        "Catalogo MAESRA 2026.pdf"
    );

    mostrarProgreso();
}


// ===============================
// PROGRESO
// ===============================

async function mostrarProgreso(){

const cont=document.getElementById("progresoContainer");

cont.style.display="block";

document.getElementById("barraProgreso").style.width="0%";
document.getElementById("progresoTexto").innerText="0%";

await new Promise(r=>requestAnimationFrame(r));
await new Promise(r=>setTimeout(r,50));

}

function ocultarProgreso(){

document.getElementById("progresoContainer").style.display="none";

}

function actualizarProgreso(actual,total){

const barra=document.getElementById("barraProgreso");
const texto=document.getElementById("progresoTexto");

if(!barra||!texto) return;

const porcentaje=Math.floor((actual/total)*100);

barra.style.width=porcentaje+"%";
texto.innerText=porcentaje+"%";

}