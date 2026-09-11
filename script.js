const mario = document.getElementById('mario');
const instruccionesTeclas = document.getElementById('instrucciones-teclas');
const modalML = document.getElementById('modal-ml');
const tuboEntrada = document.getElementById('tubo-entrada');
const juegoContainer = document.getElementById('juego');

const nivelSuelo = 50;
let marioX = 40;
let marioY = nivelSuelo;
let velocidadY = 0;
let enElSuelo = true;
let direccion = 1;
let bajandoTubo = false;

const velocidadX = 7;
const gravedad = 0.8;
const fuerzaSalto = 17;

const teclas = { w: false, a: false, s: false, d: false };

window.addEventListener('keydown', (e) => {
    const tecla = e.key.toLowerCase();
    if (teclas.hasOwnProperty(tecla)) {
        teclas[tecla] = true;
        if (instruccionesTeclas) {
            instruccionesTeclas.classList.add('oculto');
        }
    }
});

window.addEventListener('keyup', (e) => {
    const tecla = e.key.toLowerCase();
    if (teclas.hasOwnProperty(tecla)) teclas[tecla] = false;
});

function rebotarBloque(bloque) {
    const bottomOriginal = parseInt(bloque.style.bottom);
    bloque.style.bottom = (bottomOriginal + 5) + 'px';
    setTimeout(() => {
        bloque.style.bottom = bottomOriginal + 'px';
    }, 100);
}

function resolverColisiones(siguienteX, siguienteY) {
    const obstaculos = document.querySelectorAll('.obstaculo');
    const marioWidth = 48;
    const marioHeight = 60;

    let resultado = { x: siguienteX, y: siguienteY, enPlataforma: false };

    obstaculos.forEach(elem => {
        const bLeft = parseInt(elem.style.left);
        const bBottom = parseInt(elem.style.bottom);
        const bWidth = elem.offsetWidth;
        const bHeight = elem.offsetHeight;

        const solapeX = (resultado.x + marioWidth > bLeft) && (resultado.x < bLeft + bWidth);
        const solapeY = (resultado.y + marioHeight > bBottom) && (resultado.y < bBottom + bHeight);

        if (solapeX && solapeY) {
            const previoSolapeX = (marioX + marioWidth > bLeft) && (marioX < bLeft + bWidth);

            if (previoSolapeX) {
                // Golpe de cabeza
                if (velocidadY > 0 && marioY + marioHeight <= bBottom + 12) {
                    resultado.y = bBottom - marioHeight;
                    velocidadY = 0;

                    if (elem.id === 'bloque-mensaje-ml' && !elem.classList.contains('usado')) {
                        elem.classList.add('usado');
                        if (modalML) {
                            modalML.classList.remove('oculto');
                        }
                    } else if (elem.classList.contains('bloque')) {
                        rebotarBloque(elem);
                    }
                } 
                // Aterrizaje
                else if (velocidadY <= 0 && marioY >= bBottom + bHeight - 20) {
                    resultado.y = bBottom + bHeight;
                    velocidadY = 0;
                    resultado.enPlataforma = true;
                }
            } else {
                // Bloqueo lateral
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

function comprobarEntradaTubo() {
    if (!tuboEntrada || bajandoTubo) return;

    const tuboLeft = parseInt(tuboEntrada.style.left);
    const tuboWidth = tuboEntrada.offsetWidth;
    const tuboHeight = tuboEntrada.offsetHeight;
    const tuboTopY = parseInt(tuboEntrada.style.bottom) + tuboHeight;

    // Colocar a Mario centrado sobre la tubería
    const sobreTuboX = (marioX + 24 >= tuboLeft) && (marioX + 24 <= tuboLeft + tuboWidth);
    const sobreTuboY = Math.abs(marioY - tuboTopY) < 5;

    if (sobreTuboX && sobreTuboY && teclas.s) {
        bajandoTubo = true;

        // Cambiar estados visuales al entrar al tubo
        mario.className = '';
        mario.classList.add('mario-agachado', 'bajando-tubo');

        // Centrar exactamente en la boca de la tubería
        marioX = tuboLeft + (tuboWidth / 2) - 24;
        mario.style.left = marioX + 'px';

        setTimeout(() => {
            console.log("Mario bajó por la tubería. Listo para cargar las siguientes imágenes.");
        }, 1000);
    }
}

function actualizar() {
    if (bajandoTubo) return;

    let nuevoX = marioX;
    let moviendose = false;

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

    // CÁLCULO DINÁMICO DEL LÍMITE DERECHO DE LA PANTALLA
    const anchoPantalla = juegoContainer ? juegoContainer.offsetWidth : window.innerWidth;
    const limiteIzquierdo = 0;
    const limiteDerecho = anchoPantalla - 48; // 48px es el ancho de Mario

    if (nuevoX < limiteIzquierdo) nuevoX = limiteIzquierdo;
    if (nuevoX > limiteDerecho) nuevoX = limiteDerecho;

    if (teclas.w && enElSuelo) {
        velocidadY = fuerzaSalto;
        enElSuelo = false;
    }

    let nuevoY = marioY + velocidadY;
    velocidadY -= gravedad;

    const colision = resolverColisiones(nuevoX, nuevoY);
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

    // MANEJO DE CLASES DE SPRITE
    mario.className = '';
    if (!enElSuelo) {
        mario.classList.add('mario-saltando');
    } else if (moviendose) {
        mario.classList.add('mario-corriendo');
    } else {
        mario.classList.add('mario-idle');
    }

    mario.style.transform = `scaleX(${direccion * 1.2}) scaleY(1.2)`;
    mario.style.left = marioX + 'px';
    mario.style.bottom = marioY + 'px';

    comprobarEntradaTubo();

    requestAnimationFrame(actualizar);
}

actualizar();