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
            productosFamilias.filter(
                f => f.esFamilia
            );

        PDFLayout.setTitulo("FAMILIAS");
        PDFLayout.nuevaPagina();

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
        // Verificar espacio disponible
        //----------------------------------------------------

        const area =
            PDFLayout.areaTrabajo();

        let y =
            doc.lastAutoTable
            ? doc.lastAutoTable.finalY + 4
            : area.y;

        const alturaMinima = 28;

        if(
            y + alturaMinima >
            PDFLayout.pageH -
            PDFConfig.footer.alto -
            12
        ){

            PDFLayout.nuevaPagina(
                "FAMILIAS"
            );

            y =
                PDFLayout.areaTrabajo().y;

        }

        //----------------------------------------------------
        // TÍTULO
        //----------------------------------------------------

        doc.setFont(
            PDFConfig.fuente,
            "bold"
        );

        doc.setFontSize(10.5);

        doc.setTextColor(
            ...PDFConfig.colores.negro
        );

        doc.text(

            familia.familia,

            area.x,

            y

        );

        //----------------------------------------------------
        // Línea inferior
        //----------------------------------------------------

        doc.setDrawColor(
            ...PDFConfig.colores.linea
        );

        doc.setLineWidth(.20);

        doc.line(

            area.x,

            y + 2,

            area.x + area.w,

            y + 2

        );

        //----------------------------------------------------
        // Imagen
        //----------------------------------------------------

        const imgX = area.x;

        const imgY = y + 4;

        const imgW =
            PDFConfig.familias.imagen.ancho;

        const imgH =
            PDFConfig.familias.imagen.alto;

        let base64 =
            cacheImagenes[familia.imagen];

        if(!base64){

            base64 =
                await cargarImagenOptimizada(

                    familia.imagen,

                    220

                );

        }

        if(base64){

            try{

                doc.addImage(

                    base64,

                    "JPEG",

                    imgX,

                    imgY,

                    imgW,

                    imgH

                );

            }

            catch(e){}

        }

        //----------------------------------------------------
        // Marca
        //----------------------------------------------------

        if(familia.marca){

            doc.setFont(
                PDFConfig.fuente,
                "normal"
            );

            doc.setFontSize(6);

            doc.setTextColor(
                ...PDFConfig.colores.grisOscuro
            );

            doc.text(

                familia.marca,

                imgX,

                imgY + imgH + 3

            );

        }

        //----------------------------------------------------
        // Posición inicial de la tabla
        //----------------------------------------------------

        const inicioTabla = imgY;

        const inicioX =
            imgX +
            imgW +
            3;

        //----------------------------------------------------
        // Dibujar tabla
        //----------------------------------------------------

        await this.dibujarTabla(

            doc,

            familia,

            inicioTabla,

            inicioX

        );

    },
    //========================================================
    // TABLA DE ARTÍCULOS
    //========================================================

    async dibujarTabla(
        doc,
        familia,
        startY,
        inicioX
    ){

        const body = familia.articulos.map(a => ([

            a.marca || "",

            a.codigo || "",

            a.producto || "",

            a.unidad || "",

            a.master || "",

            a.inner || ""

        ]));

        const margenNormal =
            PDFConfig.margen.izquierdo;

        const margenTabla =
            inicioX;

        doc.autoTable({

            startY,

            margin:{

                left:margenTabla,

                right:PDFConfig.margen.derecho

            },

            theme:"grid",

            pageBreak:"auto",

            rowPageBreak:"avoid",

            showHead:"everyPage",

            tableWidth:"wrap",

            head:[[

                "Marca",

                "Código",

                "Producto",

                "U",

                "M",

                "I"

            ]],

            body,

            styles:{

                font:PDFConfig.fuente,

                fontSize:5.8,

                cellPadding:.25,

                lineWidth:.10,

                lineColor:PDFConfig.colores.linea,

                textColor:PDFConfig.colores.negro,

                overflow:"linebreak",

                valign:"middle"

            },

            headStyles:{

                fillColor:PDFConfig.colores.negro,

                textColor:PDFConfig.colores.blanco,

                fontStyle:"bold",

                fontSize:6,

                minCellHeight:5,

                halign:"center"

            },

            alternateRowStyles:{

                fillColor:PDFConfig.colores.grisMuyClaro

            },

            columnStyles:{

                0:{

                    cellWidth:16

                },

                1:{

                    cellWidth:18

                },

                2:{

                    cellWidth:46

                },

                3:{

                    cellWidth:8,

                    halign:"center"

                },

                4:{

                    cellWidth:8,

                    halign:"center"

                },

                5:{

                    cellWidth:8,

                    halign:"center"

                }

            },

            didDrawPage:(data)=>{

                //--------------------------------------
                // Cabecera y pie
                //--------------------------------------

                PDFLayout.dibujarCabecera();

                PDFLayout.dibujarPie();

                //--------------------------------------
                // Continuación de tabla
                //--------------------------------------

                if(data.pageNumber>1){

                    const area =
                        PDFLayout.areaTrabajo();

                    doc.setFont(
                        PDFConfig.fuente,
                        "bold"
                    );

                    doc.setFontSize(10);

                    doc.setTextColor(
                        ...PDFConfig.colores.negro
                    );

                    doc.text(

                        familia.familia,

                        margenNormal,

                        area.y

                    );

                    doc.setDrawColor(
                        ...PDFConfig.colores.linea
                    );

                    doc.setLineWidth(.20);

                    doc.line(

                        margenNormal,

                        area.y+2,

                        area.x+area.w,

                        area.y+2

                    );

                }

            }

        });

    },