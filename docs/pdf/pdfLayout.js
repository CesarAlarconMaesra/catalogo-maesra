/* ==========================================================
   MAESRA PDF
   pdfLayout.js
   Manejo de diseño general del catálogo
========================================================== */

const PDFLayout = {

    doc: null,

    margen: 10,

    pageW: 0,

    pageH: 0,

    headerH: 18,

    footerH: 10,

    paginaActual: 1,

    totalPaginas: 1,

    tituloActual: "",

    logoW: 22,

    logoH: 12,

    grisClaro: [245,245,245],

    grisOscuro: [228,228,228],

    grisLinea: [210,210,210],

    negro:[0,0,0],

    blanco:[255,255,255]

};


// ======================================================
// INICIALIZAR
// ======================================================

PDFLayout.inicializar = function(doc){

    this.doc = doc;

    this.pageW =
        doc.internal.pageSize.getWidth();

    this.pageH =
        doc.internal.pageSize.getHeight();

    this.paginaActual = 1;

    doc.setFont("helvetica","normal");

};


// ======================================================
// ÁREA ÚTIL
// ======================================================

PDFLayout.areaTrabajo=function(){

    return{

        x:this.margen,

        y:this.headerH+6,

        w:this.pageW-(this.margen*2),

        h:this.pageH-
          this.headerH-
          this.footerH-
          8

    };

};


// ======================================================
// CABECERA
// ======================================================

PDFLayout.cabecera=function(titulo=""){

    this.tituloActual=titulo;

    const doc=this.doc;

    if(logoBase64){

        try{

            doc.addImage(

                logoBase64,

                "JPEG",

                this.margen,

                4,

                this.logoW,

                this.logoH

            );

        }catch(e){}

    }

    doc.setFontSize(15);

    doc.setFont(undefined,"bold");

    doc.setTextColor(20);

    doc.text(

        titulo,

        this.pageW/2,

        10,

        {align:"center"}

    );

    doc.setFont(undefined,"normal");

    doc.setDrawColor(180);

    doc.setLineWidth(.3);

    doc.line(

        this.margen,

        this.headerH,

        this.pageW-this.margen,

        this.headerH

    );

};
// ======================================================
// PORTADA
// ======================================================

PDFLayout.portada = function(titulo, cliente = ""){

    const doc = this.doc;

    doc.setFillColor(0,0,0);

    doc.rect(
        0,
        0,
        this.pageW,
        this.pageH,
        "F"
    );

    if(logoBase64){

        try{

            doc.addImage(
                logoBase64,
                "JPEG",
                this.pageW/2 - 35,
                35,
                70,
                38
            );

        }catch(e){}

    }

    doc.setTextColor(255);

    doc.setFontSize(24);
    doc.setFont(undefined,"bold");

    doc.text(
        titulo,
        this.pageW/2,
        95,
        {align:"center"}
    );

    doc.setFontSize(12);
    doc.setFont(undefined,"normal");

    doc.text(
        "Catálogo Digital",
        this.pageW/2,
        105,
        {align:"center"}
    );

    if(cliente){

        doc.setFontSize(11);

        doc.text(
            "Cliente: " + cliente,
            this.pageW/2,
            118,
            {align:"center"}
        );

    }

    doc.setFontSize(10);

    doc.text(
        new Date().toLocaleDateString(),
        this.pageW/2,
        this.pageH-25,
        {align:"center"}
    );

};


// ======================================================
// ÍNDICE
// ======================================================

PDFLayout.indice = function(familias){

    this.doc.addPage();

    this.paginaActual++;

    this.cabecera("ÍNDICE");

    this.pie();

    const doc = this.doc;

    let y = 30;

    doc.setFontSize(12);

    doc.setFont(undefined,"bold");

    doc.text(
        "Familias",
        this.margen,
        y
    );

    y += 10;

    doc.setFont(undefined,"normal");

    familias.forEach((f,i)=>{

        if(y > this.pageH-20){

            this.nuevaPagina("ÍNDICE");

            y = 30;

        }

        doc.text(
            (i+1)+". "+f,
            this.margen,
            y
        );

        y += 6;

    });

};


// ======================================================
// PIE
// ======================================================

PDFLayout.pie = function(){

    const doc = this.doc;

    const y = this.pageH - this.footerH;

    doc.setDrawColor(180);

    doc.line(
        this.margen,
        y-2,
        this.pageW-this.margen,
        y-2
    );

    doc.setFontSize(8);

    doc.setTextColor(120);

    doc.text(
        "MAESRA",
        this.margen,
        y+2
    );

    doc.text(
        new Date().toLocaleDateString(),
        this.pageW/2,
        y+2,
        {align:"center"}
    );

};


// ======================================================
// NUEVA PÁGINA
// ======================================================

PDFLayout.nuevaPagina = function(titulo){

    this.doc.addPage();

    this.paginaActual++;

    this.cabecera(titulo);

    this.pie();

};


// ======================================================
// NUMERAR TODAS LAS PÁGINAS
// ======================================================

PDFLayout.agregarPiePaginas = function(doc){

    const total = doc.getNumberOfPages();

    for(let i=1;i<=total;i++){

        doc.setPage(i);

        doc.setFontSize(8);

        doc.setTextColor(120);

        doc.text(

            "Página " + i + " de " + total,

            this.pageW - this.margen,

            this.pageH - 8,

            {align:"right"}

        );

    }

};
// ======================================================
// COLORES DE TEXTO
// ======================================================

PDFLayout.textoNegro = function(){

    this.doc.setTextColor(0,0,0);

};

PDFLayout.textoGris = function(){

    this.doc.setTextColor(120,120,120);

};

PDFLayout.textoBlanco = function(){

    this.doc.setTextColor(255,255,255);

};


// ======================================================
// FONDOS
// ======================================================

PDFLayout.fondoClaro = function(){

    this.doc.setFillColor(...this.grisClaro);

};

PDFLayout.fondoOscuro = function(){

    this.doc.setFillColor(...this.grisOscuro);

};

PDFLayout.fondoNegro = function(){

    this.doc.setFillColor(0,0,0);

};


// ======================================================
// LÍNEAS
// ======================================================

PDFLayout.lineaSuave = function(){

    this.doc.setDrawColor(...this.grisLinea);

    this.doc.setLineWidth(.15);

};

PDFLayout.lineaNormal = function(){

    this.doc.setDrawColor(180);

    this.doc.setLineWidth(.3);

};


// ======================================================
// TIPOGRAFÍAS
// ======================================================

PDFLayout.tituloGrande = function(){

    this.doc.setFont("helvetica","bold");

    this.doc.setFontSize(16);

    this.doc.setTextColor(0);

};

PDFLayout.tituloMediano = function(){

    this.doc.setFont("helvetica","bold");

    this.doc.setFontSize(12);

    this.doc.setTextColor(0);

};

PDFLayout.texto = function(){

    this.doc.setFont("helvetica","normal");

    this.doc.setFontSize(8);

    this.doc.setTextColor(0);

};

PDFLayout.textoPequeño = function(){

    this.doc.setFont("helvetica","normal");

    this.doc.setFontSize(7);

    this.doc.setTextColor(70);

};


// ======================================================
// ENCABEZADO NEGRO PARA TABLAS
// ======================================================

PDFLayout.estiloEncabezadoTabla = function(){

    return{

        fillColor:[0,0,0],

        textColor:[255,255,255],

        fontStyle:"bold",

        fontSize:8,

        halign:"left",

        valign:"middle"

    };

};


// ======================================================
// ESTILO CUERPO TABLAS
// ======================================================

PDFLayout.estiloTabla = function(){

    return{

        fontSize:7,

        cellPadding:1.8,

        lineWidth:.15,

        lineColor:[215,215,215],

        textColor:[0,0,0],

        overflow:"linebreak",

        valign:"middle"

    };

};


// ======================================================
// FILAS ALTERNADAS
// ======================================================

PDFLayout.estiloAlternado = function(data){

    if(data.section !== "body") return;

    if(data.row.index % 2 === 0){

        data.cell.styles.fillColor=[245,245,245];

    }else{

        data.cell.styles.fillColor=[228,228,228];

    }

};


// ======================================================
// MÁRGENES PARA AUTOTABLE
// ======================================================

PDFLayout.margenesTabla = function(){

    return{

        left:this.margen,

        right:this.margen,

        top:this.headerH+8,

        bottom:this.footerH+5

    };

};


// ======================================================
// COORDENADA Y INICIAL DE CONTENIDO
// ======================================================

PDFLayout.inicioContenido = function(){

    return this.headerH + 8;

};


// ======================================================
// FIN DE PÁGINA
// ======================================================

PDFLayout.finPagina = function(){

    return this.pageH - this.footerH - 6;

};


// ======================================================
// EXPORTAR
// ======================================================

window.PDFLayout = PDFLayout;