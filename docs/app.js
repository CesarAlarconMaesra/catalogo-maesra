let productos = [];
let listaPrecioActiva = localStorage.getItem("listaPrecio") || "LP4";
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let cliente = localStorage.getItem("cliente");

/* ===============================
INICIO
=============================== */

document.addEventListener("DOMContentLoaded", () => {

  if (!cliente) {
    cliente = prompt("Ingresa el nombre del cliente:");
    localStorage.setItem("cliente", cliente);
  }
const buscador = document.getElementById("buscador");

if(buscador){
 buscador.addEventListener("input", e=>{

  const texto = e.target.value.toLowerCase();

  const filtrados = productos.filter(p =>

    (p.producto && p.producto.toLowerCase().includes(texto)) ||
    (p.codigo && p.codigo.toLowerCase().includes(texto)) ||
    (p.marca && p.marca.toLowerCase().includes(texto))

  );

  mostrarProductos(filtrados);

});


const formPassword = document.getElementById("formPassword");
const modalPassword = document.getElementById("modalPassword");
const inputPassword = document.getElementById("inputPassword");
const errorPassword = document.getElementById("errorPassword");

formPassword.addEventListener("submit", function(e){
  e.preventDefault();

  if(inputPassword.value === "MAESRA2026"){  // cambia contraseña

    listaPrecioActiva = "LP1";
    localStorage.setItem("listaPrecio", "LP1");

    actualizarIndicadorLista();
    mostrarProductos(productos);

    modalPassword.classList.add("oculto");
    inputPassword.value = "";
    errorPassword.style.display = "none";

  } else {
    errorPassword.style.display = "block";
  }
});

document.getElementById("btnCancelarPassword")
  .addEventListener("click", function(){

    modalPassword.classList.add("oculto");
    inputPassword.value = "";
    errorPassword.style.display = "none";

});

  actualizarIndicadorLista();
  actualizarContadorCarrito();
  calcularTotalCarrito();

  cargarProductos();
  conectarBotones();

});

/* ===============================
BOTONES
=============================== */

function conectarBotones(){

  const btnCarrito = document.getElementById("btnCarrito");
  const btnCerrarCarrito = document.getElementById("cerrarCarrito");
  const btnVaciar = document.getElementById("btnVaciarCarrito");
  const btnPrecio = document.getElementById("btnPrecio");
  const btnWhatsapp = document.getElementById("btnWhatsapp");

  if(btnCarrito) btnCarrito.onclick = abrirCarrito;
  if(btnCerrarCarrito) btnCerrarCarrito.onclick = cerrarCarrito;
  if(btnVaciar) btnVaciar.onclick = vaciarCarrito;
  if(btnPrecio) btnPrecio.onclick = toggleListaPrecio;
  if(btnWhatsapp) btnWhatsapp.onclick = enviarWhatsApp;

}

/* ===============================
INDICADOR LISTA
=============================== */

function actualizarIndicadorLista(){
  const info = document.getElementById("infoLista");
  if(info){
    info.textContent = "📊 Lista activa: " + listaPrecioActiva;
  }
}

/* ===============================
CARGAR PRODUCTOS
=============================== */

function cargarProductos(){

  fetch("productos.json")
  .then(r => r.json())
  .then(data => {

    productos = data;

    productos.sort((a,b)=>{
      const ap = Number(a.precioPromocion) > 0;
      const bp = Number(b.precioPromocion) > 0;
      return bp - ap;
    });

    mostrarPromociones(productos);
    mostrarTopProductos(productos);
    mostrarProductos(productos);
    activarCarruselAutomatico("promoTrack");
    activarCarruselAutomatico("topProductos");

  });

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

  duplicado.forEach(p => {

    const card = document.createElement("div");
    card.className="card card-promo";

    card.innerHTML = `
      <div class="badge-promo">🔥 PROMOCIÓN</div>
      <img src="${p.imagen}" onerror="this.src='img/sin_imagen.jpg'">
      <h4>${p.producto}</h4>
      <p>${p.codigo}</p>
      <div class="precio-anterior">$${Number(p.precioLP4).toFixed(2)}</div>
      <div class="precio-promo">$${Number(p.precioPromocion).toFixed(2)}</div>
    `;

    card.onclick = () => abrirDetalle(p);
    contenedor.appendChild(card);

  });

  iniciarCarrusel("promoTrack");

}

/* ===============================
TOP PRODUCTOS
=============================== */

function mostrarTopProductos(lista){

  const contenedor = document.getElementById("topProductos");
  if(!contenedor) return;

  contenedor.innerHTML="";

  const top = lista.filter(p => p.top === true);
  const duplicado = [...top, ...top];

  duplicado.forEach(p=>{

    const card = document.createElement("div");
    card.className="card-top";

    card.innerHTML=`
      <img src="${p.imagen}" onerror="this.src='img/sin_imagen.jpg'">
      <h4>${p.producto}</h4>
      <p>${p.codigo}</p>
    `;

    card.onclick=()=>abrirDetalle(p);
    contenedor.appendChild(card);

  });

  iniciarCarrusel("topProductos");

}

/* ===============================
CARRUSEL
=============================== */

function activarCarruselAutomatico(idContenedor){

  const contenedor = document.getElementById(idContenedor);

  let animando = false;

  function scrollSuave(){
    if(animando) return;

    animando = true;

    contenedor.scrollBy({
      left: 200,
      behavior: "smooth"
    });

    setTimeout(() => {
      if(contenedor.scrollLeft + contenedor.clientWidth >= contenedor.scrollWidth){
        contenedor.scrollTo({ left: 0, behavior: "smooth" });
      }
      animando = false;
    }, 2000);
  }

  setInterval(scrollSuave, 4000);
}

/* ===============================
PRODUCTOS
=============================== */

function mostrarProductos(lista){

  const contenedor = document.getElementById("listaProductos");
  if(!contenedor) return;

  contenedor.innerHTML="";

  lista.forEach(p=>{

    const enPromo =
      Number(p.precioPromocion) > 0 &&
      Number(p.precioPromocion) < Number(p.precioLP4);

    let precio =
      listaPrecioActiva==="LP1"
      ? Number(p.precioLP1)
      : enPromo
        ? Number(p.precioPromocion)
        : Number(p.precioLP4);

    const card=document.createElement("div");
    card.className="card";

    card.innerHTML=`
      ${enPromo ? `<div class="badge-promo">🔥 PROMOCIÓN</div>`:""}
      <img src="${p.imagen}" onerror="this.src='img/sin_imagen.jpg'">
      <h4>${p.producto}</h4>
      <p>${p.codigo}</p>
      <div class="precio-normal">$${precio.toFixed(2)}</div>
    `;

    card.onclick=()=>abrirDetalle(p);
    contenedor.appendChild(card);

  });

}

/* ===============================
CARRITO
=============================== */

function abrirCarrito(){
  document.getElementById("modalCarrito").classList.remove("oculto");
  renderizarCarrito();
}

function cerrarCarrito(){
  document.getElementById("modalCarrito").classList.add("oculto");
}

function vaciarCarrito(){
  carrito=[];
  localStorage.removeItem("carrito");
  renderizarCarrito();
  actualizarContadorCarrito();
  calcularTotalCarrito();
}

function renderizarCarrito(){

  const contenedor = document.getElementById("contenidoCarrito");
  if (!contenedor) return;

  contenedor.innerHTML = "";

  if (carrito.length === 0) {
    contenedor.innerHTML = "<p>El carrito está vacío</p>";
    return;
  }

  carrito.forEach((p, index) => {

    const subtotal = p.precio * p.cantidad;

    const div = document.createElement("div");
    div.className = "item-carrito";

    div.innerHTML = `
      <strong>${p.producto}</strong><br>
      Código: ${p.codigo}<br>
      Precio unitario: $${p.precio.toFixed(2)}<br><br>

      <button class="menos">➖</button>
      <input type="number" value="${p.cantidad}" min="1">
      <button class="mas">➕</button>

      <br><br>
      Subtotal: $${subtotal.toFixed(2)}<br><br>

      <button class="eliminar">🗑 Eliminar</button>
      <hr>
    `;

    div.querySelector(".menos").onclick=()=>cambiarCantidad(index,-1);
    div.querySelector(".mas").onclick=()=>cambiarCantidad(index,1);
    div.querySelector(".eliminar").onclick=()=>eliminarProducto(index);

    div.querySelector("input").onchange=(e)=>{
      actualizarCantidad(index,e.target.value);
    };

    contenedor.appendChild(div);

  });

}

function cambiarCantidad(index,cambio){

  carrito[index].cantidad+=cambio;

  if(carrito[index].cantidad<=0){
    carrito.splice(index,1);
  }

  guardarCarrito();

}

function actualizarCantidad(index,cantidad){

  cantidad=parseInt(cantidad);

  if(isNaN(cantidad)||cantidad<=0){
    carrito.splice(index,1);
  }else{
    carrito[index].cantidad=cantidad;
  }

  guardarCarrito();

}

function eliminarProducto(index){
  carrito.splice(index,1);
  guardarCarrito();
}

function guardarCarrito(){
  localStorage.setItem("carrito",JSON.stringify(carrito));
  renderizarCarrito();
  actualizarContadorCarrito();
  calcularTotalCarrito();
}

function actualizarContadorCarrito(){
  const contador=document.getElementById("contadorCarrito");
  if(!contador) return;
  const total=carrito.reduce((a,b)=>a+b.cantidad,0);
  contador.textContent=total;
  contador.style.display=total>0?"inline-block":"none";
}

function calcularTotalCarrito(){
  const total=carrito.reduce((a,b)=>a+(b.precio*b.cantidad),0);
  const totalCarrito=document.getElementById("totalCarrito");
  const totalHeader=document.getElementById("totalHeader");
  if(totalCarrito) totalCarrito.textContent=total.toFixed(2);
  if(totalHeader) totalHeader.textContent="$"+total.toFixed(2);
}

/* ===============================
WHATSAPP
=============================== */

function enviarWhatsApp(){

  if(carrito.length===0){
    alert("Carrito vacío");
    return;
  }

  let total=0;
  let msg="🛒 Pedido MAESRA %0A%0A";

  carrito.forEach(p=>{

    const sub=p.precio*p.cantidad;
    total+=sub;

    msg+=`📦 ${p.producto}%0A`;
    msg+=`Código: ${p.codigo}%0A`;
    msg+=`Cantidad: ${p.cantidad}%0A`;
    msg+=`Precio unitario: $${p.precio.toFixed(2)}%0A`;
    msg+=`Subtotal: $${sub.toFixed(2)}%0A%0A`;

  });

  msg+=`💰 TOTAL: $${total.toFixed(2)}`;

  window.open(`https://wa.me/5216565292879?text=${msg}`);

}

/* ===============================
TOGGLE LISTA DE PRECIOS
=============================== */

function toggleListaPrecio(){

  if(listaPrecioActiva === "LP4"){
    document.getElementById("modalPassword").classList.remove("oculto");
  } else {
    listaPrecioActiva = "LP4";
    localStorage.setItem("listaPrecio", "LP4");
    actualizarIndicadorLista();
    mostrarProductos(productos);
  }

}
  actualizarIndicadorLista();
  mostrarProductos(productos);


/* ===============================
DETALLE PRODUCTO
=============================== */

function abrirDetalle(p){

  document.getElementById("modal").classList.remove("oculto");

  document.getElementById("dImagen").src = p.imagen;
  document.getElementById("dNombre").textContent = p.producto;
  document.getElementById("dCodigo").textContent = "Código: " + p.codigo;
  document.getElementById("dMarca").textContent = "Marca: " + (p.marca || "");
  document.getElementById("dUnidad").textContent = "Unidad: " + (p.unidad || "");
  document.getElementById("dMaster").textContent = "Master: " + (p.master || "");
  document.getElementById("dInner").textContent = "Inner: " + (p.inner || "");

  const enPromo =
    Number(p.precioPromocion) > 0 &&
    Number(p.precioPromocion) < Number(p.precioLP4);

  let precio =
    listaPrecioActiva === "LP1"
    ? Number(p.precioLP1)
    : enPromo
      ? Number(p.precioPromocion)
      : Number(p.precioLP4);

  document.getElementById("dPrecio").textContent = "Precio: $" + precio.toFixed(2);

  const btnAgregar = document.getElementById("btnAgregarCarrito");

  btnAgregar.onclick = () => agregarAlCarrito(p, precio);

}

/* ===============================
AGREGAR AL CARRITO
=============================== */

function agregarAlCarrito(p, precio){

  const existe = carrito.find(item => item.codigo === p.codigo);

  if(existe){
    existe.cantidad++;
  } else {
    carrito.push({
      producto: p.producto,
      codigo: p.codigo,
      precio: precio,
      cantidad: 1
    });
  }

  guardarCarrito();
  cerrarModal();

}

/* ===============================
CERRAR MODAL DETALLE
=============================== */

document.getElementById("cerrar").onclick = cerrarModal;

function cerrarModal(){
  document.getElementById("modal").classList.add("oculto");
}

/* ===============================
CORRECCIÓN TOTAL HEADER
=============================== */

function calcularTotalCarrito(){

  const total = carrito.reduce((a,b)=>a+(b.precio*b.cantidad),0);

  const totalCarrito=document.getElementById("totalCarrito");
  const totalHeader=document.getElementById("totalHeader");

  if(totalCarrito) totalCarrito.textContent="$"+total.toFixed(2);
  if(totalHeader) totalHeader.textContent=total.toFixed(2);

}