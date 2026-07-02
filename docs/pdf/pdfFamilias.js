/* ===========================================
   pdfFamilias.js
   Dibuja familias completas
=========================================== */

async function dibujarFamilia(doc, familia, estado) {

    const {
        pageW,
        pageH,
        cacheImagenes,
        cargarImagenOptimizada
    } = estado;

    let y = estado.y;

    //-------------------------------------------------------
    // Calcular altura necesaria
    //-------------------------------------------------------

    let altura = 42;

    familia.articulos.forEach(a=>{

        const lineas =
            doc.splitTextToSize(a.producto,58);

        altura += Math.max(5,lineas.length*4);

    });

    //-------------------------------------------------------
    // Nueva página si no cabe
    //-------------------------------------------------------

    if(y + altura > pageH-15){

        doc.addPage();

        estado.nPagina++;

        y = 20;

        dibujarEncabezadoPagina(doc,estado);

    }

    //-------------------------------------------------------
    // Imagen
    //-------------------------------------------------------

    const base64 =
        cacheImagenes[familia.imagen] ||
        await cargarImagenOptimizada(
            familia.imagen,
            260
        );

    if(base64){

        try{

            doc.addImage(
                base64,
                "JPEG",
                10,
                y,
                28,
                28
            );

        }catch(e){}

    }

    //-------------------------------------------------------
    // Nombre familia
    //-------------------------------------------------------

    doc.setFontSize(15);

    doc.setFont(undefined,"bold");

    doc.setTextColor(0);

    doc.text(
        familia.familia,
        45,
        y+6
    );

    doc.setFont(undefined,"normal");

    //-------------------------------------------------------
    // Posiciones columnas
    //-------------------------------------------------------

    const xMarca=45;
    const xCodigo=67;
    const xProducto=92;
    const xUnidad=154;
    const xMaster=171;
    const xInner=183;

    let filaY=y+15;

    //-------------------------------------------------------
    // Encabezado tabla
    //-------------------------------------------------------

    dibujarEncabezadoTabla(
        doc,
        filaY
    );

    filaY+=7;

    //-------------------------------------------------------
    // Artículos
    //-------------------------------------------------------

    familia.articulos.forEach((a,index)=>{

        const descripcion =
            doc.splitTextToSize(
                a.producto,
                58
            );

        const alto =
            Math.max(
                5,
                descripcion.length*4
            );

        //------------------------------------
        // Color alternado
        //------------------------------------

        if(index%2==0){

            doc.setFillColor(245);

        }else{

            doc.setFillColor(232);

        }

        doc.rect(
            43,
            filaY-4,
            145,
            alto+3,
            "F"
        );

        //------------------------------------
        // Bordes
        //------------------------------------

        doc.setDrawColor(220);

        doc.setLineWidth(.15);

        doc.rect(
            43,
            filaY-4,
            145,
            alto+3
        );

        //------------------------------------
        // Texto
        //------------------------------------

        doc.setTextColor(0);

        doc.setFontSize(7);

        doc.text(
            a.marca || "",
            xMarca,
            filaY
        );

        doc.text(
            a.codigo,
            xCodigo,
            filaY
        );

        doc.text(
            descripcion,
            xProducto,
            filaY
        );

        doc.text(
            a.unidad || "",
            xUnidad,
            filaY
        );

        doc.text(
            String(a.master||""),
            xMaster,
            filaY
        );

        doc.text(
            String(a.inner||""),
            xInner,
            filaY
        );

        filaY+=alto;

        //------------------------------------
        // ¿Cabe siguiente?
        //------------------------------------

        if(filaY>pageH-12){

            doc.addPage();

            estado.nPagina++;

            filaY=20;

            dibujarEncabezadoPagina(doc,estado);

            dibujarEncabezadoTabla(
                doc,
                filaY
            );

            filaY+=7;

        }

    });

    estado.y=filaY+8;

}

function dibujarEncabezadoTabla(doc,y){

    doc.setFillColor(25);

    doc.rect(
        43,
        y-5,
        145,
        6,
        "F"
    );

    doc.setFont(undefined,"bold");

    doc.setFontSize(8);

    doc.setTextColor(255);

    doc.text("Marca",45,y);
    doc.text("Código",67,y);
    doc.text("Producto",92,y);
    doc.text("Unidad",154,y);
    doc.text("M",171,y);
    doc.text("I",183,y);

    doc.setFont(undefined,"normal");

    doc.setTextColor(0);

}