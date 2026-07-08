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

        //----------------------------------------------------
        // Área de trabajo
        //----------------------------------------------------

        let area =
            PDFLayout.areaTrabajo();

        let y =
            doc.lastAutoTable
            ? doc.lastAutoTable.finalY + 4
            : area.y;

        //----------------------------------------------------
        // Evitar comenzar una familia al final de la página
        //----------------------------------------------------

        const alturaMinima = 28;

        if(
            y + alturaMinima >
            PDFLayout.pageH -
            PDFConfig.footer.alto -
            12
        ){

            PDFLayout.nuevaPagina("FAMILIAS");

            area =
                PDFLayout.areaTrabajo();

            y = area.y;

        }

        //----------------------------------------------------
        // Registrar índice
        //----------------------------------------------------

	PDFLayout.indice.push({

    	nombre: familia.familia,

	    pagina: doc.getCurrentPageInfo().pageNumber

	});

        //----------------------------------------------------
        // Título
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
        // Línea separadora
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

        const imgX =
            area.x;

        const imgY =
            y + 4;

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

                this.dibujarImagen(

                    doc,

                    base64,

                    imgX,

                    imgY,

                    imgW,

                    imgH

                );

            }

            catch(e){

                console.warn(e);

            }

        }

        //----------------------------------------------------
        // Tabla
        //----------------------------------------------------

        const inicioTabla =
            imgY;

        const inicioX =
            imgX +
            imgW +
            3;

        await this.dibujarTabla(

            doc,

            familia,

            inicioTabla,

            inicioX

        );

    },
//========================================================
    // DIBUJAR IMAGEN DE LA FAMILIA
    //========================================================

    dibujarImagen(
        doc,
        base64,
        x,
        y,
        ancho,
        alto
    ){

        const tam =
            Math.min(ancho,alto);

        const posX =
            x + ((ancho - tam) / 2);

        const posY =
            y + ((alto - tam) / 2);

        doc.addImage(

            base64,

            "JPEG",

            posX,

            posY,

            tam,

            tam

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

        const body =
            familia.articulos.map(a=>([

                a.marca || "",

                a.codigo || "",

                a.producto || "",

                a.unidad || "",

                a.master || "",

                a.inner || ""

            ]));

        doc.autoTable({

            startY,

            margin:{

                left:inicioX,

                right:PDFConfig.margen.derecho

            },

            tableWidth:"wrap",

            theme:"grid",

            pageBreak:"auto",

            rowPageBreak:"avoid",

            showHead:"everyPage",

            head:[[

                "Marca",

                "Código",

                "Producto",

                "Unidad",

                "Master",

                "Inner"

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

                fillColor:
                    PDFConfig.colores.grisMuyClaro

            },

            columnStyles:{

                0:{
                    cellWidth:18
                },

                1:{
                    cellWidth:30
                },

                2:{
                    cellWidth:92
                },

                3:{
                    cellWidth:12,
                    halign:"center"
                },

                4:{
                    cellWidth:10,
                    halign:"center"
                },

                5:{
                    cellWidth:10,
                    halign:"center"
                }

            },
	didParseCell:(data)=>{

	    // Columna Código (índice 1)
	    if(
	        data.section === "body" &&
	        data.column.index === 1
	    ){

	        data.cell.styles.fillColor = [205,163,42];   // Gold
	        data.cell.styles.textColor = [0,0,0];
	        data.cell.styles.fontStyle = "bold";

	    }

	},

            didDrawPage:()=>{

                PDFLayout.dibujarCabecera();

                //PDFLayout.dibujarPie();

            }

        });

    },
    //========================================================
    // CALCULAR ALTURA APROXIMADA DE UNA TABLA
    //========================================================

    calcularAlturaTabla(familia){

        if(
            !familia ||
            !familia.articulos
        ){

            return 0;

        }

        const filas =
            familia.articulos.length;

        // Encabezado + altura aproximada por fila
        return 6 + (filas * 4.2);

    },

    //========================================================
    // TOTAL DE PÁGINAS (ESTIMADO)
    //========================================================

    calcularPaginas(){

        let paginas = 0;

        const familias =
            productosFamilias.filter(
                f => f.esFamilia
            );

        familias.forEach(f=>{

            paginas += Math.max(

                1,

                Math.ceil(

                    this.calcularAlturaTabla(f) / 220

                )

            );

        });

        return paginas;

    }

};

//==========================================================
// EXPORTAR MÓDULO
//==========================================================

window.PDFFamilias = PDFFamilias;