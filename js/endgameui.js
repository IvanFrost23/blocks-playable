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

        document.querySelectorAll('#win-screen .animated-text').forEach((el, index) => {
            setTimeout(function () {
                wrapLetters(el)
            }, 1000 + index * 500);
        });

        document.getElementById('victory_logo').play();
        setTimeout(function () {
            document.getElementById('endgame_points').play();
        }, 1500);
        setTimeout(function () {
            document.getElementById('endgame_button').play();
        }, 2000);
    } else {
        if (progress < goalProgress) {
            const loseScreen = document.getElementById("lose-screen");
            loseScreen.style.display = "block";
            document.body.classList.add('lose-bg');

            const pct = (progress / goalProgress) * 100;
            const fillEl = document.getElementById("lose-progress-fill");
            const greenEl = document.getElementById("lose-score-green");

            fillEl.style.width = '0%';
            greenEl.style.left = '0%';

            document.querySelectorAll('#lose-screen .animated-text').forEach((el, index) => {
                setTimeout(function () {
                    wrapLetters(el)
                }, 1000 + index * 500);
            });


            setTimeout(() => document.getElementById('lose_logo').play(), 250);

            setTimeout(() => {
                fillEl.style.width = pct + '%';
                greenEl.style.left = pct + '%';

                const numEl = document.getElementById("lose-score-green-text");
                animateCount(numEl, 0, progress, 500);

                setTimeout(() => document.getElementById('endgame_points').play(), 500);
            }, 1500);

            setTimeout(() => document.getElementById('endgame_button').play(), 2500);
        }
    }
}

document.getElementById("btn-next-level").addEventListener("click", function() {
    onCTAClick();
});

document.getElementById("btn-retry").addEventListener("click", function() {
    onCTAClick();
});