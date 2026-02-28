let productos = [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let productoActualDetalle = null;

document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();
    actualizarCarrito();
    iniciarCarrusel();
    document.getElementById("buscador").addEventListener("input", filtrarProductos);
});

async function cargarProductos() {
    const res = await fetch("productos.json");
    productos = await res.json();
    renderizarProductos(productos);
}

function renderizarProductos(lista) {
    const contenedor = document.getElementById("contenedorProductos");
    contenedor.innerHTML = "";

    lista.forEach(prod => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <img src="${prod.imagen}">
            <h4>${prod.descripcion}</h4>
            <p><b>${prod.marca}</b></p>
            <p>${prod.codigo}</p>
            <p>$${parseFloat(prod.precio).toFixed(2)}</p>
            <button onclick="event.stopPropagation(); agregarAlCarrito('${prod.codigo}')">Agregar</button>
        `;
        card.onclick = () => abrirDetalle(prod.codigo);
        contenedor.appendChild(card);
    });
}

function filtrarProductos() {
    const txt = buscador.value.toLowerCase();
    const filtrados = productos.filter(p =>
        p.descripcion.toLowerCase().includes(txt) ||
        p.codigo.toLowerCase().includes(txt) ||
        p.marca.toLowerCase().includes(txt)
    );
    renderizarProductos(filtrados);
}

function iniciarCarrusel() {
    const cont = document.getElementById("contenedorProductos");
    setInterval(() => {
        const card = cont.querySelector(".card");
        if (!card) return;
        const ancho = card.offsetWidth + 20;
        const visibles = Math.floor(cont.offsetWidth / ancho);
        cont.scrollBy({ left: ancho * visibles, behavior: "smooth" });
        if (cont.scrollLeft + cont.offsetWidth >= cont.scrollWidth - 5) {
            cont.scrollTo({ left: 0, behavior: "smooth" });
        }
    }, 4000);
}

function abrirDetalle(codigo) {
    const p = productos.find(x => x.codigo === codigo);
    productoActualDetalle = p;
    detalleImagen.src = p.imagen;
    detalleDescripcion.textContent = p.descripcion;
    detalleMarca.textContent = "Marca: " + p.marca;
    detalleCodigo.textContent = "Código: " + p.codigo;
    detallePrecio.textContent = "$" + parseFloat(p.precio).toFixed(2);
    modalDetalle.style.display = "flex";
}

function cerrarModalDetalle() {
    modalDetalle.style.display = "none";
}

function agregarAlCarrito(codigo) {
    const prod = productos.find(p => p.codigo === codigo);
    const existe = carrito.find(p => p.codigo === codigo);
    if (existe) existe.cantidad++;
    else carrito.push({ ...prod, cantidad: 1 });
    actualizarCarrito();
}

function actualizarCarrito() {
    carritoItems.innerHTML = "";
    let total = 0;
    carrito.forEach((item, i) => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        carritoItems.innerHTML += `
            <div>
                <b>${item.descripcion}</b><br>
                ${item.codigo}<br>
                $${item.precio} x ${item.cantidad}<br>
                Subtotal: $${subtotal.toFixed(2)}<br>
                <button onclick="cambiarCantidad(${i},-1)">−</button>
                <button onclick="cambiarCantidad(${i},1)">+</button>
                <button onclick="eliminarDelCarrito(${i})">Eliminar</button>
                <hr>
            </div>
        `;
    });
    carritoTotal.textContent = total.toFixed(2);
    contadorCarrito.textContent = carrito.reduce((a,b)=>a+b.cantidad,0);
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

function cambiarCantidad(i,c) {
    carrito[i].cantidad += c;
    if (carrito[i].cantidad <= 0) carrito.splice(i,1);
    actualizarCarrito();
}

function eliminarDelCarrito(i) {
    carrito.splice(i,1);
    actualizarCarrito();
}

function vaciarCarrito() {
    if (!carrito.length) return;
    if (!confirm("¿Vaciar carrito?")) return;
    carrito = [];
    actualizarCarrito();
}

function abrirModalCarrito() {
    modalCarrito.style.display = "flex";
}

function cerrarModalCarrito() {
    modalCarrito.style.display = "none";
}

function enviarWhatsApp() {
    if (!carrito.length) return;
    let msg = "Hola, quiero cotizar:\n\n";
    let total = 0;
    carrito.forEach(i=>{
        const sub = i.precio*i.cantidad;
        total+=sub;
        msg+=`${i.descripcion}\n${i.codigo}\nCant:${i.cantidad}\nSubtotal:$${sub.toFixed(2)}\n\n`;
    });
    msg+=`TOTAL:$${total.toFixed(2)}`;
    window.open(`https://wa.me/5216565292879?text=${encodeURIComponent(msg)}`,"_blank");
}