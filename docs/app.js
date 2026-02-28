/****************************
 CONFIGURACIÓN GENERAL
*****************************/

let productos = [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let intervaloCarrusel;

/****************************
 INICIALIZACIÓN
*****************************/

document.addEventListener("DOMContentLoaded", () => {

    cargarProductos();
    actualizarCarrito();
    iniciarCarruselAutomatico();

    document.getElementById("buscador").addEventListener("input", filtrarProductos);
});

/****************************
 CARGAR PRODUCTOS
*****************************/

async function cargarProductos() {

    try {
        const response = await fetch("productos.json");
        productos = await response.json();
        renderizarProductos(productos);

    } catch (error) {
        console.error("Error cargando productos:", error);
    }
}

/****************************
 RENDER PRODUCTOS
*****************************/

function renderizarProductos(lista) {

    const contenedor = document.getElementById("contenedorProductos");
    contenedor.innerHTML = "";

    lista.forEach(producto => {

        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.descripcion}">
            <h4>${producto.descripcion}</h4>
            <p><strong>${producto.marca}</strong></p>
            <p>Código: ${producto.codigo}</p>
            <p class="precio">$${parseFloat(producto.precio).toFixed(2)}</p>
            <button onclick="agregarAlCarrito('${producto.codigo}')">Agregar</button>
        `;

        card.onclick = (e) => {
            if (e.target.tagName !== "BUTTON") {
                abrirDetalle(producto.codigo);
            }
        };

        contenedor.appendChild(card);
    });
}

/****************************
 BUSCADOR
*****************************/

function filtrarProductos() {

    const texto = document.getElementById("buscador").value.toLowerCase();

    const filtrados = productos.filter(p =>
        p.descripcion.toLowerCase().includes(texto) ||
        p.codigo.toLowerCase().includes(texto) ||
        p.marca.toLowerCase().includes(texto)
    );

    renderizarProductos(filtrados);
}

/****************************
 CARRUSEL AUTOMÁTICO
*****************************/

function iniciarCarruselAutomatico() {

    const contenedor = document.getElementById("contenedorProductos");

    intervaloCarrusel = setInterval(() => {

        const card = contenedor.querySelector(".card");
        if (!card) return;

        const anchoCard = card.offsetWidth + 20;
        const visibles = Math.floor(contenedor.offsetWidth / anchoCard);

        contenedor.scrollBy({
            left: anchoCard * visibles,
            behavior: "smooth"
        });

        if (contenedor.scrollLeft + contenedor.offsetWidth >= contenedor.scrollWidth - 10) {
            contenedor.scrollTo({ left: 0, behavior: "smooth" });
        }

    }, 4000);
}

/****************************
 DETALLE PRODUCTO
*****************************/

function abrirDetalle(codigo) {

    const producto = productos.find(p => p.codigo === codigo);
    if (!producto) return;

    alert(
        producto.descripcion + "\n" +
        "Marca: " + producto.marca + "\n" +
        "Código: " + producto.codigo + "\n" +
        "Precio: $" + parseFloat(producto.precio).toFixed(2)
    );
}

/****************************
 CARRITO
*****************************/

function agregarAlCarrito(codigo) {

    const producto = productos.find(p => p.codigo === codigo);
    if (!producto) return;

    const existe = carrito.find(item => item.codigo === codigo);

    if (existe) {
        existe.cantidad++;
    } else {
        carrito.push({
            ...producto,
            cantidad: 1
        });
    }

    actualizarCarrito();
}

function actualizarCarrito() {

    const contenedor = document.getElementById("carritoItems");
    const totalElemento = document.getElementById("carritoTotal");

    contenedor.innerHTML = "";

    let total = 0;

    carrito.forEach((item, index) => {

        const subtotal = item.precio * item.cantidad;
        total += subtotal;

        contenedor.innerHTML += `
            <div class="itemCarrito">
                <p><strong>${item.descripcion}</strong></p>
                <p>Código: ${item.codigo}</p>
                <p>Precio unitario: $${parseFloat(item.precio).toFixed(2)}</p>

                <div class="controles">
                    <button onclick="cambiarCantidad(${index}, -1)">−</button>
                    <span>${item.cantidad}</span>
                    <button onclick="cambiarCantidad(${index}, 1)">+</button>
                </div>

                <p>Subtotal: $${subtotal.toFixed(2)}</p>
                <button onclick="eliminarDelCarrito(${index})">Eliminar</button>
                <hr>
            </div>
        `;
    });

    totalElemento.textContent = total.toFixed(2);

    localStorage.setItem("carrito", JSON.stringify(carrito));
}

function cambiarCantidad(index, cambio) {

    carrito[index].cantidad += cambio;

    if (carrito[index].cantidad <= 0) {
        carrito.splice(index, 1);
    }

    actualizarCarrito();
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    actualizarCarrito();
}

function vaciarCarrito() {

    if (carrito.length === 0) return;

    if (!confirm("¿Seguro que deseas vaciar el carrito?")) return;

    carrito = [];
    localStorage.removeItem("carrito");

    actualizarCarrito();
}

/****************************
 WHATSAPP
*****************************/

function enviarWhatsApp() {

    if (carrito.length === 0) return;

    let mensaje = "Hola, quiero cotizar:\n\n";
    let total = 0;

    carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;

        mensaje += `${item.descripcion}\n`;
        mensaje += `Código: ${item.codigo}\n`;
        mensaje += `Cantidad: ${item.cantidad}\n`;
        mensaje += `Subtotal: $${subtotal.toFixed(2)}\n\n`;
    });

    mensaje += `TOTAL: $${total.toFixed(2)}`;

    const telefono = "5216562226459"; // ← PON TU NÚMERO
    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

    window.open(url, "_blank");
}

