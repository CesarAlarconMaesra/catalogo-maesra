/* ==========================================================
   pdfProductos.js
   Dibuja las fichas individuales del catálogo
   ========================================================== */

const PDFProductos = (() => {

    // ======================================================
    // Variables internas
    // ======================================================

    let cols = 4;
    let filas = 5;

    let cardW;
    let cardH;

    let x;
    let y;

    let col;
    let fila;

    // ======================================================
    // Inicializar cuadrícula
    // ======================================================

    function iniciar(doc){

        cardW =
            (PDFLayout.pageW - PDFLayout.margen * 2) / cols;

        cardH =
            (PDFLayout.pageH - 45) / filas;

        x = PDFLayout.margen;
        y = 35;

        col = 0;
        fila = 0;

    }

    // ======================================================
    // Siguiente posición
    // ======================================================

    function siguiente(){

        col++;

        if(col >= cols){

            col = 0;
            fila++;

            x = PDFLayout.margen;
            y += cardH;

        }else{

            x += cardW;

        }

    }

    // ======================================================
    // Nueva página
    // ======================================================

    function nuevaPagina(doc){

        doc.addPage();

        PDFLayout.nPagina++;

        PDFLayout.dibujarEncabezado(
            "PRODUCTOS"
        );

        PDFLayout.dibujarPie();

        iniciar(doc);

    }

    // ======================================================
    // Dibuja una ficha
    // ======================================================

    async function dibujarProducto(doc,p){

        const padding = 3;

        //----------------------------------------------------
        // Marco
        //----------------------------------------------------

        doc.setDrawColor(220);

        doc.rect(
            x,
            y,
            cardW,
            cardH
        );

        let ty = y + padding;

        //----------------------------------------------------
        // Imagen
        //----------------------------------------------------

        await PDFImagenes.dibujarImagenProducto(

            doc,

            p.imagen,

            x + 2,

            ty,

            cardW - 4,

            cardH * 0.38

        );

        ty += (cardH * 0.38) + 4;

        //----------------------------------------------------
        // Código
        //----------------------------------------------------

        doc.setFontSize(6);

        doc.setTextColor(90);

        doc.text(

            "Código: " + p.codigo,

            x + padding,

            ty

        );

        ty += 3;

        //----------------------------------------------------
        // Producto
        //----------------------------------------------------

        doc.setTextColor(0);

        doc.setFontSize(7);

        const descripcion =
            doc.splitTextToSize(

                p.producto,

                cardW - 6

            );

        doc.text(

            descripcion.slice(0,3),

            x + padding,

            ty

        );

        ty += descripcion.slice(0,3).length * 3;

        //----------------------------------------------------
        // Marca
        //----------------------------------------------------

        doc.setFontSize(6);

        doc.text(

            "Marca: " + (p.marca || ""),

            x + padding,

            ty

        );

        ty += 3;

        //----------------------------------------------------
        // Unidad
        //----------------------------------------------------

        doc.text(

            "Unidad: " + (p.unidad || ""),

            x + padding,

            ty

        );

        ty += 3;

        //----------------------------------------------------
        // Master
        //----------------------------------------------------

        doc.text(

            "Master: " + (p.master || ""),

            x + padding,

            ty

        );

        ty += 3;

        //----------------------------------------------------
        // Inner
        //----------------------------------------------------

        doc.text(

            "Inner: " + (p.inner || ""),

            x + padding,

            ty

        );

    }

    // ======================================================
    // Genera todas las fichas
    // ======================================================

    async function generar(doc,lista){

        iniciar(doc);

        PDFLayout.dibujarEncabezado(
            "PRODUCTOS"
        );

        PDFLayout.dibujarPie();

        for(const grupo of lista){

            const p = grupo.articulos[0];

            p.imagen = grupo.imagen;

            await dibujarProducto(doc,p);

            siguiente();

            if(fila >= filas){

                nuevaPagina(doc);

            }

        }

    }

    return{

        generar

    };

})();