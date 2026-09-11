/* =========================================================
   BIBLIOGRAFÍA - GENERACIÓN DE LINKS
========================================================= */

// Arreglo con la lista de referencias y sus respectivos links
const itemsBibliografia = [
    { numero: "1", texto: "MACHINE LEARNING", url: "https://www.xataka.com/robotica-e-ia/machine-learning-y-deep-learning-como-entender-las-claves-del-presente-y-futuro-de-la-inteligencia-artificial" },
    { numero: "2", texto: "MACHINE LEARNING 2", url: "https://www.ibm.com/mx-es/think/topics/machine-learning" },
    { numero: "3", texto: "MACHINE LEARNING 3", url: "https://azure.microsoft.com/en-us/resources/cloud-computing-dictionary/what-is-machine-learning-platform" },
    { numero: "4", texto: "FIFA", url: "https://www.ea.com/es-es/ea-play/news/pitch-notes-fifa-23-gameplay-deep-dive" },
    { numero: "5", texto: "Creatures", url: "https://www.sussex.ac.uk/informatics/cogslib/reports/csrp/csrp434.pdf" }
];

function cargarBibliografia() {
    const contenedorLista = document.getElementById('lista-bibliografia');

    if (!contenedorLista) return;

    itemsBibliografia.forEach(item => {
        const li = document.createElement('li');

        // Crea la estructura: • X [LINK]
        li.innerHTML = `${item.numero} <a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.texto}</a>`;

        contenedorLista.appendChild(li);
    });
}

// Cargar la lista al iniciar
document.addEventListener('DOMContentLoaded', cargarBibliografia);