/* =========================================================
   NIVEL 3 - IA EN FIFA
========================================================= */
/* =========================================================
   ELEMENTOS
========================================================= */
const mario = document.getElementById('mario');
const escenario = document.getElementById('escenario-fifa');
const tuboEntrada = document.getElementById('tubo-entrada-fifa');
const tuboSalida = document.getElementById('tubo-salida-fifa');
const powRojo = document.getElementById('pow-rojo');
const powAzul = document.getElementById('pow-azul');
const infoRoja = document.getElementById('info-roja');
const infoAzul = document.getElementById('info-azul');

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
mario.style.left = marioX + 'px';
mario.style.bottom = marioY + 'px';

/* =========================================================
   TECLADO - KEYDOWN
========================================================= */
document.addEventListener('keydown', (evento) => {
    const tecla = evento.key.toLowerCase();
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
    const tecla = evento.key.toLowerCase();
    if (!(tecla in teclas)) {
        return;
    }
    teclas[tecla] = false;
});

/* =========================================================
   ACTUALIZAR SKIN DE MARIO
========================================================= */
function actualizarSkinMario() {
    mario.classList.remove(
        'mario-idle',
        'mario-corriendo',
        'mario-saltando',
        'mario-agachado'
    );

    if (!enElSuelo) {
        mario.classList.add('mario-saltando');
        return;
    }

    if (teclas.s) {
        mario.classList.add('mario-agachado');
        return;
    }

    if (teclas.a || teclas.d) {
        mario.classList.add('mario-corriendo');
        return;
    }

    mario.classList.add('mario-idle');
}

/* =========================================================
   COMPROBAR SI MARIO ESTÁ SOBRE LA TUBERÍA INICIAL
========================================================= */
function marioEstaSobreTuberia() {
    const tuboX = 100;
    const tuboAncho = 90;
    const tuboY = 230;
    const marioIzquierda = marioX;
    const marioDerecha = marioX + anchoMario;

    const hayContactoHorizontal = marioDerecha > tuboX && marioIzquierda < tuboX + tuboAncho;
    const estaEnAltura = Math.abs(marioY - tuboY) < 3;

    return (hayContactoHorizontal && estaEnAltura && velocidadY <= 0);
}

/* =========================================================
   MOVIMIENTO
========================================================= */
function actualizarMovimiento() {
    if (bajandoTubo) {
        return;
    }

    /* MOVIMIENTO HORIZONTAL */
    if (teclas.a) {
        marioX -= velocidadX;
        direccion = -1;
    }
    if (teclas.d) {
        marioX += velocidadX;
        direccion = 1;
    }

    /* LÍMITES */
    if (marioX < 0) {
        marioX = 0;
    }

    const limiteDerecho = anchoEscenario - anchoMario;
    if (marioX > limiteDerecho) {
        marioX = limiteDerecho;
    }

    /* SALTO */
    if (teclas.w && enElSuelo) {
        velocidadY = fuerzaSalto;
        enElSuelo = false;
    }

    /* GRAVEDAD */
    if (!enElSuelo) {
        velocidadY -= gravedad;
        marioY += velocidadY;

        /* CAER SOBRE LA TUBERÍA INICIAL */
        const tuboX = 100;
        const tuboAncho = 90;
        const tuboTop = 230;
        const marioIzquierda = marioX;
        const marioDerecha = marioX + anchoMario;
        const puedeCaerSobreTuberia = marioDerecha > tuboX && marioIzquierda < tuboX + tuboAncho;

        if (
            velocidadY <= 0 &&
            marioY <= tuboTop &&
            marioY >= tuboTop - 25 &&
            puedeCaerSobreTuberia
        ) {
            marioY = tuboTop;
            velocidadY = 0;
            enElSuelo = true;
        }

        /* CAER SOBRE LA TUBERÍA FINAL */
        const tuboSalidaX = tuboSalida.offsetLeft;
        const tuboSalidaAncho = tuboSalida.offsetWidth;
        const tuboSalidaAlto = tuboSalida.offsetHeight;
        const tuboSalidaBottom = parseInt(getComputedStyle(tuboSalida).bottom);
        const tuboSalidaTop = tuboSalidaBottom + tuboSalidaAlto;
        const marioIzquierdaSalida = marioX;
        const marioDerechaSalida = marioX + anchoMario;
        const puedeCaerSobreTuberiaSalida = marioDerechaSalida > tuboSalidaX && marioIzquierdaSalida < tuboSalidaX + tuboSalidaAncho;

        if (
            !enElSuelo &&
            velocidadY <= 0 &&
            marioY <= tuboSalidaTop &&
            marioY >= tuboSalidaTop - 25 &&
            puedeCaerSobreTuberiaSalida
        ) {
            marioY = tuboSalidaTop;
            velocidadY = 0;
            enElSuelo = true;
        }
        /* CAER SOBRE EL PISO */
        else if (marioY <= suelo) {
            marioY = suelo;
            velocidadY = 0;
            enElSuelo = true;
        }
    }

    /* CAÍDA DE TUBERÍA INICIAL */
    if (enElSuelo && marioY === 230) {
        const sigueSobreTuberia = marioEstaSobreTuberia();
        if (!sigueSobreTuberia) {
            enElSuelo = false;
            velocidadY = -0.5;
        }
    }

    /* POSICIÓN Y DIRECCIÓN */
    mario.style.left = marioX + 'px';
    mario.style.bottom = marioY + 'px';

    if (direccion === -1) {
        mario.style.transform = 'scaleX(-1)';
    } else {
        mario.style.transform = 'scaleX(1)';
    }

    actualizarSkinMario();
}

/* =========================================================
   COMPROBAR ENTRADA A LA TUBERÍA FINAL
========================================================= */
function comprobarEntradaTuboSalida() {
    if (!tuboSalida || bajandoTubo) {
        return;
    }

    const tuboX = tuboSalida.offsetLeft;
    const tuboAncho = tuboSalida.offsetWidth;
    const tuboAlto = tuboSalida.offsetHeight;
    const tuboBottom = parseInt(getComputedStyle(tuboSalida).bottom);
    const tuboTop = tuboBottom + tuboAlto;

    const centroMario = marioX + anchoMario / 2;
    const estaSobreLaTuberia = centroMario >= tuboX && centroMario <= tuboX + tuboAncho;
    const estaEnAltura = Math.abs(marioY - tuboTop) < 5;

    if (estaSobreLaTuberia && estaEnAltura && enElSuelo && teclas.s) {
        bajandoTubo = true;

        marioX = tuboX + tuboAncho / 2 - anchoMario / 2;
        mario.style.left = marioX + 'px';

        mario.classList.remove(
            'mario-idle',
            'mario-corriendo',
            'mario-saltando',
            'mario-agachado'
        );
        mario.classList.add('mario-agachado', 'bajando-tubo');

        setTimeout(() => {
            window.location.href = "nivel5.html";
        }, 800);
    }
}

/* =========================================================
   COMPROBAR GOLPE A LOS POW (CORREGIDO)
========================================================= */
function comprobarGolpePow() {
    if (velocidadY <= 0) {
        return;
    }

    const marioIzquierda = marioX;
    const marioDerecha = marioX + anchoMario;
    const marioArriba = marioY + altoMario;

    const powAncho = 80;
    const powAlto = 80;

    /* POW ROJO */
    const powRojoX = 750;
    const powRojoY = 230;

    const tocaRojoHorizontal = marioDerecha >= powRojoX && marioIzquierda <= (powRojoX + powAncho);
    const golpeaRojoDesdeAbajo = marioArriba >= powRojoY && marioArriba <= (powRojoY + powAlto);

    if (tocaRojoHorizontal && golpeaRojoDesdeAbajo) {
        velocidadY = -2;
        activarPow('rojo');
        return;
    }

    /* POW AZUL */
    const powAzulX = 1450;
    const powAzulY = 230;

    const tocaAzulHorizontal = marioDerecha >= powAzulX && marioIzquierda <= (powAzulX + powAncho);
    const golpeaAzulDesdeAbajo = marioArriba >= powAzulY && marioArriba <= (powAzulY + powAlto);

    if (tocaAzulHorizontal && golpeaAzulDesdeAbajo) {
        velocidadY = -2;
        activarPow('azul');
        return;
    }
}

/* =========================================================
   ACTIVAR POW
========================================================= */
function activarPow(tipo) {
    fifaInfoActiva = true;

    if (timerInformacion) {
        clearTimeout(timerInformacion);
        timerInformacion = null;
    }

    /* POW ROJO */
    if (tipo === 'rojo' && powRojo && infoRoja && infoAzul) {
        powRojo.classList.remove('pow-golpeado');
        void powRojo.offsetWidth;
        powRojo.classList.add('pow-golpeado');

        infoRoja.classList.remove('info-oculta');
        infoAzul.classList.add('info-oculta');
    }

    /* POW AZUL */
    if (tipo === 'azul' && powAzul && infoAzul && infoRoja) {
        powAzul.classList.remove('pow-golpeado');
        void powAzul.offsetWidth;
        powAzul.classList.add('pow-golpeado');

        infoAzul.classList.remove('info-oculta');
        infoRoja.classList.add('info-oculta');
    }

    /* OCULTAR INFORMACIÓN */
    timerInformacion = setTimeout(() => {
        if (infoRoja) infoRoja.classList.add('info-oculta');
        if (infoAzul) infoAzul.classList.add('info-oculta');
        if (powRojo) powRojo.classList.remove('pow-golpeado');
        if (powAzul) powAzul.classList.remove('pow-golpeado');
        fifaInfoActiva = false;
    }, 8000);
}

/* =========================================================
   CÁMARA
========================================================= */
function actualizarCamara() {
    const anchoPantalla = window.innerWidth;
    const limiteCamara = Math.max(0, anchoEscenario - anchoPantalla);

    let desplazamiento = marioX - anchoPantalla / 2;

    if (desplazamiento < 0) {
        desplazamiento = 0;
    }
    if (desplazamiento > limiteCamara) {
        desplazamiento = limiteCamara;
    }

    escenario.style.transform = `translateX(${-desplazamiento}px)`;
}

/* =========================================================
   LOOP PRINCIPAL
========================================================= */
function gameLoop() {
    actualizarMovimiento();
    comprobarGolpePow();
    comprobarEntradaTuboSalida();
    actualizarCamara();
    requestAnimationFrame(gameLoop);
}

/* =========================================================
   INICIAR
========================================================= */
actualizarSkinMario();
actualizarCamara();
gameLoop();