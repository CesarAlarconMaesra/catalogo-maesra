/* ==========================================================
   MAESRA - MOTOR PDF
   pdfFamilias.js
========================================================== */

const PDFFamilias = {

    //========================================================
    // GENERAR TODAS LAS FAMILIAS
    //========================================================

    async generar(doc){

        const familias =
            productosFamilias.filter(f => f.esFamilia);

        PDFLayout.nuevaPagina("FAMILIAS");

        for(const familia of familias){

            await this.dibujarFamilia(
                doc,
                familia
            );

        }

    },

//========================================================
// DIBUJAR UNA FAMILIA
//========================================================

async dibujarFamilia(doc,familia){

    PDFLayout.agregarIndice(
        familia.familia
    );

    //----------------------------------------------------
    // Evitar comenzar una familia al final de una página
    //----------------------------------------------------

    if(doc.lastAutoTable){

        if(
            doc.lastAutoTable.finalY >
            PDFLayout.pageH - 55
        ){

            PDFLayout.nuevaPagina(
                "FAMILIAS"
            );

        }

    }

    const area =
        PDFLayout.areaTrabajo();

    let y =
        doc.lastAutoTable
        ? doc.lastAutoTable.finalY + 6
        : area.y;

    //----------------------------------------------------
    // TÍTULO
    //----------------------------------------------------

    doc.setFont(
        PDFConfig.fuente,
        "bold"
    );

    doc.setFontSize(11);

    doc.setTextColor(
        ...PDFConfig.colores.negro
    );

    doc.text(

        familia.familia,

        area.x + area.w / 2,

        y + 4,

        { align:"center" }

    );

    //----------------------------------------------------
    // LÍNEA
    //----------------------------------------------------

    doc.setDrawColor(
        ...PDFConfig.colores.linea
    );

    doc.setLineWidth(.2);

    doc.line(

        area.x,

        y + 7,

        area.x + area.w,

        y + 7

    );

    //----------------------------------------------------
    // IMAGEN
    //----------------------------------------------------

    const base64 =
        cacheImagenes[familia.imagen) ||
        await cargarImagenOptimizada(
            familia.imagen,
            220
        );

    if(base64){

        try{

            doc.addImage(

                base64,

                "JPEG",

                area.x,

                y + 9,

                PDFConfig.familias.imagen.ancho,

                PDFConfig.familias.imagen.alto

            );

        }catch(e){}

    }

    //----------------------------------------------------
    // TABLA
    //----------------------------------------------------

    await this.dibujarTabla(

        doc,

        familia,

        y + 8

    );

},
//========================================================
    // TABLA DE ARTÍCULOS
    //========================================================

    async dibujarTabla(doc,familia,startY){

        const body = familia.articulos.map(a => ({

            marca: a.marca || "",

            codigo: a.codigo || "",

            producto: a.producto || "",

            unidad: a.unidad || "",

            master: String(a.master || ""),

            inner: String(a.inner || "")

        }));

        doc.autoTable({

            startY,

            theme: "grid",

            margin:{

                left: PDFConfig.margen.izquierdo,

                right: PDFConfig.margen.derecho

            },

            head:[[
                "Marca",
                "Código",
                "Producto",
                "Unidad",
                "Master",
                "Inner"
            ]],

            body: body.map(r => [

                r.marca,

                r.codigo,

                r.producto,

                r.unidad,

                r.master,

                r.inner

            ]),

            styles:{

                font: PDFConfig.fuente,

                fontSize: PDFConfig.tamaño.pequeño,

                cellPadding: 2,

                overflow: "linebreak",

                valign: "middle",

                lineColor: PDFConfig.colores.linea,

                lineWidth: 0.15,

                textColor: PDFConfig.colores.negro

            },

            headStyles:{

                fillColor: PDFConfig.colores.negro,

                textColor: PDFConfig.colores.blanco,

                fontStyle:"bold",

                halign:"center",

                valign:"middle"

            },

            alternateRowStyles:{

                fillColor: PDFConfig.colores.grisClaro

            },

            bodyStyles:{

                textColor: PDFConfig.colores.negro

            },

            columnStyles:{

                0:{
                    cellWidth:18
                },

                1:{
                    cellWidth:24
                },

                2:{
                    cellWidth:82
                },

                3:{
                    cellWidth:15,
                    halign:"center"
                },

                4:{
                    cellWidth:14,
                    halign:"center"
                },

                5:{
                    cellWidth:14,
                    halign:"center"
                }

            },

            pageBreak:"auto",

            rowPageBreak:"avoid",

            showHead:"everyPage",

            didDrawPage:(data)=>{

                PDFLayout.setTitulo("FAMILIAS");

		PDFLayout.dibujarCabecera();

                PDFLayout.dibujarPie();

                // Si la tabla continúa en otra página,
                // mostrar nuevamente el nombre de la familia.

                if(data.pageNumber>1){

                    doc.setFont(
                        PDFConfig.fuente,
                        "bold"
                    );

                    doc.setFontSize(12);

                    doc.setTextColor(
                        ...PDFConfig.colores.negro
                    );

                    const area = PDFLayout.areaTrabajo();

		doc.text(

    		familia.familia,

    		area.x,

    		area.y - 2

		);

                }

            }

        });

    },

    //========================================================
    // DIBUJAR INSIGNIA DE FAMILIA
    //========================================================

    dibujarInsignia(doc, x, y) {

        doc.setFillColor(
            ...PDFConfig.colores.negro
        );

        doc.roundedRect(
            x,
            y,
            28,
            7,
            1.5,
            1.5,
            "F"
        );

        doc.setFont(
            PDFConfig.fuente,
            "bold"
        );

        doc.setFontSize(7);

        doc.setTextColor(
            ...PDFConfig.colores.blanco
        );

        doc.text(
            "FAMILIA",
            x + 14,
            y + 4.5,
            {
                align: "center"
            }
        );

    },

    //========================================================
    // DIBUJAR TOTAL DE ARTÍCULOS
    //========================================================

    dibujarTotalArticulos(doc, total, x, y) {

        doc.setFillColor(
            ...PDFConfig.colores.grisOscuro
        );

        doc.roundedRect(
            x,
            y,
            24,
            18,
            2,
            2,
            "F"
        );

        doc.setFont(
            PDFConfig.fuente,
            "bold"
        );

        doc.setFontSize(14);

        doc.setTextColor(
            ...PDFConfig.colores.blanco
        );

        doc.text(
            String(total),
            x + 12,
            y + 8,
            {
                align: "center"
            }
        );

        doc.setFont(
            PDFConfig.fuente,
            "normal"
        );

        doc.setFontSize(6);

        doc.text(
            "ARTÍCULOS",
            x + 12,
            y + 14,
            {
                align: "center"
            }
        );

    },

    //========================================================
    // DIBUJAR LOGO PEQUEÑO
    //========================================================

    dibujarLogo(doc, x, y) {

        if (!logoBase64) return;

        try {

            doc.addImage(
                logoBase64,
                "JPEG",
                x,
                y,
                16,
                9
            );

        } catch (e) {}

    }

};

//==========================================================
// EXPORTAR MÓDULO
//==========================================================

window.PDFFamilias = PDFFamilias;
