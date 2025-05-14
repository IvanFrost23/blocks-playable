/**
 * Created by Ivan on 13.05.2025
 */

function showEndGameUI(progress, goalProgress) {
    document.getElementById("game-container").style.display = "none";
    document.getElementById("coin-container").style.display = "none";
    document.getElementById("gold-container").style.display = "none";

    if (progress <= goalProgress) {
        var winScreen = document.getElementById("win-screen");
        winScreen.style.display = "block";
        document.body.classList.add('win-bg');

        var winTexts = document.querySelectorAll('#win-screen .animated-text');
        for (var i = 0; i < winTexts.length; i++) {
            (function(el, idx) {
                setTimeout(function () {
                    wrapLetters(el);
                }, 1000 + idx * 500);
            })(winTexts[i], i);
        }

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

        progress = Math.max(25, Math.max(goalProgress, progress));
        var pct = Math.min(100, (75 - (progress - goalProgress)) / 75 * 100);
        var fillEl   = document.getElementById("lose-progress-fill");
        var greenEl  = document.getElementById("lose-score-green");

        fillEl.style.width = '0%';
        greenEl.style.left = '0%';

        var loseTexts = document.querySelectorAll('#lose-screen .animated-text');
        for (var j = 0; j < loseTexts.length; j++) {
            (function(el, idx) {
                setTimeout(function () {
                    wrapLetters(el);
                }, 1000 + idx * 500);
            })(loseTexts[j], j);
        }

        setTimeout(function () {
            document.getElementById('lose_logo').play();
        }, 250);

        setTimeout(function () {
            fillEl.style.width = pct + '%';
            greenEl.style.left = pct + '%';

            var numEl = document.getElementById("lose-score-green-text");
            animateCount(numEl, 0, progress, 500);

            setTimeout(function () {
                document.getElementById('endgame_points').play();
            }, 500);
        }, 1500);

        // Кнопка
        setTimeout(function () {
            document.getElementById('endgame_button').play();
        }, 2500);
    }
}

var btnNext  = document.getElementById("btn-next-level");
var btnRetry = document.getElementById("btn-retry");

if (btnNext) {
    btnNext.addEventListener("click", function() {
        onCTAClick();
    });
}

if (btnRetry) {
    btnRetry.addEventListener("click", function() {
        onCTAClick();
    });
}
