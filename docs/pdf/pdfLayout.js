// ==========================================================
// MAESRA - MOTOR PDF
// pdfLayout.js
// Manejo de páginas, encabezados, pie y estilos generales
// ==========================================================

const PDFLayout = {

    // ------------------------------------------------------
    // CONFIGURACIÓN GENERAL
    // ------------------------------------------------------

    margen: 10,

    headerHeight: 18,

    footerHeight: 10,

    colorPrincipal: [0, 0, 0],

    grisClaro: [245, 245, 245],

    grisOscuro: [225, 225, 225],

    grisLinea: [215, 215, 215],

    fuente: "helvetica",

    logo: null,

    paginaActual: 1,

    totalPaginas: 1,

    tituloActual: "CATÁLOGO",

    año: new Date().getFullYear()

};


// ==========================================================
// INICIALIZAR
// ==========================================================

function inicializarLayout(doc){

    PDFLayout.doc = doc;

    PDFLayout.pageW = doc.internal.pageSize.getWidth();
    PDFLayout.pageH = doc.internal.pageSize.getHeight();

    doc.setFont(PDFLayout.fuente);

}


// ==========================================================
// CARGAR LOGO
// ==========================================================

async function cargarLogoPDF(){

    if(logoBase64){

        PDFLayout.logo = logoBase64;
        return;

    }

    try{

        await cargarLogo();

        PDFLayout.logo = logoBase64;

    }catch(e){

        console.warn("No fue posible cargar logo");

    }

}


// ==========================================================
// CABECERA
// ==========================================================

function dibujarCabecera(titulo="CATÁLOGO"){

    const doc = PDFLayout.doc;

    PDFLayout.tituloActual = titulo;

    // Línea inferior

    doc.setDrawColor(180);
    doc.setLineWidth(.3);

    doc.line(
        PDFLayout.margen,
        PDFLayout.headerHeight,
        PDFLayout.pageW-PDFLayout.margen,
        PDFLayout.headerHeight
    );

    // Logo

    if(PDFLayout.logo){

        try{

            doc.addImage(
                PDFLayout.logo,
                "JPEG",
                PDFLayout.margen,
                4,
                18,
                10
            );

        }catch(e){}

    }

    // Título

    doc.setFontSize(14);

    doc.setFont(undefined,"bold");

    doc.setTextColor(20);

    doc.text(
        titulo,
        PDFLayout.pageW/2,
        10,
        {align:"center"}
    );

    doc.setFont(undefined,"normal");

    // Año

    doc.setFontSize(8);

    doc.setTextColor(120);

    doc.text(
        PDFLayout.año.toString(),
        PDFLayout.pageW-PDFLayout.margen,
        9,
        {align:"right"}
    );

}


// ==========================================================
// PIE DE PÁGINA
// ==========================================================

function dibujarPiePagina(){

    const doc = PDFLayout.doc;

    const y =
        PDFLayout.pageH-
        PDFLayout.footerHeight;

    doc.setDrawColor(180);

    doc.line(
        PDFLayout.margen,
        y-2,
        PDFLayout.pageW-PDFLayout.margen,
        y-2
    );

    doc.setFontSize(8);

    doc.setTextColor(120);

    doc.text(
        "MAESRA",
        PDFLayout.margen,
        y+2
    );

    doc.text(
        new Date().toLocaleDateString(),
        PDFLayout.pageW/2,
        y+2,
        {align:"center"}
    );

    doc.text(
        "Página " + PDFLayout.paginaActual,
        PDFLayout.pageW-PDFLayout.margen,
        y+2,
        {align:"right"}
    );

}


// ==========================================================
// NUEVA PÁGINA
// ==========================================================

function nuevaPagina(titulo="CATÁLOGO"){

    const doc = PDFLayout.doc;

    doc.addPage();

    PDFLayout.paginaActual++;

    dibujarCabecera(titulo);

    dibujarPiePagina();

}


// ==========================================================
// PRIMERA PÁGINA
// ==========================================================

function iniciarDocumento(titulo="CATÁLOGO"){

    PDFLayout.paginaActual = 1;

    dibujarCabecera(titulo);

    dibujarPiePagina();

}


// ==========================================================
// ÁREA ÚTIL
// ==========================================================

function areaTrabajo(){

    return{

        x:PDFLayout.margen,

        y:PDFLayout.headerHeight+5,

        w:PDFLayout.pageW-(PDFLayout.margen*2),

        h:PDFLayout.pageH-
            PDFLayout.headerHeight-
            PDFLayout.footerHeight-
            8

    };

}


// ==========================================================
// COLORES RÁPIDOS
// ==========================================================

function colorTexto(){

    PDFLayout.doc.setTextColor(0);

}

function colorGris(){

    PDFLayout.doc.setTextColor(120);

}

function colorBlanco(){

    PDFLayout.doc.setTextColor(255);

}


// ==========================================================
// FONDOS
// ==========================================================

function fondoGrisClaro(){

    PDFLayout.doc.setFillColor(
        ...PDFLayout.grisClaro
    );

}

function fondoGrisOscuro(){

    PDFLayout.doc.setFillColor(
        ...PDFLayout.grisOscuro
    );

}

function fondoNegro(){

    PDFLayout.doc.setFillColor(0,0,0);

}
