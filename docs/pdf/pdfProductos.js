/* ==========================================================
   MAESRA - PDF
   pdfProductos.js
   Productos individuales (4x5 por página)
========================================================== */

const PDFProductos = {

    doc: null,
    area: null,

    columnas: 4,
    filas: 5,

    fila: 0,
    columna: 0,

    x: 0,
    y: 0,

    anchoFicha: 0,
    altoFicha: 0,

//==========================================================
// INICIAR SECCIÓN
//==========================================================

iniciarSeccion(doc){

    this.doc = doc;

    PDFLayout.nuevaPagina("PRODUCTOS");

    this.area = PDFLayout.areaTrabajo();

    this.anchoFicha =
        this.area.w / this.columnas;

    this.altoFicha =
        this.area.h / this.filas;

    this.columna = 0;
    this.fila = 0;

    this.x = this.area.x;
    this.y = this.area.y;

},

//==========================================================
// DIBUJAR PRODUCTO
//==========================================================

async dibujarProducto(doc,producto){

    this.doc = doc;

    //------------------------------------------------------
    // BORDE
    //------------------------------------------------------

    doc.setDrawColor(220);
    doc.setLineWidth(.20);

    doc.roundedRect(

        this.x,

        this.y,

        this.anchoFicha,

        this.altoFicha,

        1.5,

        1.5

    );

    //------------------------------------------------------
    // IMAGEN
    //------------------------------------------------------

    let base64 =
        cacheImagenes[producto.imagen];

    if(!base64){

        base64 =
            await cargarImagenOptimizada(
                producto.imagen,
                350
            );

    }

	if(base64){

	    await this.dibujarImagen(base64);

	}

	const inicioTexto =
	    this.y + 34;

    //------------------------------------------------------
    // TEXTO
    //------------------------------------------------------

    this.dibujarTexto(
        producto,
        inicioTexto
    );

    //------------------------------------------------------
    // SIGUIENTE POSICIÓN
    //------------------------------------------------------

    this.siguiente();

},

//==========================================================
// DIBUJAR IMAGEN
//==========================================================

async dibujarImagen(base64){

    if(!base64) return 38;

    const img =
        new Image();

    await new Promise(resolve=>{

        img.onload = resolve;

        img.src = base64;

    });

    let w = img.width;
    let h = img.height;

    const maxW =
        this.anchoFicha - 14;

    const maxH = 24;

    const ratio =
        Math.min(
            maxW / w,
            maxH / h
        );

    w *= ratio;
    h *= ratio;

    const posX =

        this.x +

        (this.anchoFicha-w)/2;

    this.doc.addImage(

        base64,

        "JPEG",

        posX,

        this.y + 4,

        w,

        h

    );

    return h + 8;

},

//==========================================================
// DIBUJAR TEXTO
//==========================================================

dibujarTexto(producto,inicioY){

    const doc = this.doc;

    let y = inicioY;

    //--------------------------------------
    // Código
    //--------------------------------------

    doc.setFontSize(7);

    doc.setTextColor(0);

    doc.setFont(undefined,"bold");

    doc.text(

        producto.codigo,

        this.x+3,

        y

    );

    y += 3.5;


    //--------------------------------------
    // Producto
    //--------------------------------------

    doc.setFont(undefined,"normal");

    doc.setFontSize(7);

    doc.setTextColor(0);

    let nombre =

        doc.splitTextToSize(

            producto.producto,

            this.anchoFicha - 6

        );

    if(nombre.length>2){

        nombre = nombre.slice(0,2);

    }

    doc.text(

        nombre,

        this.x+3,

        y

    );

    y += nombre.length * 3.3;
    y -= 2.5;
    //--------------------------------------
    // Empaque
    //--------------------------------------

doc.setFontSize(6);
doc.setFont(undefined,"bold");
doc.setTextColor(70);

doc.text(
    "Marca:",
    this.x+3,
    y
);

doc.text(
    producto.marca || "",
    this.x+15,
    y
);

y += 3.5;

doc.setFontSize(5.8);

doc.setTextColor(90);

// Unidad

doc.setFont(undefined,"bold");
doc.text("Unidad:", this.x+3, y);

doc.setFont(undefined,"normal");
doc.text(
    String(producto.unidad || ""),
    this.x+8,
    y
);

// Master

doc.setFont(undefined,"bold");
doc.text("Master:", this.x+22, y);

doc.setFont(undefined,"normal");
doc.text(
    String(producto.master || ""),
    this.x+27,
    y
);

// Inner

doc.setFont(undefined,"bold");
doc.text("Inner:", this.x+39, y);

doc.setFont(undefined,"normal");
doc.text(
    String(producto.inner || ""),
    this.x+43,
    y
);
},
//==========================================================
// SIGUIENTE POSICIÓN
//==========================================================

siguiente(){

    this.columna++;

    if(this.columna >= this.columnas){

        this.columna = 0;
        this.fila++;

    }

    if(this.fila >= this.filas){

        this.nuevaPagina();
        return;

    }

    this.x =
        this.area.x +
        (this.columna * this.anchoFicha);

    this.y =
        this.area.y +
        (this.fila * this.altoFicha);

},

//==========================================================
// NUEVA PÁGINA
//==========================================================

nuevaPagina(){

    PDFLayout.nuevaPagina("PRODUCTOS");

    this.fila = 0;
    this.columna = 0;

    this.x = this.area.x;
    this.y = this.area.y;

},

//==========================================================
// REINICIAR POSICIÓN
//==========================================================

reiniciar(){

    this.fila = 0;
    this.columna = 0;

    this.x = this.area.x;
    this.y = this.area.y;

},

//==========================================================
// DIBUJAR TODOS LOS PRODUCTOS
//==========================================================

async dibujarTodos(doc,productos){

    this.iniciarSeccion(doc);

    for(const producto of productos){

        await this.dibujarProducto(
            doc,
            producto
        );

    }

},

//==========================================================
// TOTAL DE PÁGINAS (ESTIMADO)
//==========================================================

calcularPaginas(totalProductos){

    const porPagina =
        this.columnas * this.filas;

    return Math.ceil(
        totalProductos / porPagina
    );

}

};

//==========================================================
// EXPORTAR MÓDULO
//==========================================================

window.PDFProductos = PDFProductos;