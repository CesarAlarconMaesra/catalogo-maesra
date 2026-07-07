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

	const tam = Math.min(imgW,imgH);

	const posX =
	    imgX + (imgW-tam)/2;

	const posY =
	    imgY + (imgH-tam)/2;

	doc.addImage(

	    base64,

	    "JPEG",

	    posX,

	    posY,

	    tam,

	    tam

	);
            }

            catch(e){}

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
	let indiceRegistrado = false;
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

                "Unidad",

                "Master:",

                "Inner:"

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

                    cellWidth:18

                },

                1:{

                    cellWidth:32

                },

                2:{

                    cellWidth:86

                },

                3:{

                    cellWidth:12,

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
		if(!indiceRegistrado){

        	PDFLayout.indice.push({

            	nombre: familia.familia,

            	pagina: doc.getCurrentPageInfo().pageNumber

        });

        indiceRegistrado = true;

    }

}

              },
});   // ← aquí termina autoTable()

},     // ← aquí termina dibujarTabla()
    //========================================================
    // CALCULAR ALTURA APROXIMADA DE UNA TABLA
    //========================================================

    calcularAlturaTabla(familia){

        const filas =
            familia.articulos
            ? familia.articulos.length
            : 0;

        // Encabezado + filas
        return 6 + (filas * 4.2);

    },

    //========================================================
    // DIBUJAR INSIGNIA DE MARCA
    //========================================================

    dibujarInsignia(doc,texto,x,y){

        if(!texto) return;

        doc.setFillColor(
            ...PDFConfig.colores.grisClaro
        );

        doc.roundedRect(

            x,

            y,

            18,

            5,

            1,

            1,

            "F"

        );

        doc.setDrawColor(
            ...PDFConfig.colores.linea
        );

        doc.roundedRect(

            x,

            y,

            18,

            5,

            1,

            1

        );

        doc.setFont(
            PDFConfig.fuente,
            "bold"
        );

        doc.setFontSize(5);

        doc.setTextColor(
            ...PDFConfig.colores.negro
        );

        doc.text(

            texto,

            x + 9,

            y + 3.3,

            {align:"center"}

        );

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