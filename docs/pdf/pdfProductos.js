/* ============================================
   PDF PRODUCTOS INDIVIDUALES
============================================ */

async function pdfDibujarProducto(doc, producto, x, y, cardW, cardH){

    const padding = 3;

    doc.setDrawColor(220);
    doc.setLineWidth(0.2);
    doc.rect(x,y,cardW,cardH);

    let ty = y + padding;

    //------------------------------------------------
    // Imagen
    //------------------------------------------------

    const base64 =
        cacheImagenes[producto.imagen] ||
        await cargarImagenOptimizada(producto.imagen,300);

    if(base64){

        const img = new Image();

        await new Promise(resolve=>{
            img.onload = resolve;
            img.src = base64;
        });

        const maxW = cardW - 8;
        const maxH = cardH * 0.38;

        let w = img.width;
        let h = img.height;

        const ratio = Math.min(maxW/w,maxH/h);

        w*=ratio;
        h*=ratio;

        const imgX = x + (cardW-w)/2;

        doc.addImage(
            base64,
            "JPEG",
            imgX,
            ty,
            w,
            h
        );

        ty += h + 3;
    }

    //------------------------------------------------
    // Código
    //------------------------------------------------

    doc.setFontSize(6);
    doc.setTextColor(90);

    doc.text(
        "Código: " + producto.codigo,
        x + padding,
        ty
    );

    ty += 3;

    //------------------------------------------------
    // Producto
    //------------------------------------------------

    doc.setFontSize(7);
    doc.setTextColor(0);

    let nombre =
        doc.splitTextToSize(
            producto.producto,
            cardW - 6
        );

    nombre = nombre.slice(0,3);

    doc.text(
        nombre,
        x + padding,
        ty
    );

    ty += nombre.length * 3;

    //------------------------------------------------
    // Marca
    //------------------------------------------------

    doc.setFontSize(6);

    doc.text(
        "Marca: " + (producto.marca || ""),
        x + padding,
        ty
    );

    ty += 3;

    //------------------------------------------------
    // Unidad
    //------------------------------------------------

    doc.text(
        "Unidad: " + (producto.unidad || ""),
        x + padding,
        ty
    );

    ty += 3;

    //------------------------------------------------
    // Master
    //------------------------------------------------

    doc.text(
        "Master: " + (producto.master || ""),
        x + padding,
        ty
    );

    ty += 3;

    //------------------------------------------------
    // Inner
    //------------------------------------------------

    doc.text(
        "Inner: " + (producto.inner || ""),
        x + padding,
        ty
    );
}






/* ============================================
   GENERAR TODA LA SECCIÓN DE PRODUCTOS
============================================ */

async function pdfProductos(doc, listaProductos){

    const pageW =
        doc.internal.pageSize.getWidth();

    const pageH =
        doc.internal.pageSize.getHeight();

    const margen = 10;

    doc.setFontSize(18);
    doc.setFont(undefined,"bold");

    doc.text(
        "PRODUCTOS INDIVIDUALES",
        pageW/2,
        20,
        {align:"center"}
    );

    doc.setFont(undefined,"normal");

    //------------------------------------------------

    const cols = 4;
    const filas = 5;

    const cardW =
        (pageW - margen*2) / cols;

    const cardH =
        (pageH - 45) / filas;

    let x = margen;
    let y = 35;

    let col = 0;
    let fila = 0;

    //------------------------------------------------

    function siguiente(){

        col++;

        if(col>=cols){

            col=0;
            fila++;

            x=margen;
            y+=cardH;

        }else{

            x+=cardW;

        }

    }

    //------------------------------------------------

    function nuevaPagina(){

        doc.addPage();

        pdfEncabezadoPagina(
            doc,
            "PRODUCTOS INDIVIDUALES"
        );

        x=margen;
        y=35;

        col=0;
        fila=0;
    }

    //------------------------------------------------

    for(const grupo of listaProductos){

        const p = grupo.articulos[0];

        p.imagen = grupo.imagen;

        if(!p.marca)
            p.marca = grupo.marca;

        await pdfDibujarProducto(
            doc,
            p,
            x,
            y,
            cardW,
            cardH
        );

        siguiente();

        if(fila>=filas){

            nuevaPagina();

        }

    }

}