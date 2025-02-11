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

    flyingTarget.style.left = '0px';
    flyingTarget.style.top = '0px';

    var deltaX = targetX - startX;
    var deltaY = targetY - startY;
    var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    var duration = distance / 700;

    var baseControlOffset = Math.min(150, distance / 2);
    var angle = Math.atan2(deltaY, deltaX);
    var perpAngle = angle - Math.PI / 2;

    var randomAngleOffset1 = (Math.random() - 0.5) * 0.35; // about ±20° in radians
    var randomControlOffset1 = baseControlOffset * (0.8 + Math.random() * 0.4); // 80% to 120% of the base offset

    var randomAngleOffset2 = (Math.random() - 0.5) * 0.35;
    var randomControlOffset2 = baseControlOffset * (0.8 + Math.random() * 0.4);

    var control1X = startX + deltaX * 0.25 + randomControlOffset1 * Math.cos(perpAngle + randomAngleOffset1);
    var control1Y = startY + deltaY * 0.25 + randomControlOffset1 * Math.sin(perpAngle + randomAngleOffset1);
    var control2X = startX + deltaX * 0.75 + randomControlOffset2 * Math.cos(perpAngle + randomAngleOffset2);
    var control2Y = startY + deltaY * 0.75 + randomControlOffset2 * Math.sin(perpAngle + randomAngleOffset2);

    var path = `M ${startX} ${startY} C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${targetX} ${targetY}`;

    flyingTarget.style.offsetPath = `path('${path}')`;
    flyingTarget.style.webkitOffsetPath = `path('${path}')`;

    flyingTarget.style.offsetDistance = '0%';
    flyingTarget.style.webkitOffsetDistance = '0%';

    flyingTarget.style.animation = `flyAnimation ${duration}s ease-in-out forwards`;
    flyingTarget.style.webkitAnimation = `flyAnimation ${duration}s ease-in-out forwards`;

    flyingTarget.addEventListener('animationend', () => {
        flyingTarget.remove();

        finishElement.classList.add('target-hit');
        finishElement.addEventListener('animationend', function handler() {
            finishElement.classList.remove('target-hit');
            finishElement.removeEventListener('animationend', handler);
        });

        if (callback) {
            callback();
        }
    });
}
