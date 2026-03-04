let productos = [];
let listaPrecioActiva = localStorage.getItem("listaPrecio") || "LP4";
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let cliente = localStorage.getItem("cliente");
let logoBase64 = null;

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

async function cargarImagenOptimizada(rutaImagen, tamañoMax = 200) {

    try {

        // Ajusta si tus imágenes están en github.io
        const urlBase = "https://cesaralarconmaesra.github.io/catalogo-maesra/img/"; 
        const urlCompleta = rutaImagen.startsWith("http")
            ? rutaImagen
            : urlBase + rutaImagen;

        const response = await fetch(urlCompleta);
        const blob = await response.blob();

        return new Promise((resolve) => {

            const img = new Image();
            img.onload = function () {

                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                let width = img.width;
                let height = img.height;

                // Mantener proporción
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

                // Compresión JPEG 0.75 = buena calidad, menor peso
                const base64 = canvas.toDataURL("image/jpeg", 0.75);

                resolve(base64);
            };

            img.src = URL.createObjectURL(blob);
        });

    } catch (error) {
        console.error("Error cargando imagen:", rutaImagen);
        return null;
    }
}
async function generarCatalogoCompletoPDF() {

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "mm", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    let numeroPagina = 1;

    const fecha = new Date().toLocaleDateString();

    // =========================
    // PORTADA ELEGANTE
    // =========================

    function portada() {

        doc.setFillColor(245, 245, 245);
        doc.rect(0, 0, pageWidth, pageHeight, "F");

        if (logoBase64) {
            doc.addImage(logoBase64, "PNG", pageWidth/2 - 40, 40, 80, 40);
        }

        doc.setFontSize(28);
        doc.setTextColor(40);
        doc.text("CATÁLOGO GENERAL", pageWidth/2, 110, { align: "center" });

        doc.setFontSize(14);
        doc.setTextColor(80);
        doc.text("Actualizado: " + fecha, pageWidth/2, 125, { align: "center" });

        if (listaPrecioActiva) {
            doc.setFontSize(12);
            doc.setTextColor(200,0,0);
            doc.text("Lista de Precios LP1 Activa", pageWidth/2, 140, { align: "center" });
        } else {
            doc.setFontSize(12);
            doc.setTextColor(120);
            doc.text("Catálogo informativo sin precios", pageWidth/2, 140, { align: "center" });
        }

        doc.addPage();
        numeroPagina++;
    }

    // =========================
    // NUMERACIÓN
    // =========================

    function agregarNumeroPagina() {
        doc.setFontSize(8);
        doc.setTextColor(120);
        doc.text("Página " + numeroPagina, pageWidth - 20, pageHeight - 5);
        numeroPagina++;
    }

    // =========================
    // SECCIONES 12 POR PÁGINA
    // =========================

    async function imprimirSeccion(titulo, listaProductos) {

        if (listaProductos.length === 0) return;

        const marginX = 10;
        const marginTop = 22;
        const columnas = 3;
        const filas = 4;
        const gapX = 6;
        const gapY = 6;

        const usableWidth = pageWidth - (marginX * 2) - (gapX * (columnas - 1));
        const cardWidth = usableWidth / columnas;

        const usableHeight = pageHeight - marginTop - 20;
        const cardHeight = (usableHeight - (gapY * (filas - 1))) / filas;

        let index = 0;

        function encabezado() {
            doc.setFontSize(15);
            doc.setTextColor(0);
            doc.text(titulo, pageWidth/2, 14, { align: "center" });

            doc.setDrawColor(180);
            doc.line(marginX, 18, pageWidth - marginX, 18);

            if (logoBase64) {
                doc.addImage(logoBase64, "PNG", pageWidth - 28, 5, 18, 10);
            }
        }

        encabezado();

        for (let p of listaProductos) {

            const posicion = index % 12;

            if (posicion === 0 && index !== 0) {
                agregarNumeroPagina();
                doc.addPage();
                encabezado();
            }

            const col = posicion % columnas;
            const row = Math.floor(posicion / columnas);

            const x = marginX + col * (cardWidth + gapX);
            const y = marginTop + row * (cardHeight + gapY);

            doc.setDrawColor(220);
            doc.rect(x, y, cardWidth, cardHeight);

            // Imagen
            const img = await cargarImagenOptimizada(p.imagen, 200);
            if (img) {
                const imgSize = cardWidth * 0.55;
                doc.addImage(img, "JPEG",
                    x + (cardWidth - imgSize)/2,
                    y + 4,
                    imgSize,
                    imgSize
                );
            }

            let textY = y + cardWidth * 0.55 + 8;

            doc.setFontSize(6.8);
            doc.setTextColor(0);

            doc.text("Código: " + p.codigo, x + 3, textY);
            textY += 4;

            const desc = doc.splitTextToSize(p.producto, cardWidth - 6);
            doc.text(desc.slice(0,2), x + 3, textY);
            textY += 8;

            doc.text("Marca: " + p.marca, x + 3, textY);
            textY += 4;

            doc.text("U: " + p.unidad + " | M:" + p.master + " I:" + p.inner, x + 3, textY);
            textY += 4;

            if (p.restricciones) {
                doc.setTextColor(120);
                doc.text(p.restricciones, x + 3, textY);
                doc.setTextColor(0);
            }

            // ===== PRECIOS SOLO SI LP1 ACTIVA =====

            if (listaPrecioActiva) {

                const precioNormal = p.precioLP1?.toFixed(2) || "N/D";
                const precioPromo = p.precioPromocion?.toFixed(2);
                const priceY = y + cardHeight - 6;

                if (precioPromo && Number(precioPromo) > 0) {

                    doc.setFontSize(6);
                    doc.setTextColor(120);
                    doc.text("$" + precioNormal, x + cardWidth - 3, priceY - 4, { align: "right" });

                    doc.setFontSize(8.5);
                    doc.setTextColor(200, 0, 0);
                    doc.text("$" + precioPromo, x + cardWidth - 3, priceY, { align: "right" });

                } else {
                    doc.setFontSize(8.5);
                    doc.setTextColor(0);
                    doc.text("$" + precioNormal, x + cardWidth - 3, priceY, { align: "right" });
                }

                doc.setTextColor(0);
            }

            index++;
        }

        agregarNumeroPagina();
        doc.addPage();
    }

    // =========================
    // EJECUCIÓN
    // =========================

    portada();

    const promociones = productos.filter(p => Number(p.precioPromocion) > 0);
    const masVendidos = productos.filter(p => p.top === true);

    await imprimirSeccion("PROMOCIONES", promociones);
    await imprimirSeccion("MÁS VENDIDOS", masVendidos);

    const marcas = [...new Set(productos.map(p => p.marca))];

    for (let marca of marcas) {
        const productosMarca = productos.filter(p => p.marca === marca);
        await imprimirSeccion("MARCA: " + marca, productosMarca);
    }

    doc.save("Catalogo_MAESRA.pdf");
}