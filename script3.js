/* =========================================================
   NIVEL 3 - IA EN FIFA
========================================================= */


/* =========================================================
   ELEMENTOS
========================================================= */

const mario =
    document.getElementById('mario');

const escenario =
    document.getElementById('escenario-fifa');

const tuboEntrada =
    document.getElementById('tubo-entrada-fifa');

const tuboSalida =
    document.getElementById('tubo-salida-fifa');

const powRojo =
    document.getElementById('pow-rojo');

const powAzul =
    document.getElementById('pow-azul');

const infoRoja =
    document.getElementById('info-roja');

const infoAzul =
    document.getElementById('info-azul');

const videoFifa =
    document.getElementById('video-fifa');


/* =========================================================
   CONFIGURACIÓN DE MARIO
========================================================= */

const anchoMario = 48;
const altoMario = 60;

const suelo = 50;

let marioX = 121;
let marioY = 230;

let velocidadY = 0;

let enElSuelo = true;

let direccion = 1;

const velocidadX = 7;
const gravedad = 0.8;
const fuerzaSalto = 17;


/* =========================================================
   ANCHO DEL ESCENARIO
========================================================= */

const anchoEscenario = 2200;


/* =========================================================
   ESTADO DE TUBERÍA
========================================================= */

let bajandoTubo = false;


/* =========================================================
   TECLAS
========================================================= */

const teclas = {
    w: false,
    a: false,
    s: false,
    d: false
};


/* =========================================================
   INFORMACIÓN DE LOS POW
========================================================= */

let fifaInfoActiva = false;
let timerInformacion = null;


/* =========================================================
   POSICIÓN INICIAL
========================================================= */

mario.style.left =
    marioX + 'px';

mario.style.bottom =
    marioY + 'px';


/* =========================================================
   TECLADO - KEYDOWN
========================================================= */

document.addEventListener('keydown', (evento) => {

    const tecla =
        evento.key.toLowerCase();

    if (!(tecla in teclas)) {
        return;
    }

    teclas[tecla] = true;

    evento.preventDefault();
});


/* =========================================================
   TECLADO - KEYUP
========================================================= */

document.addEventListener('keyup', (evento) => {

    const tecla =
        evento.key.toLowerCase();

    if (!(tecla in teclas)) {
        return;
    }

    teclas[tecla] = false;
});


/* =========================================================
   ACTUALIZAR SKIN DE MARIO
========================================================= */

function actualizarSkinMario() {

    /*
     * No usamos mario.className = ''
     * porque eso borraría las clases de las skins.
     */

    mario.classList.remove(
        'mario-idle',
        'mario-corriendo',
        'mario-saltando',
        'mario-agachado'
    );


    /* -----------------------------------------
       MARIO EN EL AIRE
    ----------------------------------------- */

    if (!enElSuelo) {

        mario.classList.add(
            'mario-saltando'
        );

        return;
    }


    /* -----------------------------------------
       MARIO AGACHADO
    ----------------------------------------- */

    if (teclas.s) {

        mario.classList.add(
            'mario-agachado'
        );

        return;
    }


    /* -----------------------------------------
       MARIO CORRIENDO
    ----------------------------------------- */

    if (teclas.a || teclas.d) {

        mario.classList.add(
            'mario-corriendo'
        );

        return;
    }


    /* -----------------------------------------
       MARIO QUIETO
    ----------------------------------------- */

    mario.classList.add(
        'mario-idle'
    );
}


/* =========================================================
   COMPROBAR SI MARIO ESTÁ SOBRE LA TUBERÍA INICIAL
========================================================= */

function marioEstaSobreTuberia() {

    const tuboX = 100;
    const tuboAncho = 90;
    const tuboY = 230;


    const marioIzquierda =
        marioX;

    const marioDerecha =
        marioX + anchoMario;


    const hayContactoHorizontal =
        marioDerecha > tuboX &&
        marioIzquierda <
            tuboX + tuboAncho;


    const estaEnAltura =
        Math.abs(
            marioY - tuboY
        ) < 3;


    return (
        hayContactoHorizontal &&
        estaEnAltura &&
        velocidadY <= 0
    );
}


/* =========================================================
   MOVIMIENTO
========================================================= */

function actualizarMovimiento() {

    /*
     * Mientras Mario está entrando en la tubería
     * no puede seguir moviéndose.
     */

    if (bajandoTubo) {
        return;
    }


    /* =====================================================
       MOVIMIENTO HORIZONTAL
    ===================================================== */

    if (teclas.a) {

        marioX -= velocidadX;

        direccion = -1;
    }


    if (teclas.d) {

        marioX += velocidadX;

        direccion = 1;
    }


    /* =====================================================
       LÍMITE IZQUIERDO
    ===================================================== */

    if (marioX < 0) {

        marioX = 0;
    }


    /* =====================================================
       LÍMITE DERECHO
    ===================================================== */

    const limiteDerecho =
        anchoEscenario -
        anchoMario;


    if (marioX > limiteDerecho) {

        marioX =
            limiteDerecho;
    }


    /* =====================================================
       SALTO
    ===================================================== */

    if (
        teclas.w &&
        enElSuelo
    ) {

        velocidadY =
            fuerzaSalto;

        enElSuelo =
            false;
    }


    /* =====================================================
       GRAVEDAD
    ===================================================== */

    if (!enElSuelo) {

        velocidadY -=
            gravedad;

        marioY +=
            velocidadY;


        /* -----------------------------------------
           CAER SOBRE LA TUBERÍA INICIAL
        ----------------------------------------- */

        const tuboX = 100;
        const tuboAncho = 90;
        const tuboTop = 230;


        const marioIzquierda =
            marioX;

        const marioDerecha =
            marioX + anchoMario;


        const puedeCaerSobreTuberia =
            marioDerecha > tuboX &&
            marioIzquierda <
                tuboX + tuboAncho;


        if (
            velocidadY <= 0 &&
            marioY <= tuboTop &&
            marioY >= tuboTop - 25 &&
            puedeCaerSobreTuberia
        ) {

            marioY =
                tuboTop;

            velocidadY =
                0;

            enElSuelo =
                true;
        }


        /* -----------------------------------------
           CAER SOBRE LA TUBERÍA FINAL
        ----------------------------------------- */

        const tuboSalidaX =
            tuboSalida.offsetLeft;

        const tuboSalidaAncho =
            tuboSalida.offsetWidth;

        const tuboSalidaAlto =
            tuboSalida.offsetHeight;

        const tuboSalidaBottom =
            parseInt(
                getComputedStyle(
                    tuboSalida
                ).bottom
            );

        const tuboSalidaTop =
            tuboSalidaBottom +
            tuboSalidaAlto;


        const marioIzquierdaSalida =
            marioX;

        const marioDerechaSalida =
            marioX +
            anchoMario;


        const puedeCaerSobreTuberiaSalida =
            marioDerechaSalida >
                tuboSalidaX &&
            marioIzquierdaSalida <
                tuboSalidaX +
                tuboSalidaAncho;


        if (
            !enElSuelo &&
            velocidadY <= 0 &&
            marioY <= tuboSalidaTop &&
            marioY >= tuboSalidaTop - 25 &&
            puedeCaerSobreTuberiaSalida
        ) {

            marioY =
                tuboSalidaTop;

            velocidadY =
                0;

            enElSuelo =
                true;
        }


        /* -----------------------------------------
           CAER SOBRE EL PISO
        ----------------------------------------- */

        else if (marioY <= suelo) {

            marioY =
                suelo;

            velocidadY =
                0;

            enElSuelo =
                true;
        }
    }


    /* =====================================================
       SI MARIO ESTABA SOBRE LA TUBERÍA INICIAL Y SALE
    ===================================================== */

    if (
        enElSuelo &&
        marioY === 230
    ) {

        const sigueSobreTuberia =
            marioEstaSobreTuberia();


        if (!sigueSobreTuberia) {

            enElSuelo =
                false;

            /*
             * Pequeña velocidad inicial hacia abajo
             * para que la caída empiece inmediatamente.
             */

            velocidadY =
                -0.5;
        }
    }


    /* =====================================================
       POSICIÓN
    ===================================================== */

    mario.style.left =
        marioX + 'px';

    mario.style.bottom =
        marioY + 'px';


    /* =====================================================
       DIRECCIÓN
    ===================================================== */

    if (direccion === -1) {

        mario.style.transform =
            'scaleX(-1)';

    } else {

        mario.style.transform =
            'scaleX(1)';
    }


    /* =====================================================
       SKIN
    ===================================================== */

    actualizarSkinMario();
}


/* =========================================================
   COMPROBAR ENTRADA A LA TUBERÍA FINAL
========================================================= */

function comprobarEntradaTuboSalida() {

    if (
        !tuboSalida ||
        bajandoTubo
    ) {
        return;
    }


    /* =====================================================
       DATOS DE LA TUBERÍA
    ===================================================== */

    const tuboX =
        tuboSalida.offsetLeft;

    const tuboAncho =
        tuboSalida.offsetWidth;

    const tuboAlto =
        tuboSalida.offsetHeight;

    const tuboBottom =
        parseInt(
            getComputedStyle(
                tuboSalida
            ).bottom
        );

    const tuboTop =
        tuboBottom +
        tuboAlto;


    /* =====================================================
       CENTRO DE MARIO
    ===================================================== */

    const centroMario =
        marioX +
        anchoMario / 2;


    const estaSobreLaTuberia =
        centroMario >= tuboX &&
        centroMario <=
            tuboX + tuboAncho;


    /* =====================================================
       ALTURA DE MARIO
    ===================================================== */

    const estaEnAltura =
        Math.abs(
            marioY - tuboTop
        ) < 5;


    /* =====================================================
       ENTRADA
    ===================================================== */

    if (
        estaSobreLaTuberia &&
        estaEnAltura &&
        enElSuelo &&
        teclas.s
    ) {

        bajandoTubo =
            true;


        /* -----------------------------------------
           CENTRAR A MARIO SOBRE LA TUBERÍA
        ----------------------------------------- */

        marioX =
            tuboX +
            tuboAncho / 2 -
            anchoMario / 2;


        mario.style.left =
            marioX + 'px';


        /* -----------------------------------------
           ANIMACIÓN
        ----------------------------------------- */

        mario.classList.remove(
            'mario-idle',
            'mario-corriendo',
            'mario-saltando',
            'mario-agachado'
        );


        mario.classList.add(
            'mario-agachado',
            'bajando-tubo'
        );


        /* -----------------------------------------
           CAMBIAR AL NIVEL 4
        ----------------------------------------- */

        setTimeout(() => {

            window.location.href =
                "nivel4.html";

        }, 800);
    }
}


/* =========================================================
   COMPROBAR GOLPE A LOS POW
========================================================= */

function comprobarGolpePow() {

    /*
     * Mario tiene que estar cayendo.
     */

    if (velocidadY >= 0) {
        return;
    }


    /* =====================================================
       DATOS GENERALES DE MARIO
    ===================================================== */

    const marioIzquierda =
        marioX;

    const marioDerecha =
        marioX + anchoMario;

    const marioArriba =
        marioY + altoMario;


    /* =====================================================
       POW ROJO
    ===================================================== */

    const powRojoX = 750;
    const powRojoY = 230;
    const powAncho = 80;


    const tocaRojoHorizontal =
        marioDerecha >= powRojoX &&
        marioIzquierda <=
            powRojoX + powAncho;


    const golpeaRojoDesdeAbajo =
        marioArriba >= powRojoY &&
        marioArriba <=
            powRojoY + 25 &&
        marioY < powRojoY;


    if (
        tocaRojoHorizontal &&
        golpeaRojoDesdeAbajo
    ) {

        activarPow('rojo');

        return;
    }


    /* =====================================================
       POW AZUL
    ===================================================== */

    const powAzulX = 1450;
    const powAzulY = 230;


    const tocaAzulHorizontal =
        marioDerecha >= powAzulX &&
        marioIzquierda <=
            powAzulX + powAncho;


    const golpeaAzulDesdeAbajo =
        marioArriba >= powAzulY &&
        marioArriba <=
            powAzulY + 25 &&
        marioY < powAzulY;


    if (
        tocaAzulHorizontal &&
        golpeaAzulDesdeAbajo
    ) {

        activarPow('azul');

        return;
    }
}


/* =========================================================
   ACTIVAR POW
========================================================= */

function activarPow(tipo) {

    fifaInfoActiva =
        true;


    /* =====================================================
       REINICIAR TEMPORIZADOR
    ===================================================== */

    if (timerInformacion) {

        clearTimeout(
            timerInformacion
        );

        timerInformacion =
            null;
    }


    /* =====================================================
       POW ROJO
    ===================================================== */

    if (tipo === 'rojo') {

        powRojo.classList.remove(
            'pow-golpeado'
        );


        /*
         * Forzamos que la animación
         * pueda volver a ejecutarse.
         */

        void powRojo.offsetWidth;


        powRojo.classList.add(
            'pow-golpeado'
        );


        infoRoja.classList.remove(
            'info-oculta'
        );


        infoAzul.classList.add(
            'info-oculta'
        );
    }


    /* =====================================================
       POW AZUL
    ===================================================== */

    if (tipo === 'azul') {

        powAzul.classList.remove(
            'pow-golpeado'
        );


        /*
         * Permite repetir la animación.
         */

        void powAzul.offsetWidth;


        powAzul.classList.add(
            'pow-golpeado'
        );


        infoAzul.classList.remove(
            'info-oculta'
        );


        infoRoja.classList.add(
            'info-oculta'
        );


        /*
         * Cada vez que golpeamos el POW azul,
         * el video vuelve a comenzar.
         */

        videoFifa.currentTime =
            0;


        videoFifa.play().catch(() => {

            /*
             * Si el navegador bloquea el autoplay,
             * se puede reproducir manualmente.
             */

        });
    }


    /* =====================================================
       OCULTAR INFORMACIÓN DESPUÉS DE 8 SEGUNDOS
    ===================================================== */

    timerInformacion =
        setTimeout(() => {

            infoRoja.classList.add(
                'info-oculta'
            );


            infoAzul.classList.add(
                'info-oculta'
            );


            powRojo.classList.remove(
                'pow-golpeado'
            );


            powAzul.classList.remove(
                'pow-golpeado'
            );


            /*
             * El video NO se pausa.
             */

            fifaInfoActiva =
                false;

        }, 8000);
}


/* =========================================================
   CÁMARA
========================================================= */

function actualizarCamara() {

    const anchoPantalla =
        window.innerWidth;


    /*
     * La cámara solamente puede desplazarse
     * hasta el final del escenario.
     */

    const limiteCamara =
        Math.max(
            0,
            anchoEscenario -
            anchoPantalla
        );


    /*
     * Intentamos mantener a Mario
     * cerca del centro.
     */

    let desplazamiento =
        marioX -
        anchoPantalla / 2;


    /* -----------------------------------------
       BORDE IZQUIERDO
    ----------------------------------------- */

    if (desplazamiento < 0) {

        desplazamiento =
            0;
    }


    /* -----------------------------------------
       BORDE DERECHO
    ----------------------------------------- */

    if (
        desplazamiento >
        limiteCamara
    ) {

        desplazamiento =
            limiteCamara;
    }


    /* -----------------------------------------
       APLICAR DESPLAZAMIENTO
    ----------------------------------------- */

    escenario.style.transform =
        `translateX(${-desplazamiento}px)`;
}


/* =========================================================
   LOOP PRINCIPAL
========================================================= */

function gameLoop() {

    actualizarMovimiento();

    comprobarGolpePow();

    comprobarEntradaTuboSalida();

    actualizarCamara();

    requestAnimationFrame(
        gameLoop
    );
}


/* =========================================================
   INICIAR
========================================================= */

actualizarSkinMario();

actualizarCamara();

gameLoop();