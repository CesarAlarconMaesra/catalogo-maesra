// ============================================
// PDF FAMILIAS
// ============================================

async function dibujarFamilia(doc, familia) {

    const pageW = doc.internal.pageSize.getWidth();

    // -----------------------------------
    // Imagen
    // -----------------------------------

    const img64 =
        cacheImagenes[familia.imagen] ||
        await cargarImagenOptimizada(familia.imagen,250);

    if(img64){

        try{

            doc.addImage(
                img64,
                "JPEG",
                12,
                doc.lastAutoTable
                    ? doc.lastAutoTable.finalY + 10
                    : 28,
                26,
                26
            );

        }catch(e){}

    }

    // -----------------------------------
    // Título
    // -----------------------------------

    const inicioY =
        doc.lastAutoTable
            ? doc.lastAutoTable.finalY + 10
            : 28;

    doc.setFontSize(15);
    doc.setFont(undefined,"bold");

    doc.text(
        familia.familia,
        45,
        inicioY + 6
    );

    doc.setFont(undefined,"normal");

    // -----------------------------------
    // Tabla
    // -----------------------------------

    const body = [];

    familia.articulos.forEach(a=>{

        body.push([

            a.marca || "",

            a.codigo,

            a.producto,

            a.unidad || "",

            a.master || "",

            a.inner || ""

        ]);

    });

    doc.autoTable({

        startY: inicioY + 12,

        margin:{
            left:45,
            right:10
        },

        head:[[
            "Marca",
            "Código",
            "Producto",
            "Unidad",
            "Master",
            "Inner"
        ]],

        body,

        theme:"grid",

        headStyles:{

            fillColor:[0,0,0],

            textColor:255,

            fontStyle:"bold",

            halign:"center",

            valign:"middle"

        },

        alternateRowStyles:{

            fillColor:[245,245,245]

        },

        styles:{

            fontSize:7,

            cellPadding:1.8,

            lineColor:[220,220,220],

            lineWidth:0.15,

            overflow:"linebreak",

            valign:"middle"

        },

        columnStyles:{

            0:{cellWidth:20},

            1:{cellWidth:24},

            2:{cellWidth:74},

            3:{cellWidth:18},

            4:{cellWidth:14},

            5:{cellWidth:14}

        },

        didDrawPage:function(data){

            // Repite el título de la familia
            // cuando la tabla ocupa varias páginas.

            if(data.pageNumber>1){

                doc.setFontSize(15);

                doc.setFont(undefined,"bold");

                doc.text(
                    familia.familia,
                    45,
                    20
                );

                doc.setFont(undefined,"normal");

            }

        }

    });

}