let productos = [];
let listaPrecioActiva = "LP4";
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let cliente = localStorage.getItem("cliente");

/* ===============================
CARRUSEL AUTOMÁTICO
=============================== */

function iniciarCarrusel(idContenedor) {

  const contenedor = document.getElementById(idContenedor);
  if (!contenedor) return;

  let scroll = 0;

  setInterval(() => {

    const cardWidth =
      contenedor.children[0]?.offsetWidth || 220;

    scroll += cardWidth + 20;

    if (scroll >= contenedor.scrollWidth - contenedor.clientWidth) {
      scroll = 0;
    }

    contenedor.scrollTo({
      left: scroll,
      behavior: "smooth"
    });

  }, 2500);

}

document.addEventListener("DOMContentLoaded", () => {

  const carritoGuardado = localStorage.getItem("carrito");

  if (carritoGuardado) {
    carrito = JSON.parse(carritoGuardado);
  }

  actualizarContadorCarrito();
  calcularTotalCarrito();
  actualizarIndicadorLista();

  iniciarEventosUI();

});

function iniciarEventosUI(){

  const btnPrecio = document.getElementById("btnPrecio");

  if(btnPrecio){
    btnPrecio.onclick = toggleListaPrecio;
  }

}
if (!cliente) {
  cliente = prompt("Ingresa el nombre del cliente:");
  localStorage.setItem("cliente", cliente);
}

if (localStorage.getItem("listaPrecio") === "LP1") {
  listaPrecioActiva = "LP1";
} else {
  listaPrecioActiva = "LP4";
}

function actualizarIndicadorLista() {
  const info = document.getElementById("infoLista");
  if (info) {
    info.textContent = "📊 Lista activa: " + listaPrecioActiva;
  }
}

/* ===============================
CARGAR PRODUCTOS
=============================== */

fetch("productos.json")
  .then(res => res.json())
  .then(data => {

    productos = data;

    productos.sort((a, b) => {
      const aPromo = Number(a.precioPromocion) > 0 &&
        Number(a.precioPromocion) < Number(a.precioLP4);

      const bPromo = Number(b.precioPromocion) > 0 &&
        Number(b.precioPromocion) < Number(b.precioLP4);

      return bPromo - aPromo;
    });

    mostrarPromociones(productos);
    mostrarTopProductos(productos);
    mostrarProductos(productos);

  });

/* ===============================
MOSTRAR PRODUCTOS
=============================== */

function mostrarProductos(lista) {

  const contenedor = document.getElementById("listaProductos");
  if (!contenedor) return;

  contenedor.innerHTML = "";

  lista.forEach(p => {

    const enPromo =
      Number(p.precioPromocion) > 0 &&
      Number(p.precioPromocion) < Number(p.precioLP4);

    let bloquePrecio = "";

    if (enPromo) {

      bloquePrecio = `
        <div class="badge-promo">🔥 PROMOCIÓN</div>
        <div class="precio-anterior">
          $ ${Number(p.precioLP4).toFixed(2)}
        </div>
        <div class="precio-promo">
          $ ${Number(p.precioPromocion).toFixed(2)}
        </div>
        ${p.restricciones ? `
        <div class="restricciones">
          ${p.restricciones}
        </div>` : ""}
      `;

    } else {

      bloquePrecio = `
        <div class="precio-normal">
          $ ${Number(p.precioLP4).toFixed(2)}
        </div>
      `;

    }

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${p.imagen}" onerror="this.src='img/sin_imagen.jpg'">
      <h4>${p.producto}</h4>
      <p>${p.codigo}</p>
      <div style="font-weight:bold;color:#1E88E5;">
        ${bloquePrecio}
      </div>
    `;

    card.onclick = () => abrirDetalle(p);

    contenedor.appendChild(card);

  });

}

/* ===============================
PRODUCTOS TOP
=============================== */

function mostrarTopProductos(lista){

  const contenedor = document.getElementById("topProductos");
  if(!contenedor) return;

  contenedor.innerHTML="";

  const top = lista.filter(p => p.top === true);

  const duplicado = [...top, ...top]; // efecto infinito

  duplicado.forEach(p=>{

    const card = document.createElement("div");
    card.className="card-top";

    card.innerHTML=`
      <img src="${p.imagen}" onerror="this.src='img/sin_imagen.jpg'">
      <h4>${p.producto}</h4>
      <p>${p.codigo}</p>
    `;

    card.onclick = ()=> abrirDetalle(p);

    contenedor.appendChild(card);

  });

  iniciarCarrusel("topProductos");

}

/* ===============================
PROMOCIONES
=============================== */

function mostrarPromociones(lista){

  const contenedor = document.getElementById("promoTrack");
  if(!contenedor) return;

  contenedor.innerHTML="";

  const promos = lista.filter(p =>
    Number(p.precioPromocion) > 0 &&
    Number(p.precioPromocion) < Number(p.precioLP4)
  );

  const duplicado = [...promos, ...promos];

  duplicado.forEach(p=>{

    const card = document.createElement("div");
    card.className="card-promo";

    card.innerHTML=`
      <img src="${p.imagen}" onerror="this.src='img/sin_imagen.jpg'">
      <h4>${p.producto}</h4>
      <p>${p.codigo}</p>
      <div class="precio-promo">$${Number(p.precioPromocion).toFixed(2)}</div>
    `;

    card.onclick = ()=> abrirDetalle(p);

    contenedor.appendChild(card);

  });

  iniciarCarrusel("promoTrack");

}

/* ===============================
BUSCADOR
=============================== */

const buscador = document.getElementById("buscador");

if (buscador) {

  buscador.addEventListener("input", e => {

    const t = e.target.value.toLowerCase();

    mostrarProductos(
      productos.filter(p =>
        p.producto.toLowerCase().includes(t) ||
        p.codigo.toLowerCase().includes(t) ||
        p.marca.toLowerCase().includes(t)
      )
    );

  });

}

/* ===============================
MODAL DETALLE
=============================== */

function abrirDetalle(p) {

  const precioMostrar =
    listaPrecioActiva === "LP1"
      ? p.precioLP1
      : (
          Number(p.precioPromocion) > 0 &&
          Number(p.precioPromocion) < Number(p.precioLP4)
        )
          ? p.precioPromocion
          : p.precioLP4;

  document.getElementById("modal").classList.remove("oculto");

  document.getElementById("dImagen").src = p.imagen;
  document.getElementById("dNombre").textContent = p.producto;
  document.getElementById("dCodigo").textContent = "Código: " + p.codigo;
  document.getElementById("dMarca").textContent = "Marca: " + p.marca;
  document.getElementById("dUnidad").textContent = "Unidad: " + p.unidad;
  document.getElementById("dMaster").textContent = "Master: " + p.master;
  document.getElementById("dInner").textContent = "Inner: " + p.inner;
  document.getElementById("dPrecio").textContent =
    "Precio: $" + Number(precioMostrar).toFixed(2);

  document.getElementById("btnAgregarCarrito").onclick = () => {
    agregarAlCarrito(p);
  };

}

document.getElementById("cerrar").onclick = () => {
  document.getElementById("modal").classList.add("oculto");
};

/* ===============================
TOGGLE LISTA PRECIOS
=============================== */

const CLAVE_LP1 = "MaesraFebrero2026";

async function toggleListaPrecio(){

  if (listaPrecioActiva === "LP1") {

    listaPrecioActiva = "LP4";
    localStorage.setItem("listaPrecio", "LP4");

    actualizarIndicadorLista();
    mostrarProductos(productos);

    alert("Lista cambiada a LP4");

    return;

  }

  const pass = prompt("Ingresa la contraseña para ver precios LP1:");

  if (pass === CLAVE_LP1) {

    listaPrecioActiva = "LP1";
    localStorage.setItem("listaPrecio", "LP1");

    actualizarIndicadorLista();
    mostrarProductos(productos);

    await addDoc(collection(db, "eventos"), {
      tipo: "activar_LP1",
      cliente: cliente,
      fecha: new Date()
    });

    gtag('event', 'LP1_activada');

    alert("Lista LP1 activada");

  } else {

    alert("Contraseña incorrecta");

  }

};

/* ===============================
CARRITO
=============================== */

function actualizarContadorCarrito() {

  const contador = document.getElementById("contadorCarrito");

  const totalItems = carrito.reduce((acc, item) =>
    acc + item.cantidad, 0);

  contador.textContent = totalItems;

  contador.style.display =
    totalItems > 0 ? "inline-block" : "none";

}

function calcularTotalCarrito() {

  const total = carrito.reduce((acc, item) => {
    return acc + (item.precio * item.cantidad);
  }, 0);

  document.getElementById("totalCarrito").textContent = total.toFixed(2);
  document.getElementById("totalHeader").textContent = total.toFixed(2);

}

function abrirCarrito() {

  document.getElementById("modalCarrito")
    .classList.remove("oculto");

  renderizarCarrito();

}

function cerrarCarrito() {

  document.getElementById("modalCarrito")
    .classList.add("oculto");

}

function renderizarCarrito() {

  const contenedor =
    document.getElementById("contenidoCarrito");

  contenedor.innerHTML = "";

  if (carrito.length === 0) {

    contenedor.innerHTML = "<p>El carrito está vacío</p>";
    return;

  }

  carrito.forEach((p, index) => {

    const subtotal = p.precio * p.cantidad;

    contenedor.innerHTML += `
      <div class="item-carrito">
        <strong>${p.producto}</strong><br>
        Código: ${p.codigo}<br>
        Precio: $${p.precio.toFixed(2)}<br>

        Cantidad:
        <button onclick="cambiarCantidad(${index}, -1)">➖</button>

        <input type="number"
        value="${p.cantidad}"
        min="1"
        onchange="actualizarCantidad(${index}, this.value)"
        style="width:60px;text-align:center;">

        <button onclick="cambiarCantidad(${index}, 1)">➕</button>

        <br>
        Subtotal: $${subtotal.toFixed(2)}<br>

        <button onclick="eliminarProducto(${index})">
        🗑 Eliminar
        </button>

      </div>
    `;

  });

}

function cambiarCantidad(index, cambio) {

  carrito[index].cantidad += cambio;

  if (carrito[index].cantidad <= 0) {
    carrito.splice(index, 1);
  }

  localStorage.setItem("carrito", JSON.stringify(carrito));

  renderizarCarrito();
  actualizarContadorCarrito();
  calcularTotalCarrito();

}

function actualizarCantidad(index, nuevaCantidad) {

  nuevaCantidad = parseInt(nuevaCantidad);

  if (isNaN(nuevaCantidad) || nuevaCantidad <= 0) {
    carrito.splice(index, 1);
  } else {
    carrito[index].cantidad = nuevaCantidad;
  }

  localStorage.setItem("carrito", JSON.stringify(carrito));

  renderizarCarrito();
  actualizarContadorCarrito();
  calcularTotalCarrito();

}

function eliminarProducto(index) {

  carrito.splice(index, 1);

  localStorage.setItem("carrito", JSON.stringify(carrito));

  renderizarCarrito();
  actualizarContadorCarrito();
  calcularTotalCarrito();

}

function vaciarCarrito() {

  carrito = [];

  localStorage.removeItem("carrito");

  renderizarCarrito();
  actualizarContadorCarrito();
  calcularTotalCarrito();

}

/* ===============================
AGREGAR AL CARRITO
=============================== */

async function agregarAlCarrito(producto) {

  if (!producto) return;

  const existente =
    carrito.find(p => p.codigo === producto.codigo);

  if (existente) {

    existente.cantidad++;

  } else {

    let precioFinal =
      listaPrecioActiva === "LP1"
        ? Number(producto.precioLP1)
        : (
            Number(producto.precioPromocion) > 0 &&
            Number(producto.precioPromocion) < Number(producto.precioLP4)
          )
            ? Number(producto.precioPromocion)
            : Number(producto.precioLP4);

    carrito.push({
      codigo: producto.codigo,
      producto: producto.producto,
      precio: precioFinal,
      cantidad: 1
    });

  }

  localStorage.setItem("carrito", JSON.stringify(carrito));

  actualizarContadorCarrito();
  calcularTotalCarrito();

  await addDoc(collection(db, "eventos"), {
    tipo: "agregar_carrito",
    cliente: cliente || "",
    codigo: producto.codigo,
    listaPrecio: listaPrecioActiva,
    fecha: new Date()
  });

  alert("Producto agregado al carrito 🛒");

}

/* ===============================
ENVIAR PEDIDO
=============================== */

async function enviarWhatsApp() {

  if (carrito.length === 0) {
    alert("El carrito está vacío");
    return;
  }

  let total = 0;
  let mensaje = "🛒 *Pedido MAESRA* %0A%0A";

  if (cliente) {
    mensaje += "*Cliente:* " + cliente + " %0A%0A";
  }

  carrito.forEach(p => {

    let subtotal = p.precio * p.cantidad;

    total += subtotal;

    mensaje += `${p.producto} %0A`;
    mensaje += `Código: ${p.codigo} %0A`;
    mensaje += `Cantidad: ${p.cantidad} %0A`;
    mensaje += `Subtotal: $${subtotal.toFixed(2)} %0A%0A`;

  });

  mensaje += `*TOTAL: $${total.toFixed(2)}*`;

  await addDoc(collection(db, "pedidos"), {
    cliente: cliente || "",
    productos: carrito,
    total: total,
    listaPrecio: listaPrecioActiva,
    fecha: new Date()
  });

  const numero = "5216565292879";
  const url = `https://wa.me/${numero}?text=${mensaje}`;

  window.open(url, "_blank");

  carrito = [];
  localStorage.removeItem("carrito");

  renderizarCarrito();
  actualizarContadorCarrito();
  calcularTotalCarrito();

}