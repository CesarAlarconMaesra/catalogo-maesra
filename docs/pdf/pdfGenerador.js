/* =====================================================
   pdf/pdfGenerador.js
   Generador principal del catálogo MAESRA
===================================================== */

async function generarCatalogoCompletoPDF() {

    try {

        await mostrarProgreso();

        document.getElementById("progresoTexto").innerText =
            "Preparando catálogo...";

        // ---------------------------------------
        // Precarga de imágenes
        // ---------------------------------------

        await precargarImagenes(productosFamilias, 20);

        // ---------------------------------------
        // Crear PDF
        // ---------------------------------------

        const { jsPDF } = window.jspdf;

        const doc = new jsPDF(
            "p",
            "mm",
            "letter"
        );

        PDFLayout.inicializar(doc);

        // ---------------------------------------
        // Portada
        // ---------------------------------------

        PDFLayout.portada(
            "CATÁLOGO MAESRA 2026",
            cliente || ""
        );

        // ---------------------------------------
        // Índice
        // ---------------------------------------

        PDFLayout.indice(
            productosFamilias
                .filter(f => f.esFamilia)
                .map(f => f.familia)
        );

        // ---------------------------------------
        // Familias primero
        // ---------------------------------------

        document.getElementById("progresoTexto").innerText =
            "Generando familias...";

        const familias =
            productosFamilias.filter(f => f.esFamilia);

        let progreso = 0;
        const total =
            productosFamilias.length;

        for (const familia of familias) {

            await PDFFamilias.dibujarFamilia(
                doc,
                familia
            );

            progreso++;

            actualizarProgreso(
                progreso,
                total
            );

            await new Promise(r =>
                setTimeout(r, 0)
            );
        }

        // ---------------------------------------
        // Productos individuales
        // ---------------------------------------

        document.getElementById("progresoTexto").innerText =
            "Generando productos...";

        const individuales =
            productosFamilias.filter(f => !f.esFamilia);

        PDFProductos.iniciarSeccion(doc);

        for (const grupo of individuales) {

            const producto = {
                ...grupo.articulos[0],
                imagen: grupo.imagen
            };

            await PDFProductos.dibujarProducto(
                doc,
                producto
            );

            progreso++;

            actualizarProgreso(
                progreso,
                total
            );

            await new Promise(r =>
                setTimeout(r, 0)
            );
        }

        // ---------------------------------------
        // Numeración
        // ---------------------------------------

        PDFLayout.agregarPiePaginas(doc);

        // ---------------------------------------
        // Guardar
        // ---------------------------------------

        document.getElementById("progresoTexto").innerText =
            "Guardando PDF...";

        doc.save("Catalogo MAESRA 2026.pdf");

    }
    catch (err) {

        console.error(err);

        alert(
            "Ocurrió un error al generar el catálogo."
        );

    }
    finally {

        ocultarProgreso();

    }

}