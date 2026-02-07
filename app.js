let productos = [];

// Cargar productos
fetch("productos.json")
  .then(res => res.json())
  .then(data => {
    productos = data;
    mostrarProductos(productos);
  })
  .catch(err => {
    console.error("Error cargando productos:", err);
  });

function mostrarProductos(lista) {
  const contenedor = document.getElementById("listaProductos");
  contenedor.innerHTML = "";

  lista.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${p.imagen}" onerror="this.src='img/sin_imagen.jpg'">
      <h4>${p.producto}</h4>
      <p>${p.codigo}</p>
      <p class="precio">$${Number(p.precio).toFixed(2)}</p>
    `;

    card.onclick = () => abrirDetalle(p);
    contenedor.appendChild(card);
  });
}

// Buscador
document.getElementById("buscador").addEventListener("input", e => {
  const t = e.target.value.toLowerCase();
  mostrarProductos(
    productos.filter(p =>
      p.producto.toLowerCase().includes(t) ||
      p.codigo.toLowerCase().includes(t) ||
      p.marca.toLowerCase().includes(t)
    )
  );
});

// Modal detalle
function abrirDetalle(p) {
  document.getElementById("modal").classList.remove("oculto");

  dImagen.src = p.imagen;
  dNombre.textContent = p.producto;
  dCodigo.textContent = "Código: " + p.codigo;
  dMarca.textContent = "Marca: " + p.marca;
  dUnidad.textContent = "Unidad: " + p.unidad;
  dMaster.textContent = "Master: " + p.master;
  dInner.textContent = "Inner: " + p.inner;

  dPrecio.className = "precio";
  dPrecio.textContent = "Precio: $" + Number(p.precio).toFixed(2);
}

document.getElementById("cerrar").onclick = () => {
  document.getElementById("modal").classList.add("oculto");
};

// 🔐 Control de precios
const CLAVE_PRECIO = "MaesraFebrero2026";

// Al cargar
if (localStorage.getItem("verPrecios") === "si") {
  document.body.classList.add("mostrar-precios");
}

// Ver precios
document.getElementById("btnPrecio").onclick = () => {
  const pass = prompt("Ingresa la contraseña para ver precios:");

  if (pass === CLAVE_PRECIO) {
    localStorage.setItem("verPrecios", "si");
    document.body.classList.add("mostrar-precios");
    alert("✅ Precios habilitados");
  } else {
    alert("❌ Contraseña incorrecta");
  }
};

// Ocultar precios
function ocultarPrecios() {
  localStorage.removeItem("verPrecios");
  document.body.classList.remove("mostrar-precios");
  alert("🔒 Precios ocultos");
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js")
    .then(() => console.log("PWA lista ✅"))
    .catch(err => console.log("Error SW:", err));
}