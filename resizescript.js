/**
 * Created by Ivan on 10.01.2025
 */

function resizeGame() {
    const gameContainer = document.getElementById('game-container');
    const widthToHeightRatio = 600 / 931;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let scaleFactor;

    if (viewportWidth / viewportHeight < widthToHeightRatio) {
        scaleFactor = viewportWidth / 600;
    } else {
        scaleFactor = viewportHeight / 931;
    }

    gameContainer.style.transform = `scale(${scaleFactor})`;
}

window.addEventListener('resize', resizeGame);
window.addEventListener('load', resizeGame);