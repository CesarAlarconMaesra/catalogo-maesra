let productos = [];

fetch("productos.json")
  .then(res => res.json())
  .then(data => {
    productos = data;
    mostrarProductos(productos);
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
    `;
    card.onclick = () => abrirDetalle(p);
    contenedor.appendChild(card);
  });
}
document.getElementById("buscador").addEventListener("input", e => {
  const t = e.target.value.toLowerCase();
  mostrarProductos(productos.filter(p =>
    p.producto.toLowerCase().includes(t) ||
    p.codigo.toLowerCase().includes(t) ||
    p.marca.toLowerCase().includes(t)
  ));
});

function abrirDetalle(p) {
  document.getElementById("modal").classList.remove("oculto");
  dImagen.src = p.imagen;
  dNombre.textContent = p.producto;
  dCodigo.textContent = "Código: " + p.codigo;
  dMarca.textContent = "Marca: " + p.marca;
  dUnidad.textContent = "Unidad: " + p.unidad;
  dMaster.textContent = "Master: " + p.master;
  dInner.textContent = "Inner: " + p.inner;
  dPrecio.textContent = "Precio: $" + Number(p.precio).toFixed(2);
}

document.getElementById("cerrar").onclick = () =>
  document.getElementById("modal").classList.add("oculto");
