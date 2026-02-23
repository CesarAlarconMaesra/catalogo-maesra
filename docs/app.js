let productos = [];
let listaPrecioActiva = "LP4"; // default
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let cliente = localStorage.getItem("cliente");
document.addEventListener("DOMContentLoaded", () => {

  const carritoGuardado = localStorage.getItem("carrito");

  if (carritoGuardado) {
    carrito = JSON.parse(carritoGuardado);
  }

  actualizarContadorCarrito();
  calcularTotalCarrito();

});

if (!cliente) {
  cliente = prompt("Ingresa el nombre del cliente:");
  localStorage.setItem("cliente", cliente);
}
// 🔹 Revisar lista guardada
if (localStorage.getItem("listaPrecio") === "LP1") {
  listaPrecioActiva = "LP1";
} else {
  listaPrecioActiva = "LP4";
}

// 🔹 Actualizar indicador
function actualizarIndicadorLista() {
  const info = document.getElementById("infoLista");
  if (info) {
    info.textContent = "📊 Lista activa: " + listaPrecioActiva;
  }
}

actualizarIndicadorLista();

// 🔹 Cargar productos
fetch("productos.json")
  .then(res => res.json())
  .then(data => {

    productos = data;

    // 🔥 Ordenar promociones primero
    productos.sort((a, b) => {
  const aPromo = Number(a.precioPromocion) < Number(a.precioLP4);
  const bPromo = Number(b.precioPromocion) < Number(b.precioLP4);
  return bPromo - aPromo;
});

    mostrarProductos(productos);
  });

// 🔹 Mostrar productos
function mostrarProductos(lista) {

  const contenedor = document.getElementById("listaProductos");
  if (!contenedor) return;

  contenedor.innerHTML = "";

  lista.forEach(p => {
  const enPromo =
  p.precioPromocion &&
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
    <div class="restricciones">
      ${p.restricciones || ""}
    </div>
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
      <p style="font-weight:bold; color:#1E88E5;">
        ${bloquePrecio}
      </p>
    `;

    card.onclick = () => abrirDetalle(p);

    contenedor.appendChild(card);
  });
}

// 🔹 Buscador
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

// 🔹 Modal detalle
function abrirDetalle(p) {

  const precioMostrar = listaPrecioActiva === "LP1"
    ? p.precioLP1
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

// 🔐 Activar LP1
const CLAVE_LP1 = "MaesraFebrero2026";

document.getElementById("btnPrecio").onclick = async () => {
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
  alert("✅ Lista LP1 activada");
  } else {
    alert("❌ Contraseña incorrecta");
  }
};

// 🔹 Regresar a LP4
function ocultarPrecios() {
  listaPrecioActiva = "LP4";
  localStorage.setItem("listaPrecio", "LP4");
  actualizarIndicadorLista();
  mostrarProductos(productos);
}

function actualizarContadorCarrito() {
  const contador = document.getElementById("contadorCarrito");

  const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  contador.textContent = totalItems;

  contador.style.display = totalItems > 0 ? "inline-block" : "none";
}

function calcularTotalCarrito() {
  const total = carrito.reduce((acc, item) => {
    return acc + (item.precio * item.cantidad);
  }, 0);

  document.getElementById("totalCarrito").textContent = total.toFixed(2);
  document.getElementById("totalHeader").textContent = total.toFixed(2);
}

function abrirCarrito() {
  console.log("Se abrió carrito");
  document.getElementById("modalCarrito").classList.remove("oculto");
  renderizarCarrito();
  gtag('event', 'abrir_carrito');
}

function cerrarCarrito() {
  document.getElementById("modalCarrito").classList.add("oculto");
}

function renderizarCarrito() {

  const contenedor = document.getElementById("contenidoCarrito");
  const totalElemento = document.getElementById("totalCarrito");

  if (!contenedor) return;

  contenedor.innerHTML = "";

  if (carrito.length === 0) {
    contenedor.innerHTML = "<p>El carrito está vacío</p>";
    if (totalElemento) totalElemento.textContent = "";
    return;
  }

  let total = 0;

  carrito.forEach((p, index) => {

    const subtotal = p.precio * p.cantidad;
    total += subtotal;

    contenedor.innerHTML += `
      <div class="item-carrito">
        <strong>${p.producto}</strong><br>
        Código: ${p.codigo}<br>
        Precio: $${p.precio.toFixed(2)}<br>
       Cantidad:
       <button onclick="cambiarCantidad(${index}, -1)">➖</button>
       <input type="number"
         min="1"
         value="${p.cantidad}"
         onchange="actualizarCantidad(${index}, this.value)"
         style="width:60px; text-align:center;">
        <button onclick="cambiarCantidad(${index}, 1)">➕</button>
        <br>
        Subtotal: $${subtotal.toFixed(2)}<br>
        <button onclick="eliminarProducto(${index})">🗑 Eliminar</button>
      </div>
    `;
  });

  if (totalElemento) {
    totalElemento.textContent = "TOTAL: $" + total.toFixed(2);
  }
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

async function agregarAlCarrito(producto) {

  if (!producto) return;

  const existente = carrito.find(p => p.codigo === producto.codigo);

  if (existente) {
    existente.cantidad++;
  } else {

    // 🔥 Determinar precio correcto según lista activa
    let precioFinal = listaPrecioActiva === "LP1"
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

  await addDoc(collection(db, "eventos"), {
    tipo: "agregar_carrito",
    cliente: cliente || "",
    codigo: producto.codigo,
    listaPrecio: listaPrecioActiva,
    fecha: new Date()
  });
  actualizarContadorCarrito();
  calcularTotalCarrito();
  alert("Producto agregado al carrito 🛒");
}
function mostrarToast() {
  const toast = document.getElementById("toastExito");
  toast.classList.add("mostrar");

  setTimeout(() => {
    toast.classList.remove("mostrar");
  }, 3000);
}
async function enviarWhatsApp() {

  if (carrito.length === 0) {
    alert("El carrito está vacío");
    return;
  }

  let total = 0;
  let mensaje = "🛒 *Pedido MAESRA* %0A%0A";

  if (cliente && cliente.trim() !== "") {
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

  // 🔹 Guardar pedido en Firestore
  await addDoc(collection(db, "pedidos"), {
    cliente: cliente || "",
    productos: carrito,
    total: total,
    listaPrecio: listaPrecioActiva,
    fecha: new Date()
  });

  // 🔹 Registrar evento
  await addDoc(collection(db, "eventos"), {
    tipo: "enviar_whatsapp",
    cliente: cliente || "",
    total: total,
    fecha: new Date()
  });

  gtag('event', 'enviar_whatsapp', {
    value: total
  });

  const numero = "5216565292879";
  const url = `https://wa.me/${numero}?text=${mensaje}`;

  window.open(url, "_blank");

  // ✅ AQUÍ se limpia correctamente
  carrito = [];
  localStorage.removeItem("carrito");
  renderizarCarrito(); // actualiza vista

  mostrarToast();
}