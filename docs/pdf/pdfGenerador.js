/* ==========================================================
   MAESRA - MOTOR PDF
   pdfGenerador.js
   Generador principal del catálogo
========================================================== */

const PDFGenerador = {

    //========================================================
    // GENERAR CATÁLOGO
    //========================================================

    async generar() {

        try {

            //------------------------------------------
            // Mostrar progreso
            //------------------------------------------

            mostrarProgreso();

            document.getElementById(
                "progresoTexto"
            ).innerText =
                "Preparando catálogo...";

            //------------------------------------------
            // Precargar imágenes
            //------------------------------------------

            await precargarImagenes(
                productosFamilias,
                20
            );

            //------------------------------------------
            // Crear PDF
            //------------------------------------------

            const { jsPDF } = window.jspdf;

            const doc = new jsPDF({

                orientation: "portrait",

                unit: "mm",

                format: "letter",

                compress: true

            });

            //------------------------------------------
            // Inicializar Layout
            //------------------------------------------

            await PDFLayout.inicializar(doc);

            //------------------------------------------
            // Portada
            //------------------------------------------

            PDFLayout.portada(

                "CATÁLOGO MAESRA",

                cliente || ""

            );

            //------------------------------------------
            // Familias
            //------------------------------------------

            document.getElementById(
                "progresoTexto"
            ).innerText =
                "Generando familias...";

            await PDFFamilias.generar(
                doc
            );

            //------------------------------------------
            // Productos individuales
            //------------------------------------------

            document.getElementById(
                "progresoTexto"
            ).innerText =
                "Generando productos...";

            await PDFProductos.generar(
                doc
            );
            //------------------------------------------
// Construir índice
//------------------------------------------

document.getElementById(
    "progresoTexto"
).innerText =
    "Construyendo índice...";

PDFLayout.dibujarIndice();

            //------------------------------------------
            // Numeración de páginas
            //------------------------------------------

            document.getElementById(
                "progresoTexto"
            ).innerText =
                "Numerando páginas...";

            if(typeof PDFLayout.actualizarNumeracion === "function"){

                PDFLayout.actualizarNumeracion(doc);

            }

            //------------------------------------------
            // Guardar PDF
            //------------------------------------------

            document.getElementById(
                "progresoTexto"
            ).innerText =
                "Guardando catálogo...";

            doc.save(
                "Catalogo MAESRA 2026.pdf"
            );

        }

        catch(error){

            console.error(error);

            alert(
                "Ocurrió un error al generar el catálogo.\n\n" +
                error.message
            );

        }

        finally{

            ocultarProgreso();

        }

    }

};

//==========================================================
// EXPORTAR MÓDULO
//==========================================================

window.PDFGenerador = PDFGenerador;