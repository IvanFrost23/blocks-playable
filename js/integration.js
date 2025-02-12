document.addEventListener('DOMContentLoaded', function() {
    if (window.mraid) {
        mraid.addEventListener('ready', onMraidReady);

        if (mraid.getState() === 'ready') {
            onMraidReady();
        }
    } else {
        window.startGame();
    }
});

function onMraidReady() {
    if (window.gameStarted) {
        return;
    }

    var music = document.getElementById('music');
    mraid.addEventListener('pause', function() {
        music && music.pause();
    });

    mraid.addEventListener('resume', function() {
        music && music.play();
    });

    window.startGame();
}

function onCTAClick() {
    if (window.mraid && typeof mraid.open === 'function') {
        var storeUrl = "https://play.google.com/store/apps/details?id=com.cleverapps.woodenblock&hl=en";
        mraid.open(storeUrl);
    } else if (typeof FbPlayableAd !== 'undefined' && FbPlayableAd.onCTAClick) {
        FbPlayableAd.onCTAClick();
    } else {
        alert("GAME OVER!");
    }
}
