/* ==========================================================
   MAESRA - PDF
   pdfGenerador.js
   Generador principal del catálogo
========================================================== */

const PDFGenerador = {

//==========================================================
// GENERAR CATÁLOGO
//==========================================================

async generar(){

    try{

        //--------------------------------------------------
        // PROGRESO
        //--------------------------------------------------

        await mostrarProgreso();

        document.getElementById(
            "progresoTexto"
        ).innerText =
            "Preparando catálogo...";

        //--------------------------------------------------
        // CARGAR LOGO
        //--------------------------------------------------

        await cargarLogo();

        //--------------------------------------------------
        // PRECARGAR IMÁGENES
        //--------------------------------------------------

        await PDFImagenes.precargar(
            productosFamilias,
            20
        );

        //--------------------------------------------------
        // CREAR PDF
        //--------------------------------------------------

        const { jsPDF } = window.jspdf;

        const doc =
            new jsPDF(
                "p",
                "mm",
                "letter"
            );

        //--------------------------------------------------
        // INICIALIZAR LAYOUT
        //--------------------------------------------------

        inicializarLayout(doc);

        //--------------------------------------------------
        // PORTADA
        //--------------------------------------------------

        this.crearPortada(doc);

        //--------------------------------------------------
        // ÍNDICE
        //--------------------------------------------------

        this.crearIndice(doc);

        //--------------------------------------------------
        // FAMILIAS
        //--------------------------------------------------

        await this.generarFamilias(doc);

        //--------------------------------------------------
        // PRODUCTOS
        //--------------------------------------------------

        await this.generarProductos(doc);

        //--------------------------------------------------
        // GUARDAR
        //--------------------------------------------------

        document.getElementById(
            "progresoTexto"
        ).innerText =
            "Guardando PDF...";

        doc.save(
            "Catalogo MAESRA 2026.pdf"
        );

    }

    catch(error){

        console.error(error);

        alert(
            "Ocurrió un error al generar el catálogo."
        );

    }

    finally{

        ocultarProgreso();

    }

},

//==========================================================
// PORTADA
//==========================================================

crearPortada(doc){

    iniciarDocumento(
        "CATÁLOGO MAESRA"
    );

    if(PDFLayout.logo){

        try{

            doc.addImage(

                PDFLayout.logo,

                "JPEG",

                45,

                35,

                125,

                65

            );

        }catch(e){}

    }

    doc.setFontSize(24);
    doc.setFont(undefined,"bold");

    doc.text(

        "CATÁLOGO GENERAL",

        PDFLayout.pageW/2,

        120,

        {align:"center"}

    );

    doc.setFont(undefined,"normal");

    doc.setFontSize(12);

    doc.text(

        "Productos por familias",

        PDFLayout.pageW/2,

        130,

        {align:"center"}

    );

    if(cliente){

        doc.setFontSize(11);

        doc.text(

            "Cliente: " + cliente,

            PDFLayout.pageW/2,

            142,

            {align:"center"}

        );

    }

    doc.setFontSize(10);

    doc.text(

        new Date().toLocaleDateString(),

        PDFLayout.pageW/2,

        154,

        {align:"center"}

    );

},

//==========================================================
// ÍNDICE
//==========================================================

crearIndice(doc){

    nuevaPagina("ÍNDICE");

    const familias =

        productosFamilias

        .filter(f=>f.esFamilia)

        .sort((a,b)=>

            a.familia.localeCompare(

                b.familia

            )

        );

    let y = 30;

    doc.setFontSize(11);

    familias.forEach(f=>{

        doc.text(

            "• " + f.familia,

            18,

            y

        );

        y += 6;

        if(y > 265){

            nuevaPagina("ÍNDICE");

            y = 30;

        }

    });

},
//==========================================================
// GENERAR FAMILIAS
//==========================================================

async generarFamilias(doc){

    document.getElementById(
        "progresoTexto"
    ).innerText = "Generando familias...";

    const familias = productosFamilias.filter(
        f => f.esFamilia
    );

    let progreso = 0;

    const total =
        productosFamilias.length;

    await PDFFamilias.dibujarTodas(
        doc,
        familias
    );

    progreso += familias.length;

    actualizarProgreso(
        progreso,
        total
    );

},

//==========================================================
// GENERAR PRODUCTOS INDIVIDUALES
//==========================================================

async generarProductos(doc){

    document.getElementById(
        "progresoTexto"
    ).innerText = "Generando productos...";

    const individuales =
        productosFamilias.filter(
            f => !f.esFamilia
        );

    const lista = [];

    individuales.forEach(grupo=>{

        if(grupo.articulos.length){

            lista.push({

                ...grupo.articulos[0],

                imagen:grupo.imagen

            });

        }

    });

    await PDFProductos.dibujarTodos(
        doc,
        lista
    );

    actualizarProgreso(
        productosFamilias.length,
        productosFamilias.length
    );

},

//==========================================================
// ESTADÍSTICAS
//==========================================================

obtenerResumen(){

    return{

        familias:

            productosFamilias.filter(
                f=>f.esFamilia
            ).length,

        individuales:

            productosFamilias.filter(
                f=>!f.esFamilia
            ).length,

        totalArticulos:

            productos.length

    };

},

//==========================================================
// DEPURACIÓN
//==========================================================

mostrarResumen(){

    console.table(

        this.obtenerResumen()

    );

}

};

//==========================================================
// EXPORTAR
//==========================================================

window.PDFGenerador = PDFGenerador;