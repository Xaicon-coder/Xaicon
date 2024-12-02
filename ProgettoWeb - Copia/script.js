// Funzione per cambiare il video quando selezionato
function cambiaVideo() {
    const videoSelector = document.getElementById("videoSelector");
    const videoId = videoSelector.value;
    const youtubeVideo = document.getElementById("youtubeVideo");

    // Cambia l'ID del video incorporato
    youtubeVideo.src = `https://www.youtube.com/embed/${videoId}`;
}

// Funzione per cambiare il colore dello sfondo
function cambiaSfondo() {
    const backgroundSelector = document.getElementById("backgroundSelector");
    const colore = backgroundSelector.value;

    // Cambia il colore dello sfondo
    document.body.style.backgroundColor = colore;
}

