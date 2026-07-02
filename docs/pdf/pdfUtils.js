// ==========================================================
// MAESRA - MOTOR PDF
// pdfUtils.js
// Funciones utilitarias para dibujo, texto y medidas
// ==========================================================


// ==========================================================
// TEXTO CENTRADO
// ==========================================================

function textoCentrado(texto, y, size = 12, negrita = false){

    const doc = PDFLayout.doc;

    doc.setFontSize(size);
    doc.setFont(undefined, negrita ? "bold" : "normal");

    doc.text(
        texto,
        PDFLayout.pageW / 2,
        y,
        { align: "center" }
    );

}


// ==========================================================
// TEXTO DERECHA
// ==========================================================

function textoDerecha(texto, x, y, size = 10){

    const doc = PDFLayout.doc;

    doc.setFontSize(size);

    doc.text(
        texto,
        x,
        y,
        { align: "right" }
    );

}


// ==========================================================
// TEXTO IZQUIERDA
// ==========================================================

function texto(texto, x, y, size = 10, negrita = false){

    const doc = PDFLayout.doc;

    doc.setFontSize(size);
    doc.setFont(undefined, negrita ? "bold" : "normal");

    doc.text(texto, x, y);

}


// ==========================================================
// PARTIR TEXTO
// ==========================================================

function dividirTexto(textoOriginal, ancho){

    return PDFLayout.doc.splitTextToSize(
        textoOriginal || "",
        ancho
    );

}


// ==========================================================
// ALTURA DE TEXTO
// ==========================================================

function alturaTexto(lineas, altoLinea = 4){

    if(Array.isArray(lineas)){

        return lineas.length * altoLinea;

    }

    return altoLinea;

}


// ==========================================================
// DIBUJAR CAJA
// ==========================================================

function caja(x, y, w, h){

    PDFLayout.doc.rect(
        x,
        y,
        w,
        h
    );

}


// ==========================================================
// CAJA RELLENA
// ==========================================================

function cajaRellena(x, y, w, h){

    PDFLayout.doc.rect(
        x,
        y,
        w,
        h,
        "F"
    );

}


// ==========================================================
// LÍNEA
// ==========================================================

function linea(x1, y1, x2, y2){

    PDFLayout.doc.line(
        x1,
        y1,
        x2,
        y2
    );

}


// ==========================================================
// MEDIR TEXTO
// ==========================================================

function anchoTexto(texto){

    return PDFLayout.doc.getTextWidth(
        texto
    );

}


// ==========================================================
// ESPACIO DISPONIBLE EN PÁGINA
// ==========================================================

function espacioDisponible(yActual){

    return (
        PDFLayout.pageH -
        PDFLayout.footerHeight -
        yActual
    );

}


// ==========================================================
// VERIFICAR SALTO DE PÁGINA
// ==========================================================

function verificarSalto(yActual, alturaNecesaria, titulo){

    if(
        yActual + alturaNecesaria >
        PDFLayout.pageH -
        PDFLayout.footerHeight -
        5
    ){

        nuevaPagina(titulo);

        return PDFLayout.headerHeight + 10;

    }

    return yActual;

}


// ==========================================================
// IMAGEN CENTRADA
// ==========================================================

async function dibujarImagenCentro(base64, x, y, anchoMax, altoMax){

    if(!base64) return;

    const img = new Image();

    await new Promise(resolve=>{

        img.onload = resolve;
        img.src = base64;

    });

    let w = img.width;
    let h = img.height;

    const ratio = Math.min(
        anchoMax / w,
        altoMax / h
    );

    w *= ratio;
    h *= ratio;

    PDFLayout.doc.addImage(

        base64,

        "JPEG",

        x + (anchoMax - w) / 2,

        y + (altoMax - h) / 2,

        w,

        h

    );

}


// ==========================================================
// FECHA
// ==========================================================

function fechaActual(){

    const hoy = new Date();

    return hoy.toLocaleDateString(
        "es-MX"
    );

}


// ==========================================================
// HORA
// ==========================================================

function horaActual(){

    const hoy = new Date();

    return hoy.toLocaleTimeString(
        "es-MX"
    );

}


// ==========================================================
// FORMATO NÚMERO
// ==========================================================

function numero(valor){

    if(valor === undefined) return "";

    if(valor === null) return "";

    return String(valor);

}


// ==========================================================
// DIBUJAR TÍTULO DE SECCIÓN
// ==========================================================

function tituloSeccion(textoTitulo, y){

    const doc = PDFLayout.doc;

    PDFLayout.fondoNegro();

    cajaRellena(

        PDFLayout.margen,

        y,

        PDFLayout.pageW - (PDFLayout.margen * 2),

        8

    );

    PDFLayout.textoBlanco();

    doc.setFontSize(13);
    doc.setFont(undefined, "bold");

    doc.text(

        textoTitulo,

        PDFLayout.pageW / 2,

        y + 5,

        { align: "center" }

    );

    PDFLayout.textoNegro();

    doc.setFont(undefined, "normal");

}


// ==========================================================
// DIBUJAR ETIQUETA
// ==========================================================

function etiqueta(textoEtiqueta, valor, x, y){

    const doc = PDFLayout.doc;

    doc.setFont(undefined, "bold");

    doc.text(

        textoEtiqueta,

        x,

        y

    );

    doc.setFont(undefined, "normal");

    doc.text(

        numero(valor),

        x + 20,

        y

    );

}


// ==========================================================
// ALTO DE FILA
// ==========================================================

function calcularAltoFila(textoProducto){

    const lineas = dividirTexto(

        textoProducto,

        60

    );

    return Math.max(

        5,

        lineas.length * 4

    );

}


// ==========================================================
// ESPERAR REFRESCO
// ==========================================================

async function refrescarUI(){

    await new Promise(

        r => setTimeout(r,0)

    );

}