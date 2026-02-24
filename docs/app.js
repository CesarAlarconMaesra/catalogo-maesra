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

  actualizarContadorCarrito();
  calcularTotalCarrito();
  actualizarIndicadorLista();

  cargarProductos();

  /* NUEVO */
  conectarBotones();

});

function conectarBotones(){

  const btnCarrito = document.getElementById("btnCarrito");
  const btnCerrarCarrito = document.getElementById("cerrarCarrito");
  const btnPrecio = document.getElementById("btnPrecio");

  if(btnCarrito){
    btnCarrito.onclick = abrirCarrito;
  }

  if(btnCerrarCarrito){
    btnCerrarCarrito.onclick = cerrarCarrito;
  }

  if(btnPrecio){
    btnPrecio.onclick = toggleListaPrecio;
  }

}

/* ===============================
EVENTOS UI
=============================== */

function iniciarEventosUI(){

  const btnPrecio = document.getElementById("btnPrecio");
  if(btnPrecio){
    btnPrecio.onclick = toggleListaPrecio;
  }

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

  promos.forEach(p => {

    const card = document.createElement("div");
    card.className="card card-promo";

    card.innerHTML = `
      <div class="badge-promo">🔥 PROMOCIÓN</div>

      <img src="${p.imagen}" onerror="this.src='img/sin_imagen.jpg'">

      <h4>${p.producto}</h4>
      <p>${p.codigo}</p>

      <div class="precio-anterior">
      $${Number(p.precioLP4).toFixed(2)}
      </div>

      <div class="precio-promo">
      $${Number(p.precioPromocion).toFixed(2)}
      </div>

      ${p.restricciones ? `
      <div class="restricciones">
      ${p.restricciones}
      </div>` : ""}
    `;

    card.onclick = () => abrirDetalle(p);

    contenedor.appendChild(card);

  });

}

/* ===============================
TOP PRODUCTOS
=============================== */

function mostrarTopProductos(lista){

  const contenedor = document.getElementById("topProductos");
  if(!contenedor) return;

  contenedor.innerHTML="";

  const top = lista.filter(p => p.top === true);
  const duplicado = [...top,...top];

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

  iniciarCarrusel(contenedor);

}

/* ===============================
CARRUSEL
=============================== */

function iniciarCarrusel(contenedor){

  let scroll=0;

  let pausa=false;

  contenedor.addEventListener("mouseenter",()=> pausa=true);
  contenedor.addEventListener("mouseleave",()=> pausa=false);

  setInterval(()=>{

    if(pausa) return;

    const card = contenedor.querySelector(".card-top, .card-promo");
    if(!card) return;

    const ancho = card.offsetWidth + 16;

    scroll += ancho;

    if(scroll >= contenedor.scrollWidth / 2){
      scroll = 0;
      contenedor.scrollTo({left:0});
      return;
    }

    contenedor.scrollTo({
      left:scroll,
      behavior:"smooth"
    });

  },2500);

}

/* ===============================
MOSTRAR PRODUCTOS
=============================== */

function mostrarProductos(lista){

  const contenedor = document.getElementById("listaProductos");
  if(!contenedor) return;

  contenedor.innerHTML="";

  lista.forEach(p=>{

    const enPromo =
      Number(p.precioPromocion) > 0 &&
      Number(p.precioPromocion) < Number(p.precioLP4);

    let precioHTML="";

    if(enPromo){

      precioHTML=`
        <div class="precio-anterior">$${Number(p.precioLP4).toFixed(2)}</div>
        <div class="precio-promo">$${Number(p.precioPromocion).toFixed(2)}</div>
      `;

    }else{

      precioHTML=`
        <div class="precio-normal">$${Number(p.precioLP4).toFixed(2)}</div>
      `;

    }

    const card=document.createElement("div");
    card.className="card";

    card.innerHTML=`
      <img src="${p.imagen}" onerror="this.src='img/sin_imagen.jpg'">
      <h4>${p.producto}</h4>
      <p>${p.codigo}</p>
      ${precioHTML}
    `;

    card.onclick=()=>abrirDetalle(p);

    contenedor.appendChild(card);

  });

}

/* ===============================
BUSCADOR
=============================== */

const buscador=document.getElementById("buscador");

if(buscador){

  buscador.addEventListener("input",e=>{

    const t=e.target.value.toLowerCase();

    mostrarProductos(
      productos.filter(p =>
        p.producto.toLowerCase().includes(t) ||
        p.codigo.toLowerCase().includes(t) ||
        p.marca.toLowerCase().includes(t)
      )
    );

  });

}

/* ===============================
MODAL
=============================== */

function abrirDetalle(p){

  const precio =
    listaPrecioActiva==="LP1"
    ? p.precioLP1
    : (Number(p.precioPromocion)>0 &&
       Number(p.precioPromocion)<Number(p.precioLP4))
       ? p.precioPromocion
       : p.precioLP4;

  document.getElementById("modal").classList.remove("oculto");

  dImagen.src=p.imagen;
  dNombre.textContent=p.producto;
  dCodigo.textContent="Código: "+p.codigo;
  dMarca.textContent="Marca: "+p.marca;
  dUnidad.textContent="Unidad: "+p.unidad;
  dMaster.textContent="Master: "+p.master;
  dInner.textContent="Inner: "+p.inner;
  dPrecio.textContent="Precio: $"+Number(precio).toFixed(2);

  btnAgregarCarrito.onclick=()=>agregarAlCarrito(p);

}

cerrar.onclick=()=>{
  modal.classList.add("oculto");
}

/* ===============================
TOGGLE LISTA
=============================== */

const CLAVE_LP1="MaesraFebrero2026";

async function toggleListaPrecio(){

  if(listaPrecioActiva==="LP1"){

    listaPrecioActiva="LP4";
    localStorage.setItem("listaPrecio","LP4");

    actualizarIndicadorLista();
    mostrarProductos(productos);

    alert("Lista cambiada a LP4");

    return;
  }

  const pass=prompt("Contraseña lista LP1:");

  if(pass===CLAVE_LP1){

    listaPrecioActiva="LP1";
    localStorage.setItem("listaPrecio","LP1");

    actualizarIndicadorLista();
    mostrarProductos(productos);

    alert("Lista LP1 activada");

  }else{
    alert("Contraseña incorrecta");
  }

}

/* ===============================
CARRITO
=============================== */

function abrirCarrito(){

  const modal = document.getElementById("modalCarrito");
  if(!modal) return;

  modal.classList.remove("oculto");

  renderizarCarrito();

}

function actualizarContadorCarrito(){

  const contador=document.getElementById("contadorCarrito");

  const total=carrito.reduce((a,b)=>a+b.cantidad,0);

  contador.textContent=total;
  contador.style.display=total>0?"inline-block":"none";

}

function calcularTotalCarrito(){

  const total=carrito.reduce((a,b)=>a+(b.precio*b.cantidad),0);

  totalCarrito.textContent=total.toFixed(2);
  totalHeader.textContent=total.toFixed(2);

}

function agregarAlCarrito(producto){

  const existe=carrito.find(p=>p.codigo===producto.codigo);

  let precio =
    listaPrecioActiva==="LP1"
    ? Number(producto.precioLP1)
    : (Number(producto.precioPromocion)>0 &&
       Number(producto.precioPromocion)<Number(producto.precioLP4))
       ? Number(producto.precioPromocion)
       : Number(producto.precioLP4);

  if(existe){
    existe.cantidad++;
  }else{
    carrito.push({
      codigo:producto.codigo,
      producto:producto.producto,
      precio:precio,
      cantidad:1
    });
  }

  localStorage.setItem("carrito",JSON.stringify(carrito));

  actualizarContadorCarrito();
  calcularTotalCarrito();

  alert("Producto agregado 🛒");

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
  let msg="Pedido MAESRA %0A%0A";

  carrito.forEach(p=>{

    const sub=p.precio*p.cantidad;
    total+=sub;

    msg+=`${p.producto}%0A`;
    msg+=`Cant: ${p.cantidad}%0A`;
    msg+=`$${sub.toFixed(2)}%0A%0A`;

  });

  msg+=`TOTAL $${total.toFixed(2)}`;

  window.open(`https://wa.me/5216565292879?text=${msg}`);

}

/* ===============================
CONECTAR BOTONES UI
=============================== */

window.addEventListener("load", () => {

  const btnCarrito = document.getElementById("btnCarrito");
  const btnPrecio = document.getElementById("btnPrecio");
  const btnCerrar = document.getElementById("cerrarCarrito");

  if (btnCarrito) {
    btnCarrito.addEventListener("click", abrirCarrito);
  }

  if (btnCerrar) {
    btnCerrar.addEventListener("click", cerrarCarrito);
  }

  if (btnPrecio) {
    btnPrecio.addEventListener("click", () => {
      document.getElementById("btnPrecio").onclick();
    });
  }

});