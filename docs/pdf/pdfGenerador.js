/* ==========================================================
   pdfGenerador.js
   Generador principal del catálogo PDF MAESRA
   ========================================================== */

const PDFGenerador = (() => {

    // ======================================================
    // FUNCIÓN PRINCIPAL
    // ======================================================

    async function generar() {

        try {

            await mostrarProgreso();

            document.getElementById("progresoTexto").innerText =
                "Preparando catálogo...";

            //-------------------------------------------------
            // Precargar imágenes
            //-------------------------------------------------

            const todasLasImagenes = [
                ...productosFamilias
            ];

            await PDFImagenes.precargar(
                todasLasImagenes,
                20
            );

            //-------------------------------------------------
            // Crear documento
            //-------------------------------------------------

            const { jsPDF } = window.jspdf;

            const doc = new jsPDF(
                "p",
                "mm",
                "letter"
            );

            //-------------------------------------------------
            // Inicializar Layout
            //-------------------------------------------------

            PDFLayout.inicializar(doc);

            //-------------------------------------------------
            // Portada
            //-------------------------------------------------

            document.getElementById("progresoTexto").innerText =
                "Creando portada...";

            await PDFLayout.dibujarPortada(
                doc,
                logoBase64
            );

            //-------------------------------------------------
            // Índice
            //-------------------------------------------------

            document.getElementById("progresoTexto").innerText =
                "Generando índice...";

            await PDFLayout.dibujarIndice(
                doc,
                productosFamilias
                    .filter(f => f.esFamilia)
            );

            //-------------------------------------------------
            // Familias
            //-------------------------------------------------

            document.getElementById("progresoTexto").innerText =
                "Generando familias...";

            await PDFFamilias.generar(

                doc,

                productosFamilias.filter(
                    f => f.esFamilia
                )

            );

            //-------------------------------------------------
            // Productos individuales
            //-------------------------------------------------

            document.getElementById("progresoTexto").innerText =
                "Generando productos individuales...";

            await PDFProductos.generar(

                doc,

                productosFamilias.filter(
                    f => !f.esFamilia
                )

            );

            //-------------------------------------------------
            // Guardar PDF
            //-------------------------------------------------

            document.getElementById("progresoTexto").innerText =
                "Guardando PDF...";

            doc.save(
                "Catalogo MAESRA 2026.pdf"
            );

        }
        catch (e) {

            console.error(e);

            alert(
                "Ocurrió un error al generar el catálogo PDF."
            );

        }
        finally {

            ocultarProgreso();

        }

    }

    //---------------------------------------------------------
    // API pública
    //---------------------------------------------------------

    return {

        generar

    };

})();