function animateCollect(startElement, finishElement, callback) {
    var startRect = startElement.getBoundingClientRect();
    var startX = startRect.left + startRect.width / 2;
    var startY = startRect.top + startRect.height / 2;

    var finishRect = finishElement.getBoundingClientRect();
    var targetX = finishRect.left + finishRect.width / 2;
    var targetY = finishRect.top + finishRect.height / 2;

    var flyingTarget = document.createElement('div');
    flyingTarget.classList.add('flying-target');
    document.body.appendChild(flyingTarget);
    flyingTarget.style.left = startX + 'px';
    flyingTarget.style.top = startY + 'px';
    flyingTarget.style.transform = 'translate(-50%, -50%)';

    var deltaX = targetX - startX;
    var deltaY = targetY - startY;
    var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    var duration = distance / 700;

    flyingTarget.style.transition = `transform ${duration}s ease-in-out`;

    requestAnimationFrame(() => {
        flyingTarget.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px))`;
    });

    flyingTarget.addEventListener('transitionend', () => {
        flyingTarget.remove();

        finishElement.classList.add('target-hit');
        finishElement.addEventListener('animationend', function handler() {
            finishElement.classList.remove('target-hit');
            finishElement.removeEventListener('animationend', handler);
        });

        callback && callback();
    });
}