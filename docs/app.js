let productos = [];
let listaPrecioActiva = "LP4"; // default

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
}

document.getElementById("cerrar").onclick = () => {
  document.getElementById("modal").classList.add("oculto");
};

// 🔐 Activar LP1
const CLAVE_LP1 = "MaesraFebrero2026";

document.getElementById("btnPrecio").onclick = () => {
  const pass = prompt("Ingresa la contraseña para ver precios LP1:");

  if (pass === CLAVE_LP1) {
    listaPrecioActiva = "LP1";
    localStorage.setItem("listaPrecio", "LP1");
    actualizarIndicadorLista();
    mostrarProductos(productos);
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
