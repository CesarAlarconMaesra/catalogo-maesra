/* ===========================================================
   pdfImagenes.js
   Manejo de imágenes para generación de PDF
   =========================================================== */

const PDFImagenes = (() => {

    const cache = {};

    const URL_BASE =
        "https://cesaralarconmaesra.github.io/catalogo-maesra/";

    // ======================================================
    // Obtiene imagen optimizada
    // ======================================================

    async function obtenerImagenPDF(ruta, tamaño = 300){

        if(!ruta) return null;

        if(cache[ruta]){
            return cache[ruta];
        }

        try{

            const url =
                ruta.startsWith("http")
                    ? ruta
                    : URL_BASE + ruta;

            const response = await fetch(url);

            if(!response.ok){
                console.warn("Imagen no encontrada:",ruta);
                return null;
            }

            const blob = await response.blob();

            return new Promise(resolve=>{

                const img = new Image();

                img.onload = ()=>{

                    const canvas =
                        document.createElement("canvas");

                    const ctx =
                        canvas.getContext("2d");

                    let w = img.width;
                    let h = img.height;

                    if(w>h){

                        if(w>tamaño){

                            h *= tamaño/w;
                            w = tamaño;

                        }

                    }else{

                        if(h>tamaño){

                            w *= tamaño/h;
                            h = tamaño;

                        }

                    }

                    canvas.width = w;
                    canvas.height = h;

                    ctx.drawImage(img,0,0,w,h);

                    const base64 =
                        canvas.toDataURL(
                            "image/jpeg",
                            0.80
                        );

                    cache[ruta]=base64;

                    resolve(base64);

                };

                img.onerror = ()=>resolve(null);

                img.src =
                    URL.createObjectURL(blob);

            });

        }catch(e){

            console.warn("Error imagen:",ruta);

            return null;

        }

    }

    // ======================================================
    // Precarga masiva
    // ======================================================

    async function precargar(lista,lotes=20){

        const imagenes=[];

        lista.forEach(item=>{

            if(item.imagen){

                imagenes.push(item.imagen);

            }

        });

        let indice=0;

        async function worker(){

            while(indice<imagenes.length){

                const ruta=
                    imagenes[indice++];

                if(!cache[ruta]){

                    await obtenerImagenPDF(ruta);

                }

            }

        }

        const workers=[];

        for(let i=0;i<lotes;i++){

            workers.push(worker());

        }

        await Promise.all(workers);

    }

    // ======================================================
    // Dibuja imagen centrada
    // ======================================================

    async function dibujarImagen(

        doc,
        ruta,
        x,
        y,
        maxW,
        maxH

    ){

        const base64 =
            await obtenerImagenPDF(ruta);

        if(!base64) return;

        const img=new Image();

        await new Promise(resolve=>{

            img.onload=resolve;
            img.src=base64;

        });

        let w=img.width;
        let h=img.height;

        const ratio=
            Math.min(maxW/w,maxH/h);

        w*=ratio;
        h*=ratio;

        const xx=
            x+(maxW-w)/2;

        const yy=
            y+(maxH-h)/2;

        doc.addImage(

            base64,
            "JPEG",
            xx,
            yy,
            w,
            h

        );

    }

    // ======================================================
    // Imagen pequeña para familias
    // ======================================================

    async function dibujarImagenFamilia(

        doc,
        ruta,
        x,
        y

    ){

        await dibujarImagen(

            doc,
            ruta,
            x,
            y,
            28,
            28

        );

    }

    // ======================================================
    // Imagen ficha individual
    // ======================================================

    async function dibujarImagenProducto(

        doc,
        ruta,
        x,
        y,
        ancho,
        alto

    ){

        await dibujarImagen(

            doc,
            ruta,
            x,
            y,
            ancho,
            alto

        );

    }

    // ======================================================
    // Limpiar cache
    // ======================================================

    function limpiar(){

        Object.keys(cache)
            .forEach(k=>delete cache[k]);

    }

    return{

        obtenerImagenPDF,
        precargar,
        dibujarImagen,
        dibujarImagenFamilia,
        dibujarImagenProducto,
        limpiar

    };

})();