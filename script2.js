const mario = document.getElementById('mario');
const escenario = document.getElementById('escenario');
const textoNivel = document.getElementById('texto-nivel2');
const planta1 = document.getElementById('planta1');
const planta2 = document.getElementById('planta2');
const espina = document.getElementById('espina');
const hongo = document.getElementById('hongo');

const nivelSuelo = 50;

// Posición inicial de Mario
let marioX = 171;
let marioY = 230;
let velocidadY = 0;
let enElSuelo = false;
let direccion = 1;

// Cámara y Scroll Limit (No-backtracking)
let camaraX = 0;
let limiteIzquierdoAbsoluto = 0;

const velocidadX = 7;
const gravedad = 0.8;
const fuerzaSalto = 17;

const teclas = { w: false, a: false, s: false, d: false };

// Estados del flujo
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

// SISTEMA DE TEXTOS CON TIMERS Y BLOQUEO DE LECTURA
let textoBloqueadoHasta = 0; 
let indicePasoTexto = 0; 

function mostrarTextoConTimer(mensaje, duracionMs) {
    textoNivel.textContent = mensaje;
    textoBloqueadoHasta = Date.now() + duracionMs;
}


window.addEventListener('keydown', (e) => {
    const tecla = e.key.toLowerCase();
    if (teclas.hasOwnProperty(tecla)) teclas[tecla] = true;
});


window.addEventListener('keyup', (e) => {
    const tecla = e.key.toLowerCase();
    if (teclas.hasOwnProperty(tecla)) teclas[tecla] = false;
});


// Ciclo de Planta 1 (Sube y baja)
setInterval(() => {
    if (marioMuerto) return;

    planta1Arriba = !planta1Arriba;

    if (planta1) {
        planta1.style.bottom = planta1Arriba ? '160px' : '90px';
    }

}, 2000);


function actualizarTextosYCamara() {
    const anchoPantalla = window.innerWidth;
    const objetivoCamara = marioX - (anchoPantalla / 3);

    if (objetivoCamara > camaraX) {
        camaraX = objetivoCamara;
        limiteIzquierdoAbsoluto = camaraX;
    }

    escenario.style.transform = `translateX(${-camaraX}px)`;

    const ahora = Date.now();

    if (ahora < textoBloqueadoHasta) return;

    if (marioEsFantasma) {
        textoNivel.textContent = "PERO TE DAMOS OTRA OPORTUNIDAD";
    } else {

        if (indicePasoTexto === 0 && marioX >= 171) {
            mostrarTextoConTimer("MARIO BROS NO USA MACHINE LEARNING", 2000);
            indicePasoTexto = 1;

        } else if (indicePasoTexto === 1 && marioX >= 550) {
            mostrarTextoConTimer("PERO SI LO TUVIERA...", 1800);
            indicePasoTexto = 2;

        } else if (indicePasoTexto === 2 && marioX >= 900) {
            mostrarTextoConTimer("PODRÍA APRENDER TU COMPORTAMIENTO", 1500);
            indicePasoTexto = 3;
        }
    }
}


function resolverColisiones(siguienteX, siguienteY) {
    const obstaculos = document.querySelectorAll('.obstaculo');

    const marioWidth = 48;
    const marioHeight = 60;

    let resultado = {
        x: siguienteX,
        y: siguienteY,
        enPlataforma: false
    };

    obstaculos.forEach(elem => {

        const bLeft = parseInt(elem.style.left) || elem.offsetLeft;
        const bBottom = parseInt(elem.style.bottom) || 50;
        const bWidth = elem.offsetWidth;
        const bHeight = elem.offsetHeight;

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
                    marioY >= bBottom + bHeight - 20
                ) {
                    resultado.y = bBottom + bHeight;
                    velocidadY = 0;
                    resultado.enPlataforma = true;
                }

            } else {

                if (marioX + marioWidth <= bLeft) {
                    resultado.x = bLeft - marioWidth;

                } else if (marioX >= bLeft + bWidth) {
                    resultado.x = bLeft + bWidth;
                }
            }
        }
    });

    return resultado;
}


function comprobarContactoPlanta1() {

    if (marioMuerto || !planta1Arriba) return;

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

        marioX = limiteIzquierdoAbsoluto + 20;
        marioY = nivelSuelo;
        velocidadY = 0;
    }
}


function comprobarAtaquePlanta2() {

    if (planta2DisparoLanzado || marioMuerto) return;

    const p2Left =
        planta2
            ? (parseInt(planta2.style.left) || planta2.offsetLeft)
            : 1720;

    const distancia = p2Left - marioX;
    const umbral18 = window.innerWidth / 8;

    if (distancia > 0 && distancia <= umbral18) {

        planta2DisparoLanzado = true;
        controlesBloqueados = true;

        mostrarTextoConTimer("Y CAMBIAR EL SUYO.", 3000);

        const espinaOrigenX = p2Left + 20;
        const espinaOrigenY =
            (parseInt(planta2.style.bottom) || 160) + 50;

        lanzarEspina(
            marioX + 24,
            marioY + 30,
            espinaOrigenX,
            espinaOrigenY
        );
    }
}


function lanzarEspina(targetX, targetY, origenX, origenY) {

    espinaX = origenX;
    espinaY = origenY;

    espina.style.display = 'block';

    const dx = targetX - espinaX;
    const dy = targetY - espinaY;
    const dist = Math.hypot(dx, dy);

    const velocidadEspina = 18;

    espinaVX = (dx / dist) * velocidadEspina;
    espinaVY = (dy / dist) * velocidadEspina;

    espinaActiva = true;
}


function actualizarEspina() {

    if (!espinaActiva) return;

    espinaX += espinaVX;
    espinaY += espinaVY;

    espina.style.left = espinaX + 'px';
    espina.style.bottom = espinaY + 'px';

    const centroMarioX = marioX + 24;
    const centroMarioY = marioY + 30;

    if (
        Math.hypot(
            espinaX - centroMarioX,
            espinaY - centroMarioY
        ) < 35
    ) {

        espinaActiva = false;
        espina.style.display = 'none';

        ejecutarMuerteFantasma();
    }
}


function ejecutarMuerteFantasma() {

    marioMuerto = true;
    marioEsFantasma = true;
    controlesBloqueados = false;

    velocidadY = 14;

    setTimeout(() => {

        mario.classList.add('mario-fantasma');

        mostrarTextoConTimer(
            "PERO TE DAMOS OTRA OPORTUNIDAD",
            4000
        );

        aparecerHongo();

    }, 300);
}


// ============================================================
// HONGO REVIVIDOR
// ============================================================

function aparecerHongo() {

    // El hongo aparece exactamente sobre Mario.
    hongoX = marioX;

    // Aparece 180px por encima de Mario.
    hongoY = marioY + 180;

    hongo.style.left = hongoX + 'px';
    hongo.style.bottom = hongoY + 'px';

    hongo.style.display = 'block';

    hongoActivo = true;
}


function actualizarHongo() {

    if (!hongoActivo) return;

    // El hongo cae verticalmente.
    // No cambia su posición X.
    if (hongoY > nivelSuelo) {
        hongoY -= 1;
    }

    hongo.style.left = hongoX + 'px';
    hongo.style.bottom = hongoY + 'px';


    // Tamaño aproximado de los elementos.
    const hongoWidth = 40;
    const hongoHeight = 40;

    const marioWidth = 48;
    const marioHeight = 60;


    // Comprobamos si el hongo toca a Mario.
    const solapeX =
        hongoX + hongoWidth > marioX &&
        hongoX < marioX + marioWidth;

    const solapeY =
        hongoY < marioY + marioHeight &&
        hongoY + hongoHeight > marioY;


    if (solapeX && solapeY) {

        // El hongo desaparece.
        hongoActivo = false;
        hongo.style.display = 'none';

        // Mario revive.
        marioEsFantasma = false;
        marioMuerto = false;
        controlesBloqueados = false;

        // Mario cae/queda en el suelo.
        marioY = nivelSuelo;
        velocidadY = 0;
        enElSuelo = true;

        // Recupera la skin idle.
        mario.className = 'mario-idle';
    }
}


function actualizar() {

    actualizarTextosYCamara();


    if (espinaActiva) {
        actualizarEspina();
    }

    if (hongoActivo) {
        actualizarHongo();
    }


    if (!marioMuerto) {

        let nuevoX = marioX;
        let moviendose = false;


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


        if (nuevoX < limiteIzquierdoAbsoluto) {
            nuevoX = limiteIzquierdoAbsoluto;
        }


        if (
            teclas.w &&
            enElSuelo &&
            !controlesBloqueados
        ) {
            velocidadY = fuerzaSalto;
            enElSuelo = false;
        }


        let nuevoY = marioY + velocidadY;

        velocidadY -= gravedad;


        const colision =
            resolverColisiones(nuevoX, nuevoY);

        marioX = colision.x;
        marioY = colision.y;


        if (colision.enPlataforma) {

            enElSuelo = true;
            velocidadY = 0;

        } else if (marioY <= nivelSuelo) {

            marioY = nivelSuelo;
            velocidadY = 0;
            enElSuelo = true;

        } else {

            enElSuelo = false;
        }


        comprobarContactoPlanta1();
        comprobarAtaquePlanta2();


        mario.className = '';


        if (marioEsFantasma) {

            mario.classList.add('mario-fantasma');

        } else if (!enElSuelo) {

            mario.classList.add('mario-saltando');

        } else if (moviendose) {

            mario.classList.add('mario-corriendo');

        } else {

            mario.classList.add('mario-idle');
        }


    } else if (marioMuerto && marioEsFantasma) {

        // Mario sigue cayendo mientras espera al hongo.
        // Esta es la única modificación necesaria respecto
        // a la lógica anterior: antes esta caída se detenía
        // mientras el hongo estaba activo.

        marioY += velocidadY;
        velocidadY -= gravedad;

        if (marioY < nivelSuelo) {
            marioY = nivelSuelo;
            velocidadY = 0;
        }
    }


    // Mantiene la orientación exacta según la dirección
    // sin romper la física.
    mario.style.transform =
        `scaleX(${direccion * 1.2}) scaleY(1.2)`;

    mario.style.left = marioX + 'px';
    mario.style.bottom = marioY + 'px';


    requestAnimationFrame(actualizar);
}


actualizar();