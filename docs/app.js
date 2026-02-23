let productos = [];
let listaPrecioActiva = "LP4";
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let cliente = localStorage.getItem("cliente");

document.addEventListener("DOMContentLoaded", () => {

  const carritoGuardado = localStorage.getItem("carrito");

  if (carritoGuardado) {
    carrito = JSON.parse(carritoGuardado);
  }

  actualizarContadorCarrito();
  calcularTotalCarrito();
  actualizarIndicadorLista();

});

if (!cliente) {
  cliente = prompt("Ingresa el nombre del cliente:");
  localStorage.setItem("cliente", cliente);
}

// Revisar lista guardada
if (localStorage.getItem("listaPrecio") === "LP1") {
  listaPrecioActiva = "LP1";
} else {
  listaPrecioActiva = "LP4";
}

// Indicador de lista
function actualizarIndicadorLista() {
  const info = document.getElementById("infoLista");
  if (info) {
    info.textContent = "📊 Lista activa: " + listaPrecioActiva;
  }
}

// Cargar productos
fetch("productos.json")
  .then(res => res.json())
  .then(data => {

    productos = data;

    productos.sort((a, b) => {
      const aPromo = Number(a.precioPromocion) < Number(a.precioLP4);
      const bPromo = Number(b.precioPromocion) < Number(b.precioLP4);
      return bPromo - aPromo;
    });

    mostrarProductos(productos);
  });

// Mostrar productos
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

// Buscador
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

// Modal detalle
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

// Contraseña
const CLAVE_LP1 = "MaesraFebrero2026";

// Cambiar lista
document.getElementById("btnPrecio").onclick = async () => {

  const opcion = prompt(
    "Selecciona lista:\n1 - LP1\n2 - LP4"
  );

  if (!opcion) return;

  if (opcion === "1") {

    const pass = prompt("Ingresa contraseña LP1:");

    if (pass !== CLAVE_LP1) {
      alert("❌ Contraseña incorrecta");
      return;
    }

    listaPrecioActiva = "LP1";
    localStorage.setItem("listaPrecio", "LP1");

  }
  else if (opcion === "2") {

    listaPrecioActiva = "LP4";
    localStorage.setItem("listaPrecio", "LP4");

  } else {
    return;
  }

  actualizarIndicadorLista();
  mostrarProductos(productos);

  alert("Lista activa: " + listaPrecioActiva);
};

// Contador carrito
function actualizarContadorCarrito() {

  const contador = document.getElementById("contadorCarrito");
  if (!contador) return;

  const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  contador.textContent = totalItems;
  contador.style.display = totalItems > 0 ? "inline-block" : "none";
}

// Total carrito
function calcularTotalCarrito() {

  const total = carrito.reduce((acc, item) => {
    return acc + (item.precio * item.cantidad);
  }, 0);

  const totalCarrito = document.getElementById("totalCarrito");
  const totalHeader = document.getElementById("totalHeader");

  if (totalCarrito) totalCarrito.textContent = total.toFixed(2);
  if (totalHeader) totalHeader.textContent = total.toFixed(2);
}

// Abrir carrito
function abrirCarrito() {
  document.getElementById("modalCarrito").classList.remove("oculto");
  renderizarCarrito();
}

// Cerrar carrito
function cerrarCarrito() {
  document.getElementById("modalCarrito").classList.add("oculto");
}

// Render carrito
function renderizarCarrito() {

  const contenedor = document.getElementById("contenidoCarrito");
  const totalElemento = document.getElementById("totalCarrito");

  if (!contenedor) return;

  contenedor.innerHTML = "";

  if (carrito.length === 0) {
    contenedor.innerHTML = "<p>El carrito está vacío</p>";
    if (totalElemento) totalElemento.textContent = "TOTAL: $0.00";
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

  if (totalElemento) {
    totalElemento.textContent = "TOTAL: $" + total.toFixed(2);
  }
}

// Cambiar cantidad
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

// Actualizar cantidad manual
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

// Eliminar producto
function eliminarProducto(index) {

  carrito.splice(index, 1);
  localStorage.setItem("carrito", JSON.stringify(carrito));

  renderizarCarrito();
  actualizarContadorCarrito();
  calcularTotalCarrito();
}

// Vaciar carrito
function vaciarCarrito() {

  carrito = [];
  localStorage.removeItem("carrito");

  renderizarCarrito();
  actualizarContadorCarrito();
  calcularTotalCarrito();
}

// Agregar al carrito
async function agregarAlCarrito(producto) {

  if (!producto) return;

  const existente = carrito.find(p => p.codigo === producto.codigo);

  if (existente) {
    existente.cantidad++;
  } else {

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

  actualizarContadorCarrito();
  calcularTotalCarrito();

  alert("Producto agregado al carrito 🛒");
}

// Toast
function mostrarToast() {

  const toast = document.getElementById("toastExito");
  if (!toast) return;

  toast.classList.add("mostrar");

  setTimeout(() => {
    toast.classList.remove("mostrar");
  }, 3000);
}

// Enviar WhatsApp
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

  const numero = "5216565292879";
  const url = `https://wa.me/${numero}?text=${mensaje}`;

  window.open(url, "_blank");

  carrito = [];
  localStorage.removeItem("carrito");

  renderizarCarrito();
  actualizarContadorCarrito();
  calcularTotalCarrito();

  mostrarToast();
}