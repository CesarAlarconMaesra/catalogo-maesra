/* ==========================================================
   pdfFamilias.js
   Dibujo de familias utilizando AutoTable
========================================================== */

const PDFFamilias = {

async dibujarFamilia(doc,familia){

    PDFLayout.nuevaPagina(familia.familia);

    const area = PDFLayout.areaTrabajo();

    //-------------------------------------------------------
    // IMAGEN
    //-------------------------------------------------------

    let base64 = await PDFImagenes.obtenerImagenPDF(familia.imagen, 300);

    }

    if(base64){

        try{

            doc.addImage(
                base64,
                "JPEG",
                area.x,
                area.y,
                28,
                28
            );

        }catch(e){}

    }

    //-------------------------------------------------------
    // TÍTULO
    //-------------------------------------------------------

    doc.setFontSize(15);

    doc.setFont(undefined,"bold");

    doc.setTextColor(0);

    doc.text(

        familia.familia,

        area.x+35,

        area.y+8

    );

    doc.setFont(undefined,"normal");

    //-------------------------------------------------------
    // TABLA
    //-------------------------------------------------------

    const columnas=[

        {header:"Marca",dataKey:"marca"},
        {header:"Código",dataKey:"codigo"},
        {header:"Producto",dataKey:"producto"},
        {header:"Unidad",dataKey:"unidad"},
        {header:"Master",dataKey:"master"},
        {header:"Inner",dataKey:"inner"}

    ];

    const filas =
        familia.articulos.map(a=>({

            marca:a.marca || "",

            codigo:a.codigo,

            producto:a.producto,

            unidad:a.unidad,

            master:a.master,

            inner:a.inner

        }));
//-------------------------------------------------------
    // AUTOTABLE
    //-------------------------------------------------------

    doc.autoTable({

        startY: area.y + 18,

        columns: columnas,

        body: filas,

        margin: PDFLayout.margenesTabla(),

        theme: "grid",

        styles: {

            ...PDFLayout.estiloTabla(),

            overflow: "linebreak",

            cellPadding: 1.5,

            valign: "middle"

        },

        headStyles: PDFLayout.estiloEncabezadoTabla(),

        alternateRowStyles: {

            fillColor: [242,242,242]

        },

        columnStyles:{

            marca:{
                cellWidth:22
            },

            codigo:{
                cellWidth:24
            },

            producto:{
                cellWidth:72
            },

            unidad:{
                cellWidth:18,
                halign:"center"
            },

            master:{
                cellWidth:15,
                halign:"center"
            },

            inner:{
                cellWidth:15,
                halign:"center"
            }

        },

        didParseCell:function(data){

            PDFLayout.estiloAlternado(data);

        },

        didDrawPage:function(){

            PDFLayout.cabecera(familia.familia);

            PDFLayout.pie();

        }

    });

},

//---------------------------------------------------------
// DIBUJAR TODAS LAS FAMILIAS
//---------------------------------------------------------

async dibujarTodas(doc,familias){

    for(const familia of familias){

        await this.dibujarFamilia(
            doc,
            familia
        );

    }

}

};

//---------------------------------------------------------
// EXPORTAR
//---------------------------------------------------------

window.PDFFamilias = PDFFamilias;