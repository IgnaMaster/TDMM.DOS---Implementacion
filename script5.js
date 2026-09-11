/* =========================================================
   NIVEL 3 - IA EN FIFA
========================================================= */
const mario = document.getElementById('mario');
const escenario = document.getElementById('escenario-fifa');
const tuboEntrada = document.getElementById('tubo-entrada-fifa');
const castillo = document.getElementById('castillo-fifa');

/* CONFIGURACIÓN DE MARIO */
const anchoMario = 48;
const altoMario = 60;
const suelo = 50;

let marioX = 121; 
let marioY = 50; 
let velocidadY = 0;
let enElSuelo = true;
let direccion = 1;
const velocidadX = 7;
const gravedad = 0.8;
const fuerzaSalto = 17;

const anchoEscenario = 2200;

/* ESTADOS DE ANIMACIÓN AUTOMÁTICA */
let emergiendoTubo = true;
let entrandoCastillo = false;

const teclas = {
    w: false,
    a: false,
    s: false,
    d: false
};

/* =========================================================
   ANIMACIÓN INICIAL: SALIDA DEL TUBO
========================================================= */
function iniciarAnimacionEntrada() {
    mario.style.left = marioX + 'px';
    mario.style.bottom = marioY + 'px';
    
    const animacionSubir = setInterval(() => {
        marioY += 3;
        mario.style.bottom = marioY + 'px';

        if (marioY >= 230) {
            clearInterval(animacionSubir);
            marioY = 230;
            emergiendoTubo = false;
        }
    }, 16);
}

/* TECLADO */
document.addEventListener('keydown', (evento) => {
    const tecla = evento.key.toLowerCase();
    if (!(tecla in teclas)) return;
    teclas[tecla] = true;
    evento.preventDefault();
});

document.addEventListener('keyup', (evento) => {
    const tecla = evento.key.toLowerCase();
    if (!(tecla in teclas)) return;
    teclas[tecla] = false;
});

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

    if (teclas.a || teclas.d || entrandoCastillo) {
        mario.classList.add('mario-corriendo');
        return;
    }

    mario.classList.add('mario-idle');
}

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

/* MOVIMIENTO Y FÍSICAS */
function actualizarMovimiento() {
    if (emergiendoTubo || entrandoCastillo) return;

    if (teclas.a) {
        marioX -= velocidadX;
        direccion = -1;
    }
    if (teclas.d) {
        marioX += velocidadX;
        direccion = 1;
    }

    if (marioX < 0) marioX = 0;

    const limiteDerecho = anchoEscenario - anchoMario;
    if (marioX > limiteDerecho) marioX = limiteDerecho;

    if (teclas.w && enElSuelo) {
        velocidadY = fuerzaSalto;
        enElSuelo = false;
    }

    if (!enElSuelo) {
        velocidadY -= gravedad;
        marioY += velocidadY;

        const tuboX = 100;
        const tuboAncho = 90;
        const tuboTop = 230;
        const puedeCaerSobreTuberia = (marioX + anchoMario) > tuboX && marioX < (tuboX + tuboAncho);

        if (velocidadY <= 0 && marioY <= tuboTop && marioY >= tuboTop - 25 && puedeCaerSobreTuberia) {
            marioY = tuboTop;
            velocidadY = 0;
            enElSuelo = true;
        } else if (marioY <= suelo) {
            marioY = suelo;
            velocidadY = 0;
            enElSuelo = true;
        }
    }

    if (enElSuelo && marioY === 230) {
        if (!marioEstaSobreTuberia()) {
            enElSuelo = false;
            velocidadY = -0.5;
        }
    }

    mario.style.left = marioX + 'px';
    mario.style.bottom = marioY + 'px';

    mario.style.transform = direccion === -1 ? 'scaleX(-1)' : 'scaleX(1)';
    actualizarSkinMario();
}

/* =========================================================
   ENTRADA AL CASTILLO (DETECTA LA PUERTA)
========================================================= */
function comprobarEntradaCastillo() {
    if (entrandoCastillo || emergiendoTubo) return;

    const puertaX = 1965; 

    if (marioX >= puertaX && enElSuelo) {
        entrandoCastillo = true;
        direccion = 1;
        mario.style.transform = 'scaleX(1)';
        actualizarSkinMario();

        const animacionEntrar = setInterval(() => {
            marioX += 2;
            mario.style.left = marioX + 'px';

            if (marioX >= puertaX + 35) {
                mario.style.opacity = '0';
            }

            if (marioX >= puertaX + 60) {
                clearInterval(animacionEntrar);
                window.location.href = "bibliografia.html";
            }
        }, 16);
    }
}

function actualizarCamara() {
    const anchoPantalla = window.innerWidth;
    const limiteCamara = Math.max(0, anchoEscenario - anchoPantalla);

    let desplazamiento = marioX - anchoPantalla / 2;

    if (desplazamiento < 0) desplazamiento = 0;
    if (desplazamiento > limiteCamara) desplazamiento = limiteCamara;

    escenario.style.transform = `translateX(${-desplazamiento}px)`;
}

/* LOOP PRINCIPAL */
function gameLoop() {
    actualizarMovimiento();
    comprobarEntradaCastillo();
    actualizarCamara();
    requestAnimationFrame(gameLoop);
}

/* INICIALIZACIÓN */
iniciarAnimacionEntrada();
gameLoop();