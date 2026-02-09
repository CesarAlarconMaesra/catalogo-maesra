let productos = [];
let listaPrecioActiva = "LP4"; // default

// Al cargar la página
if (localStorage.getItem("listaPrecio") === "LP1") {
  listaPrecioActiva = "LP1";
} else {
  listaPrecioActiva = "LP4";
}

function actualizarIndicadorLista() {
  const info = document.getElementById("infoLista");
  info.textContent = "📊 Lista activa: " + listaPrecioActiva;
}

actualizarIndicadorLista();

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

    let precioValor = 0;

    if (listaPrecioActiva === "LP1") {
      precioValor = p.precioLP1 ?? 0;
    } else {
      precioValor = p.precioLP4 ?? 0;
    }

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${p.imagen}" onerror="this.src='img/sin_imagen.jpg'">
      <h4>${p.producto}</h4>
      <p>${p.codigo}</p>
      <p style="font-weight:bold; color:#1E88E5;">
        $ ${Number(precioValor).toFixed(2)}
      </p>
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

  let precioValor = 0;

  if (listaPrecioActiva === "LP1") {
    precioValor = p.precioLP1 ?? 0;
  } else {
    precioValor = p.precioLP4 ?? 0;
  }

  document.getElementById("modal").classList.remove("oculto");

  dImagen.src = p.imagen;
  dNombre.textContent = p.producto;
  dCodigo.textContent = "Código: " + p.codigo;
  dMarca.textContent = "Marca: " + p.marca;
  dUnidad.textContent = "Unidad: " + p.unidad;
  dMaster.textContent = "Master: " + p.master;
  dInner.textContent = "Inner: " + p.inner;
  dPrecio.textContent = "Precio: $ " + Number(precioValor).toFixed(2);
}

document.getElementById("cerrar").onclick = () => {
  document.getElementById("modal").classList.add("oculto");
};

// 🔐 Control de precios
const CLAVE_LP1 = "MaesraFebrero2026";

document.getElementById("btnPrecio").onclick = () => {
  const pass = prompt("Ingresa la contraseña para ver precios LP1:");

  if (pass === CLAVE_LP1) {
  listaPrecioActiva = "LP1";
  localStorage.setItem("listaPrecio", "LP1");
  actualizarIndicadorLista();
  mostrarProductos(productos);
  alert("✅ Lista LP1 activada");
}

   } else {
    alert("❌ Contraseña incorrecta");
  }
};
// Regresar a LP4 precios
function ocultarPrecios() {
  listaPrecioActiva = "LP4";
  localStorage.setItem("listaPrecio", "LP4");
  actualizarIndicadorLista();
  mostrarProductos(productos);
}