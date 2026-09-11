const mario = document.getElementById('mario');

const escenario = document.getElementById('escenario');

const textoNivel = document.getElementById('texto-nivel2');

const planta1 = document.getElementById('planta1');

const planta2 = document.getElementById('planta2');

const espina = document.getElementById('espina');

const hongo = document.getElementById('hongo');

const tuboSalida = document.getElementById('tubo-salida');

const nivelSuelo = 50;


// ============================================================
// POSICIÓN INICIAL DE MARIO
// ============================================================

let marioX = 171;
let marioY = 230;

let velocidadY = 0;

let enElSuelo = false;

let direccion = 1;


// ============================================================
// CÁMARA Y SCROLL
// ============================================================

let camaraX = 0;

let limiteIzquierdoAbsoluto = 0;


// ============================================================
// FÍSICA
// ============================================================

const velocidadX = 7;

const gravedad = 0.8;

const fuerzaSalto = 17;


// ============================================================
// CONTROLES
// ============================================================

const teclas = {

    w: false,

    a: false,

    s: false,

    d: false

};


// ============================================================
// ESTADOS
// ============================================================

let planta1Arriba = false;

let planta2DisparoLanzado = false;

let espinaActiva = false;

let espinaVX = 0;

let espinaVY = 0;

let espinaX = 0;

let espinaY = 0;

let marioMuerto = false;

let marioEsFantasma = false;

let controlesBloqueados = false;

let hongoActivo = false;

let hongoX = 0;

let hongoY = 0;


// ============================================================
// ESTADO DE LA TUBERÍA
// ============================================================

let bajandoTubo = false;


// ============================================================
// SISTEMA DE TEXTOS
// ============================================================

let textoBloqueadoHasta = 0;

let indicePasoTexto = 0;


function mostrarTextoConTimer(mensaje, duracionMs) {

    textoNivel.textContent = mensaje;

    textoBloqueadoHasta =
        Date.now() + duracionMs;
}


// ============================================================
// CONTROLES
// ============================================================

window.addEventListener('keydown', (e) => {

    const tecla = e.key.toLowerCase();

    if (teclas.hasOwnProperty(tecla)) {

        teclas[tecla] = true;
    }

});


window.addEventListener('keyup', (e) => {

    const tecla = e.key.toLowerCase();

    if (teclas.hasOwnProperty(tecla)) {

        teclas[tecla] = false;
    }

});


// ============================================================
// CICLO DE PLANTA 1
// ============================================================

// La planta empieza escondida.
// Después sale y vuelve a entrar continuamente.

function cicloPlanta1() {

    if (!planta1) return;


    // Si Mario está muerto,
    // dejamos la planta escondida.

    if (marioMuerto) {

        planta1Arriba = false;

        planta1.style.bottom = '110px';

        setTimeout(cicloPlanta1, 200);

        return;
    }


    // Cambiamos entre arriba y abajo

    planta1Arriba = !planta1Arriba;


    if (planta1Arriba) {

        // SALE de la tubería

        planta1.style.bottom = '160px';

    } else {

        // ENTRA completamente en la tubería

        planta1.style.bottom = '110px';
    }


    // Repite el ciclo

    setTimeout(cicloPlanta1, 2000);
}


// Empieza escondida

if (planta1) {

    planta1.style.bottom = '110px';

    // Espera antes de la primera salida

    setTimeout(cicloPlanta1, 1200);
}


// ============================================================
// CÁMARA Y TEXTOS
// ============================================================

function actualizarTextosYCamara() {

    const anchoPantalla =
        window.innerWidth;


    const objetivoCamara =
        marioX - (anchoPantalla / 3);


    if (objetivoCamara > camaraX) {

        camaraX = objetivoCamara;

        limiteIzquierdoAbsoluto = camaraX;
    }


    escenario.style.transform =
        `translateX(${-camaraX}px)`;


    const ahora = Date.now();


    if (ahora < textoBloqueadoHasta) {

        return;
    }


    if (marioEsFantasma) {

        textoNivel.textContent =
            "PERO TE DAMOS OTRA OPORTUNIDAD";

    } else {

        if (
            indicePasoTexto === 0 &&
            marioX >= 171
        ) {

            mostrarTextoConTimer(

                "MARIO BROS NO USA MACHINE LEARNING",

                2000
            );

            indicePasoTexto = 1;


        } else if (
            indicePasoTexto === 1 &&
            marioX >= 550
        ) {

            mostrarTextoConTimer(

                "PERO SI LO TUVIERA...",

                1800
            );

            indicePasoTexto = 2;


        } else if (
            indicePasoTexto === 2 &&
            marioX >= 900
        ) {

            mostrarTextoConTimer(

                "PODRÍA APRENDER TU COMPORTAMIENTO",

                1500
            );

            indicePasoTexto = 3;
        }
    }
}


// ============================================================
// COLISIONES CON OBSTÁCULOS
// ============================================================

function resolverColisiones(
    siguienteX,
    siguienteY
) {

    const obstaculos =
        document.querySelectorAll('.obstaculo');


    const marioWidth = 48;

    const marioHeight = 60;


    let resultado = {

        x: siguienteX,

        y: siguienteY,

        enPlataforma: false
    };


    obstaculos.forEach(elem => {

        const bLeft =
            parseInt(elem.style.left) ||
            elem.offsetLeft;


        const bBottom =
            parseInt(elem.style.bottom) ||
            50;


        const bWidth =
            elem.offsetWidth;


        const bHeight =
            elem.offsetHeight;


        const solapeX =

            (resultado.x + marioWidth > bLeft) &&

            (resultado.x < bLeft + bWidth);


        const solapeY =

            (resultado.y + marioHeight > bBottom) &&

            (resultado.y < bBottom + bHeight);


        if (solapeX && solapeY) {

            const previoSolapeX =

                (marioX + marioWidth > bLeft) &&

                (marioX < bLeft + bWidth);


            if (previoSolapeX) {

                if (

                    velocidadY <= 0 &&

                    marioY >=
                    bBottom + bHeight - 20

                ) {

                    resultado.y =
                        bBottom + bHeight;

                    velocidadY = 0;

                    resultado.enPlataforma = true;
                }

            } else {

                if (
                    marioX + marioWidth <= bLeft
                ) {

                    resultado.x =
                        bLeft - marioWidth;

                } else if (
                    marioX >= bLeft + bWidth
                ) {

                    resultado.x =
                        bLeft + bWidth;
                }
            }
        }

    });


    return resultado;
}


// ============================================================
// CONTACTO CON PLANTA 1
// ============================================================

function comprobarContactoPlanta1() {

    if (
        marioMuerto ||
        !planta1Arriba
    ) {

        return;
    }


    const pLeft = 520;

    const pWidth = 40;

    const pBottom = 160;

    const pHeight = 50;


    const marioWidth = 48;

    const marioHeight = 60;


    const solapeX =

        (marioX + marioWidth > pLeft) &&

        (marioX < pLeft + pWidth);


    const solapeY =

        (marioY + marioHeight > pBottom) &&

        (marioY < pBottom + pHeight);


    if (solapeX && solapeY) {

        marioX =
            limiteIzquierdoAbsoluto + 20;

        marioY =
            nivelSuelo;

        velocidadY = 0;
    }
}


// ============================================================
// ATAQUE PLANTA 2
// ============================================================

function comprobarAtaquePlanta2() {

    if (
        planta2DisparoLanzado ||
        marioMuerto
    ) {

        return;
    }


    const p2Left =

        planta2
            ? (
                parseInt(planta2.style.left) ||
                planta2.offsetLeft
            )
            : 1720;


    const distancia =
        p2Left - marioX;


    const umbral18 =
        window.innerWidth / 8;


    if (
        distancia > 0 &&
        distancia <= umbral18
    ) {

        planta2DisparoLanzado = true;

        controlesBloqueados = true;


        mostrarTextoConTimer(

            "Y CAMBIAR EL SUYO.",

            3000
        );


        const espinaOrigenX =
            p2Left + 20;


        const espinaOrigenY =

            (
                parseInt(planta2.style.bottom) ||
                160
            ) + 50;


        lanzarEspina(

            marioX + 24,

            marioY + 30,

            espinaOrigenX,

            espinaOrigenY
        );
    }
}


// ============================================================
// LANZAR ESPINA
// ============================================================

function lanzarEspina(

    targetX,

    targetY,

    origenX,

    origenY

) {

    espinaX = origenX;

    espinaY = origenY;


    espina.style.display =
        'block';


    const dx =
        targetX - espinaX;


    const dy =
        targetY - espinaY;


    const dist =
        Math.hypot(dx, dy);


    const velocidadEspina = 18;


    espinaVX =
        (dx / dist) *
        velocidadEspina;


    espinaVY =
        (dy / dist) *
        velocidadEspina;


    espinaActiva = true;
}


// ============================================================
// ACTUALIZAR ESPINA
// ============================================================

function actualizarEspina() {

    if (!espinaActiva) {

        return;
    }


    espinaX += espinaVX;

    espinaY += espinaVY;


    espina.style.left =
        espinaX + 'px';


    espina.style.bottom =
        espinaY + 'px';


    const centroMarioX =
        marioX + 24;


    const centroMarioY =
        marioY + 30;


    if (

        Math.hypot(

            espinaX - centroMarioX,

            espinaY - centroMarioY

        ) < 35

    ) {

        espinaActiva = false;

        espina.style.display =
            'none';


        ejecutarMuerteFantasma();
    }
}


// ============================================================
// MUERTE FANTASMA
// ============================================================

function ejecutarMuerteFantasma() {

    marioMuerto = true;

    marioEsFantasma = true;

    controlesBloqueados = false;


    velocidadY = 14;


    setTimeout(() => {

        mario.classList.add(
            'mario-fantasma'
        );


        mostrarTextoConTimer(

            "PERO TE DAMOS OTRA OPORTUNIDAD",

            4000
        );


        aparecerHongo();

    }, 300);
}


// ============================================================
// HONGO
// ============================================================

function aparecerHongo() {

    hongoX = marioX;

    hongoY = marioY + 180;


    hongo.style.left =
        hongoX + 'px';


    hongo.style.bottom =
        hongoY + 'px';


    hongo.style.display =
        'block';


    hongoActivo = true;
}


// ============================================================
// ACTUALIZAR HONGO
// ============================================================

function actualizarHongo() {

    if (!hongoActivo) {

        return;
    }


    if (hongoY > nivelSuelo) {

        hongoY -= 1;
    }


    hongo.style.left =
        hongoX + 'px';


    hongo.style.bottom =
        hongoY + 'px';


    const hongoWidth = 40;

    const hongoHeight = 40;

    const marioWidth = 48;

    const marioHeight = 60;


    const solapeX =

        hongoX + hongoWidth > marioX &&

        hongoX < marioX + marioWidth;


    const solapeY =

        hongoY < marioY + marioHeight &&

        hongoY + hongoHeight > marioY;


    if (solapeX && solapeY) {

        hongoActivo = false;

        hongo.style.display =
            'none';


        marioEsFantasma = false;

        marioMuerto = false;

        controlesBloqueados = false;


        marioY = nivelSuelo;

        velocidadY = 0;

        enElSuelo = true;


        mario.className =
            'mario-idle';
    }
}


// ============================================================
// ENTRADA A LA TUBERÍA DE SALIDA
// ============================================================

function comprobarEntradaTubo() {

    if (
        !tuboSalida ||
        bajandoTubo ||
        marioMuerto
    ) {

        return;
    }


    const tuboLeft =

        parseInt(
            tuboSalida.style.left
        );


    const tuboWidth =
        tuboSalida.offsetWidth;


    const tuboHeight =
        tuboSalida.offsetHeight;


    const tuboBottom =

        parseInt(
            tuboSalida.style.bottom
        );


    const tuboTopY =
        tuboBottom + tuboHeight;


    const marioWidth = 48;


    /*
     * Comprobamos que Mario esté
     * encima de la tubería.
     */

    const sobreTuboX =

        (marioX + marioWidth / 2 >= tuboLeft) &&

        (marioX + marioWidth / 2 <=
            tuboLeft + tuboWidth);


    const sobreTuboY =

        Math.abs(
            marioY - tuboTopY
        ) < 8;


    /*
     * Si está encima y presiona S,
     * comienza a bajar.
     */

    if (
        sobreTuboX &&
        sobreTuboY &&
        teclas.s &&
        enElSuelo
    ) {

        bajandoTubo = true;

        controlesBloqueados = true;


        /*
         * Centramos a Mario
         * con la tubería.
         */

        marioX =

            tuboLeft +
            (tuboWidth / 2) -
            (marioWidth / 2);


        mario.style.left =
            marioX + 'px';


        /*
         * Quitamos la animación normal
         * y aplicamos la de la tubería.
         */

        mario.className = '';

        mario.classList.add(
            'mario-agachado',
            'bajando-tubo'
        );


        /*
         * Después de bajar por la tubería,
         * pasamos al nivel 3.
         */

        setTimeout(() => {

            window.location.href =
                "nivel3.html";

        }, 800);
    }
}


// ============================================================
// LOOP PRINCIPAL
// ============================================================

function actualizar() {

    actualizarTextosYCamara();


    if (espinaActiva) {

        actualizarEspina();
    }


    if (hongoActivo) {

        actualizarHongo();
    }


    /*
     * Si Mario está bajando por la tubería,
     * no procesamos el movimiento normal.
     */

    if (
        bajandoTubo
    ) {

        mario.style.left =
            marioX + 'px';

        mario.style.bottom =
            marioY + 'px';

        requestAnimationFrame(actualizar);

        return;
    }


    // ========================================================
    // MARIO VIVO
    // ========================================================

    if (!marioMuerto) {

        let nuevoX = marioX;

        let moviendose = false;


        // ----------------------------------------------------
        // MOVIMIENTO HORIZONTAL
        // ----------------------------------------------------

        if (!controlesBloqueados) {

            if (teclas.a) {

                nuevoX -= velocidadX;

                direccion = -1;

                moviendose = true;
            }


            if (teclas.d) {

                nuevoX += velocidadX;

                direccion = 1;

                moviendose = true;
            }
        }


        // ----------------------------------------------------
        // LÍMITE IZQUIERDO
        // ----------------------------------------------------

        if (
            nuevoX <
            limiteIzquierdoAbsoluto
        ) {

            nuevoX =
                limiteIzquierdoAbsoluto;
        }


        // ----------------------------------------------------
        // SALTO
        // ----------------------------------------------------

        if (

            teclas.w &&

            enElSuelo &&

            !controlesBloqueados

        ) {

            velocidadY =
                fuerzaSalto;

            enElSuelo = false;
        }


        // ----------------------------------------------------
        // MOVIMIENTO VERTICAL
        // ----------------------------------------------------

        let nuevoY =
            marioY + velocidadY;


        velocidadY -= gravedad;


        // ----------------------------------------------------
        // COLISIONES
        // ----------------------------------------------------

        const colision =

            resolverColisiones(

                nuevoX,

                nuevoY
            );


        marioX =
            colision.x;


        marioY =
            colision.y;


        if (
            colision.enPlataforma
        ) {

            enElSuelo = true;

            velocidadY = 0;

        } else if (
            marioY <= nivelSuelo
        ) {

            marioY =
                nivelSuelo;

            velocidadY = 0;

            enElSuelo = true;

        } else {

            enElSuelo = false;
        }


        // ----------------------------------------------------
        // COMPROBAR ELEMENTOS
        // ----------------------------------------------------

        comprobarContactoPlanta1();

        comprobarAtaquePlanta2();

        comprobarEntradaTubo();


        // ----------------------------------------------------
        // ANIMACIÓN DE MARIO
        // ----------------------------------------------------

        mario.className = '';


        if (marioEsFantasma) {

            mario.classList.add(
                'mario-fantasma'
            );

        } else if (!enElSuelo) {

            mario.classList.add(
                'mario-saltando'
            );

        } else if (moviendose) {

            mario.classList.add(
                'mario-corriendo'
            );

        } else {

            mario.classList.add(
                'mario-idle'
            );
        }


    }

    // ========================================================
    // MARIO MUERTO / FANTASMA
    // ========================================================

    else if (

        marioMuerto &&

        marioEsFantasma

    ) {

        marioY += velocidadY;

        velocidadY -= gravedad;


        if (
            marioY < nivelSuelo
        ) {

            marioY =
                nivelSuelo;

            velocidadY = 0;
        }
    }


    // ========================================================
    // POSICIÓN VISUAL DE MARIO
    // ========================================================

    mario.style.transform =

        `scaleX(${direccion * 1.2}) scaleY(1.2)`;


    mario.style.left =
        marioX + 'px';


    mario.style.bottom =
        marioY + 'px';


    requestAnimationFrame(actualizar);
}


// ============================================================
// INICIAR JUEGO
// ============================================================

actualizar();