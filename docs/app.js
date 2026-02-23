let productos = [];

let listaPrecioActiva = localStorage.getItem("listaPrecio") || "LP4";

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

let cliente = localStorage.getItem("cliente");

const CLAVE_LP1 = "MaesraFebrero2026";

document.addEventListener("DOMContentLoaded", () => {

actualizarIndicadorLista();
actualizarBotonLista();
actualizarContadorCarrito();
calcularTotalCarrito();

cargarProductos();

});

if (!cliente) {
cliente = prompt("Ingresa el nombre del cliente:");
localStorage.setItem("cliente", cliente);
}

function actualizarIndicadorLista() {

const info = document.getElementById("infoLista");

info.textContent = "📊 Lista activa: " + listaPrecioActiva;

}

function actualizarBotonLista(){

const btn = document.getElementById("btnTogglePrecio");

if(listaPrecioActiva === "LP1"){

btn.textContent = "🙈 Ocultar precios (LP4)";

}else{

btn.textContent = "🔐 Ver precios LP1";

}

}

document.getElementById("btnTogglePrecio").onclick = async () => {

if(listaPrecioActiva === "LP1"){

listaPrecioActiva = "LP4";
localStorage.setItem("listaPrecio","LP4");

actualizarIndicadorLista();
actualizarBotonLista();
mostrarProductos(productos);

return;

}

const pass = prompt("Contraseña lista LP1");

if(pass !== CLAVE_LP1){

alert("Contraseña incorrecta");
return;

}

listaPrecioActiva = "LP1";
localStorage.setItem("listaPrecio","LP1");

actualizarIndicadorLista();
actualizarBotonLista();
mostrarProductos(productos);

await addDoc(collection(db,"eventos"),{
tipo:"activar_LP1",
cliente:cliente,
fecha:new Date()
});

};

function cargarProductos(){

fetch("productos.json")
.then(r=>r.json())
.then(data=>{

productos = data;

productos.sort((a,b)=>{

const aPromo = Number(a.precioPromocion) < Number(a.precioLP4);
const bPromo = Number(b.precioPromocion) < Number(b.precioLP4);

return bPromo - aPromo;

});

mostrarProductos(productos);

});

}

function mostrarProductos(lista){

const contenedor = document.getElementById("listaProductos");

contenedor.innerHTML="";

lista.forEach(p=>{

const enPromo =
p.precioPromocion &&
Number(p.precioPromocion) < Number(p.precioLP4);

let bloquePrecio="";

if(listaPrecioActiva==="LP1"){

bloquePrecio=`<div class="precio-normal">$ ${Number(p.precioLP1).toFixed(2)}</div>`;

}else{

if(enPromo){

bloquePrecio=`
<div class="badge-promo">🔥 PROMOCIÓN</div>
<div class="precio-anterior">$ ${Number(p.precioLP4).toFixed(2)}</div>
<div class="precio-promo">$ ${Number(p.precioPromocion).toFixed(2)}</div>
`;

}else{

bloquePrecio=`<div class="precio-normal">$ ${Number(p.precioLP4).toFixed(2)}</div>`;

}

}

const card=document.createElement("div");
card.className="card";

card.innerHTML=`
<img src="${p.imagen}" onerror="this.src='img/sin_imagen.jpg'">
<h4>${p.producto}</h4>
<p>${p.codigo}</p>
${bloquePrecio}
`;

card.onclick=()=>abrirDetalle(p);

contenedor.appendChild(card);

});

}

const buscador = document.getElementById("buscador");

if(buscador){

buscador.addEventListener("input",e=>{

const t=e.target.value.toLowerCase();

mostrarProductos(
productos.filter(p=>
p.producto.toLowerCase().includes(t)||
p.codigo.toLowerCase().includes(t)||
p.marca.toLowerCase().includes(t)
)
);

});

}

function abrirDetalle(p){

const precioMostrar =
listaPrecioActiva==="LP1"
? p.precioLP1
: (
Number(p.precioPromocion)>0 &&
Number(p.precioPromocion)<Number(p.precioLP4)
)
? p.precioPromocion
: p.precioLP4;

document.getElementById("modal").classList.remove("oculto");

document.getElementById("dImagen").src=p.imagen;
document.getElementById("dNombre").textContent=p.producto;
document.getElementById("dCodigo").textContent="Código: "+p.codigo;
document.getElementById("dMarca").textContent="Marca: "+p.marca;
document.getElementById("dUnidad").textContent="Unidad: "+p.unidad;
document.getElementById("dMaster").textContent="Master: "+p.master;
document.getElementById("dInner").textContent="Inner: "+p.inner;

document.getElementById("dPrecio").textContent=
"Precio: $"+Number(precioMostrar).toFixed(2);

document.getElementById("btnAgregarCarrito").onclick=()=>{
agregarAlCarrito(p);
};

}

document.getElementById("cerrar").onclick=()=>{
document.getElementById("modal").classList.add("oculto");
};

function actualizarContadorCarrito(){

const contador=document.getElementById("contadorCarrito");

const totalItems=carrito.reduce((acc,i)=>acc+i.cantidad,0);

contador.textContent=totalItems;

contador.style.display = totalItems>0 ? "inline-block":"none";

}

function calcularTotalCarrito(){

const total=carrito.reduce((acc,i)=>acc+(i.precio*i.cantidad),0);

document.getElementById("totalHeader").textContent=total.toFixed(2);
document.getElementById("totalCarrito").textContent="TOTAL: $"+total.toFixed(2);

}

function abrirCarrito(){

document.getElementById("modalCarrito").classList.remove("oculto");

renderizarCarrito();

}

function cerrarCarrito(){

document.getElementById("modalCarrito").classList.add("oculto");

}

function renderizarCarrito(){

const contenedor=document.getElementById("contenidoCarrito");

contenedor.innerHTML="";

if(carrito.length===0){

contenedor.innerHTML="<p>El carrito está vacío</p>";
return;

}

carrito.forEach((p,index)=>{

const subtotal=p.precio*p.cantidad;

contenedor.innerHTML+=`
<div class="item-carrito">
<strong>${p.producto}</strong><br>
${p.codigo}<br>
$${p.precio}<br>
Cantidad ${p.cantidad}<br>
Subtotal $${subtotal.toFixed(2)}<br>
<button onclick="eliminarProducto(${index})">Eliminar</button>
</div>
`;

});

}

function eliminarProducto(index){

carrito.splice(index,1);

localStorage.setItem("carrito",JSON.stringify(carrito));

renderizarCarrito();
actualizarContadorCarrito();
calcularTotalCarrito();

}

function vaciarCarrito(){

carrito=[];

localStorage.removeItem("carrito");

renderizarCarrito();
actualizarContadorCarrito();
calcularTotalCarrito();

}

async function agregarAlCarrito(producto){

let precioFinal;

if(listaPrecioActiva==="LP1"){

precioFinal=Number(producto.precioLP1);

}else{

precioFinal =
Number(producto.precioPromocion)>0 &&
Number(producto.precioPromocion)<Number(producto.precioLP4)
? Number(producto.precioPromocion)
: Number(producto.precioLP4);

}

const existente=carrito.find(p=>p.codigo===producto.codigo);

if(existente){

existente.cantidad++;

}else{

carrito.push({
codigo:producto.codigo,
producto:producto.producto,
precio:precioFinal,
cantidad:1
});

}

localStorage.setItem("carrito",JSON.stringify(carrito));

actualizarContadorCarrito();
calcularTotalCarrito();

alert("Producto agregado al carrito");

}