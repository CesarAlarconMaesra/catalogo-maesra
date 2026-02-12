let productos = [];
let listaPrecioActiva = "LP4"; // default
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let cliente = localStorage.getItem("cliente");

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
    mostrarProductos(productos);
  })
  .catch(err => {
    console.error("Error cargando productos:", err);
  });

// 🔹 Mostrar productos
function mostrarProductos(lista) {

  const contenedor = document.getElementById("listaProductos");
  if (!contenedor) return;

  contenedor.innerHTML = "";

  lista.forEach(p => {

    let precio = listaPrecioActiva === "LP1"
      ? Number(p.precioLP1).toFixed(2)
      : Number(p.precioLP4).toFixed(2);

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${p.imagen}" onerror="this.src='img/sin_imagen.jpg'">
      <h4>${p.producto}</h4>
      <p>${p.codigo}</p>
      <p style="font-weight:bold; color:#1E88E5;">
        $ ${precio}
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
          ${p.cantidad}
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
}

function eliminarProducto(index) {
  carrito.splice(index, 1);
  localStorage.setItem("carrito", JSON.stringify(carrito));
  renderizarCarrito();
}

function vaciarCarrito() {
  carrito = [];
  localStorage.removeItem("carrito");
  renderizarCarrito();
}

async function agregarAlCarrito(producto) {

  const existe = carrito.find(p => p.codigo === producto.codigo);

  if (existe) {
    existe.cantidad += 1;
  } else {
    carrito.push({
      codigo: producto.codigo,
      producto: producto.producto,
      precio: listaPrecioActiva === "LP1" ? producto.precioLP1 : producto.precioLP4,
      cantidad: 1
 	gtag('event', 'agregar_carrito');
    });
  }

  localStorage.setItem("carrito", JSON.stringify(carrito));

  // 🔥 Registrar en Firebase
  await addDoc(collection(db, "eventos"), {
    tipo: "agregar_carrito",
    cliente: cliente,
    codigo: producto.codigo,
    listaPrecio: listaPrecioActiva,
    fecha: new Date()
  });

  alert("Producto agregado al carrito 🛒");
}
async function enviarWhatsApp() {

  gtag('event', 'enviar_whatsapp', {
  value: total
  });
  if (carrito.length === 0) {
    alert("El carrito está vacío");
    return;
  }

  let mensaje = "🛒 *Pedido MAESRA* \n\n";

  if (cliente && cliente.trim() !== "") {
    mensaje += "*Cliente:* " + cliente + "\n\n";
  }

  let total = 0;

  carrito.forEach(p => {
    let subtotal = p.precio * p.cantidad;
    total += subtotal;

    mensaje += `${p.producto}\n`;
    mensaje += `Código: ${p.codigo}\n`;
    mensaje += `Cantidad: ${p.cantidad}\n`;
    mensaje += `Subtotal: $${subtotal.toFixed(2)}\n\n`;
  });

  mensaje += `*TOTAL (+IVA): $${total.toFixed(2)}*`;

  const numero = "5216565292879";

  const mensajeCodificado = encodeURIComponent(mensaje);
  const url = `https://wa.me/${numero}?text=${mensajeCodificado}`;

  // 🔥 ABRIR PRIMERO
  window.open(url, "_blank");

  // 🔥 GUARDAR DESPUÉS (sin bloquear WhatsApp)
  try {
    await addDoc(collection(db, "pedidos"), {
      cliente: cliente,
      productos: carrito,
      total: total,
      listaPrecio: listaPrecioActiva,
      fecha: new Date()
    });

    await addDoc(collection(db, "eventos"), {
      tipo: "enviar_whatsapp",
      cliente: cliente,
      total: total,
      fecha: new Date()
    });

  } catch (error) {
    console.error("Error guardando en Firebase:", error);
  }
carrito = [];
localStorage.removeItem("carrito");
}