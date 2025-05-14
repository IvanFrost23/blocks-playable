/**
 * Created by Ivan on 14.05.2025
 */

function showStartMessage() {
    document.getElementById('start-message-overlay').style.display = 'flex';
    setTimeout(function () {
        animateScoreCircleToProgressBar();
    }, 1000);
}

function animateScoreCircleToProgressBar() {
    var circle = document.getElementById('start-message-circle');
    var target = document.getElementById('score-end');

    var circleRect = circle.getBoundingClientRect();
    var targetRect = target.getBoundingClientRect();

    var deltaX = (targetRect.left + targetRect.width / 2) - (circleRect.left + circleRect.width / 2);
    var deltaY = (targetRect.top + targetRect.height / 2) - (circleRect.top + circleRect.height / 2);

    var finalScale = targetRect.width / circleRect.width;

    var keyframes = [
        { transform: 'translate(0, 0) scale(1)', offset: 0 },
        {
            transform: 'translate(' + (deltaX * 0.5) + 'px, ' + (deltaY * 0.5 - 30) + 'px) scale(' + (1 - (1 - finalScale) * 0.5) + ')',
            offset: 0.5
        },
        { transform: 'translate(' + deltaX + 'px, ' + deltaY + 'px) scale(' + finalScale + ')', offset: 1 }
    ];

    circle.animate(keyframes, {
        duration: 250,
        easing: 'ease-in-out',
        fill: 'forwards'
    }).onfinish = function () {
        document.getElementById('start-message-overlay').style.display = 'none';
    };
}