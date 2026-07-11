/* ==========================================================
   MAESRA - MOTOR PDF
   pdfLayout.js
   Manejo de páginas, portada, índice y estilos generales
========================================================== */
let encabezadoBase64 = null; //Primera línea del cambio de encabezado

const PDFLayout = {

    doc: null,

    pageW: 0,

    pageH: 0,

    paginaActual: 1,

    cliente: "",

    logo: null,

    tituloActual: "CATÁLOGO",

    indice: [],

    // ======================================================
    // INICIALIZAR
    // ======================================================

    async inicializar(doc, cliente = "") {

        this.doc = doc;
        this.cliente = cliente;

        this.pageW = doc.internal.pageSize.getWidth();
        this.pageH = doc.internal.pageSize.getHeight();

        this.paginaActual = 1;

        doc.setFont(PDFConfig.fuente);

        // cargar logo si aún no existe

        if (!logoBase64) {

            await cargarLogo();

        }

        this.logo = logoBase64;

	if(!encabezadoBase64){

	    encabezadoBase64 =
        await cargarImagenOptimizada(
            "img/Encabezado-MAESRA.png", 1400
        );

	}

    },

    // ======================================================
    // AGREGAR ENTRADA AL ÍNDICE
    // ======================================================

    agregarIndice(nombre,pagina = null){
        console.log(
        nombre,
        this.paginaActual,
        this.doc.getCurrentPageInfo().pageNumber
    );

    this.indice.push({

        nombre,

        pagina: pagina ??
                this.doc.getCurrentPageInfo().pageNumber

    });

},

    // ======================================================
    // NUEVA PÁGINA
    // ======================================================

    nuevaPagina(titulo = this.tituloActual) {

        this.doc.addPage();

        this.paginaActual++;

        this.tituloActual = titulo;

        this.dibujarCabecera();

    },

    // ======================================================
    // ÁREA DE TRABAJO
    // ======================================================

    areaTrabajo() {

        return {

            x: PDFConfig.margen.izquierdo,

            y:
                PDFConfig.header.alto + 6,

            w:
                this.pageW -
                PDFConfig.margen.izquierdo -
                PDFConfig.margen.derecho,

            h:
                this.pageH -
                PDFConfig.header.alto -
                PDFConfig.footer.alto -
                10

        };

    },

    // ======================================================
    // CAMBIAR TÍTULO
    // ======================================================

    setTitulo(titulo) {

        this.tituloActual = titulo;

    },

    // ======================================================
    // OBTENER DOCUMENTO
    // ======================================================

    getDoc() {

        return this.doc;

    },

    // ======================================================
    // CABECERA
    // ======================================================

    dibujarCabecera() {

        const doc = this.doc;

        if (encabezadoBase64) {

            doc.addImage(

                encabezadoBase64,

                "PNG",

                0,

                0,

                this.pageW,

                17

            );

        }

    },
    
    // ======================================================
    // PIE DE PÁGINA
    // ======================================================

    dibujarPie() {

        const doc = this.doc;

        const margen = PDFConfig.margen.izquierdo;

        const y =
            this.pageH -
            PDFConfig.footer.alto;

        // Línea superior

        doc.setDrawColor(...PDFConfig.colores.linea);

        doc.setLineWidth(PDFConfig.lineas.normal);

        doc.line(

            margen,

            y-2,

            this.pageW-margen,

            y-2

        );

        doc.setFont(PDFConfig.fuente,"normal");

        doc.setFontSize(PDFConfig.tamaño.pequeño);

        doc.setTextColor(...PDFConfig.colores.grisOscuro);

        // Empresa

        doc.text(

            PDFConfig.empresa,

            margen,

            y+2

        );

        // Fecha

        doc.text(

            new Date().toLocaleDateString("es-MX"),

            this.pageW/2,

            y+2,

            {align:"center"}

        );

        // Página

        doc.text(

            "Página " + this.paginaActual,

            this.pageW-margen,

            y+2,

            {align:"right"}

        );

    },

    // ======================================================
    // PORTADA
    // ======================================================

    portada(cliente=""){

        const doc = this.doc;

        doc.setFillColor(255,255,255);

        doc.rect(

            0,

            0,

            this.pageW,

            this.pageH,

            "F"

        );

        // Logo grande

        if(this.logo){

            try{

                doc.addImage(

                    this.logo,

                    "JPEG",

                    (this.pageW-PDFConfig.portada.logoAncho)/2,

                    35,

                    PDFConfig.portada.logoAncho,

                    PDFConfig.portada.logoAlto

                );

            }catch(e){}

        }

        // Título

        doc.setFont(

            PDFConfig.fuente,

            "bold"

        );

        doc.setFontSize(

            PDFConfig.tamaño.portada

        );

        doc.setTextColor(

            ...PDFConfig.colores.negro

        );

        doc.text(

            PDFConfig.catalogo,

            this.pageW/2,

            PDFConfig.portada.tituloY,

            {align:"center"}

        );

        // Versión

        doc.setFont(

            PDFConfig.fuente,

            "normal"

        );

        doc.setFontSize(

            PDFConfig.tamaño.subtitulo

        );

        doc.text(

            "Versión " + PDFConfig.version,

            this.pageW/2,

            PDFConfig.portada.tituloY+10,

            {align:"center"}

        );

        // Cliente

        if(cliente){

            doc.setFontSize(

                PDFConfig.tamaño.encabezado

            );

            doc.text(

                "Cliente:",

                this.pageW/2,

                PDFConfig.portada.clienteY,

                {align:"center"}

            );

            doc.setFont(

                PDFConfig.fuente,

                "bold"

            );

            doc.text(

                cliente,

                this.pageW/2,

                PDFConfig.portada.clienteY+8,

                {align:"center"}

            );

        }

        // Fecha

        doc.setFont(

            PDFConfig.fuente,

            "normal"

        );

        doc.setFontSize(

            PDFConfig.tamaño.normal

        );

        doc.text(

            new Date().toLocaleDateString("es-MX"),

            this.pageW/2,

            PDFConfig.portada.fechaY,

            {align:"center"}

        );
    },

// ======================================================
    // ÍNDICE
    // ======================================================

    dibujarIndice() {

        const doc = this.doc;

        this.nuevaPagina("ÍNDICE");

        const area = this.areaTrabajo();

        let y = area.y;

        doc.setFont(PDFConfig.fuente, "bold");
        doc.setFontSize(PDFConfig.tamaño.titulo);

        doc.text(
            "ÍNDICE",
            this.pageW / 2,
            y,
            { align: "center" }
        );

        y += 12;

        doc.setFont(PDFConfig.fuente, "normal");
        doc.setFontSize(PDFConfig.tamaño.normal);

        this.indice.forEach(item => {

            if (y > this.pageH - 25) {

                this.nuevaPagina("ÍNDICE");
                y = area.y;

            }

            doc.setTextColor(...PDFConfig.colores.negro);

            doc.text(
                item.nombre,
                PDFConfig.indice.margenIzquierdo,
                y
            );

            doc.text(
                String(item.pagina),
                this.pageW - PDFConfig.margen.derecho,
                y,
                { align: "right" }
            );

            // línea punteada

            doc.setDrawColor(...PDFConfig.colores.linea);

            for (let x = 60; x < this.pageW - 25; x += 3) {

                doc.line(
                    x,
                    y - 1,
                    x + 1,
                    y - 1
                );

            }

            y += PDFConfig.indice.saltoLinea;

        });

    },

    // ======================================================
    // TÍTULO DE SECCIÓN
    // ======================================================

    tituloSeccion(texto) {

        const doc = this.doc;

        const area = this.areaTrabajo();

        doc.setFillColor(...PDFConfig.colores.negro);

        doc.rect(
            area.x,
            area.y,
            area.w,
            8,
            "F"
        );

        doc.setFont(PDFConfig.fuente, "bold");

        doc.setFontSize(PDFConfig.tamaño.subtitulo);

        doc.setTextColor(...PDFConfig.colores.blanco);

        doc.text(
            texto,
            area.x + 4,
            area.y + 5.5
        );

        doc.setTextColor(...PDFConfig.colores.negro);

    },

    // ======================================================
    // CAJA DE TÍTULO
    // ======================================================

    cajaTitulo(texto, y) {

        const doc = this.doc;

        const area = this.areaTrabajo();

        doc.setFillColor(...PDFConfig.colores.grisClaro);

        doc.roundedRect(
            area.x,
            y,
            area.w,
            8,
            1,
            1,
            "F"
        );

        doc.setDrawColor(...PDFConfig.colores.linea);

        doc.roundedRect(
            area.x,
            y,
            area.w,
            8,
            1,
            1
        );

        doc.setFont(PDFConfig.fuente, "bold");

        doc.setFontSize(PDFConfig.tamaño.encabezado);

        doc.text(
            texto,
            area.x + 3,
            y + 5
        );

    },

    // ======================================================
    // TEXTO CENTRADO
    // ======================================================

    centrarTexto(texto, y, tamaño = PDFConfig.tamaño.normal) {

        const doc = this.doc;

        doc.setFontSize(tamaño);

        doc.text(
            texto,
            this.pageW / 2,
            y,
            { align: "center" }
        );

    },

    // ======================================================
    // FINALIZAR DOCUMENTO
    // ======================================================

    finalizar() {

        const paginas = this.doc.getNumberOfPages();

        for (let i = 1; i <= paginas; i++) {

            this.doc.setPage(i);

            this.paginaActual = i;

            // No dibujar cabecera en portada

            if (i > 1) {

                this.dibujarPie();

            }

        }

    }

  };
// disponible para todos los módulos
window.PDFLayout = PDFLayout;