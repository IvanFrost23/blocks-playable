/**
 * Created by Ivan on 13.05.2025
 */

function showEndGameUI(progress, goalProgress) {
    document.getElementById("game-container").style.display = "none";
    document.getElementById("coin-container").style.display = "none";

    if (progress >= goalProgress) {
        var winScreen = document.getElementById("win-screen");
        winScreen.style.display = "block";
        document.body.classList.add('win-bg');
        document.getElementById("win-score-text").textContent = progress;

        document.getElementById('victory_logo').play();
        setTimeout(function () {
            document.getElementById('endgame_points').play();
        }, 1500);
        setTimeout(function () {
            document.getElementById('endgame_button').play();
        }, 2000);
    } else {
        var loseScreen = document.getElementById("lose-screen");
        loseScreen.style.display = "block";
        document.body.classList.add('lose-bg');

        var percent = (progress / goalProgress) * 100;
        document.getElementById("lose-progress-fill").style.width = percent + "%";

        var loseScoreGreen = document.getElementById("lose-score-green");
        loseScoreGreen.style.left = percent + "%";

        document.getElementById("lose-score-green-text").textContent = progress;
        document.getElementById("lose-score-end-text").textContent = goalProgress;

        setTimeout(function () {
            document.getElementById('lose_logo').play();
        }, 250);

        setTimeout(function () {
            document.getElementById('endgame_points').play();
        }, 2000);
        setTimeout(function () {
            document.getElementById('endgame_button').play();
        }, 2500);
    }
}

document.getElementById("btn-next-level").addEventListener("click", function() {
    onCTAClick();
});

document.getElementById("btn-retry").addEventListener("click", function() {
    onCTAClick();
});