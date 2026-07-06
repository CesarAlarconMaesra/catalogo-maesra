/* ==========================================================
   MAESRA - MOTOR PDF
   pdfConfig.js
   Configuración global del motor PDF
========================================================== */

const PDFConfig = {

    // ======================================================
    // DOCUMENTO
    // ======================================================

    formato: "letter",
    orientacion: "p",
    unidad: "mm",

    // ======================================================
    // FUENTES
    // ======================================================

    fuente: "helvetica",

    tamaño: {

        portada: 24,
        titulo: 18,
        subtitulo: 14,
        encabezado: 10,
        normal: 8,
        pequeño: 7,
        minimo: 6

    },

    // ======================================================
    // MÁRGENES
    // ======================================================

    margen: {

        superior: 12,
        inferior: 12,
        izquierdo: 10,
        derecho: 10

    },

    header: {

        alto: 18

    },

    footer: {

        alto: 10

    },

    // ======================================================
    // PORTADA
    // ======================================================

    portada: {

        logoAncho: 65,
        logoAlto: 28,

        tituloY: 90,
        clienteY: 110,
        fechaY: 118

    },

    // ======================================================
    // ÍNDICE
    // ======================================================

    indice: {

        saltoLinea: 8,
        margenIzquierdo: 18

    },

    // ======================================================
    // FICHAS PRODUCTOS
    // ======================================================

    productos: {

        columnas: 4,
        filas: 5,

        padding: 3,

        imagenMaxAlto: 26,

        nombreLineas: 3

    },

    // ======================================================
    // FAMILIAS
    // ======================================================

    familias: {

        imagen: {

            ancho: 9,
            alto: 9

        },

        tabla: {

            margenSuperior: 14,

            anchoProducto: 78,

            alturaEncabezado: 7,

            paddingCelda: 0.7

        }

    },

    // ======================================================
    // AUTOTABLE
    // ======================================================

    autoTable: {

        theme: "grid",

        styles: {

            font: "helvetica",
            fontSize: 7,

            cellPadding: 0.7,

            lineWidth: 0.1

        }

    },

    // ======================================================
    // COLORES
    // ======================================================

    colores: {

        negro: [0,0,0],

        blanco: [255,255,255],

        grisMuyClaro: [248,248,248],

        grisClaro: [240,240,240],

        grisMedio: [225,225,225],

        grisOscuro: [140,140,140],

        linea: [210,210,210],

        rojoPromo: [214,40,40],

        verde: [0,120,60]

    },

    // ======================================================
    // LÍNEAS
    // ======================================================

    lineas: {

        delgada: 0.1,

        normal: 0.25,

        gruesa: 0.5

    },

    // ======================================================
    // LOGO
    // ======================================================

    logo: {

        anchoCabecera: 18,
        altoCabecera: 10

    },

    // ======================================================
    // METADATOS
    // ======================================================

    empresa: "MAESRA",

    catalogo: "Catálogo General",

    version: "2026",

    autor: "MAESRA"

};

// Disponible para todos los módulos
window.PDFConfig = PDFConfig;