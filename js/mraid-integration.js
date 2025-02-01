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
    window.startGame();
}

function openStore() {
    var storeUrl = "https://play.google.com/store/apps/details?id=com.cleverapps.woodenblock&hl=en";
    if (window.mraid && typeof mraid.open === 'function') {
        mraid.open(storeUrl);
    } else {
        alert("GAME OVER!");
    }
}
