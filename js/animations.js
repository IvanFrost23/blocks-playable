function animateCollect(startElement, finishElement, callback, gameScale) {
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

    flyingTarget.style.transform = 'scale(' + gameScale + ')';

    var deltaX = targetX - startX;
    var deltaY = targetY - startY;
    var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    var duration = distance / (1500 * gameScale) + 0.4;

    var supportsMotionPath =
        'offsetPath' in flyingTarget.style || 'webkitOffsetPath' in flyingTarget.style;

    if (supportsMotionPath) {
        var baseControlOffset = Math.min(150, distance / 2);
        var angle = Math.atan2(deltaY, deltaX);
        var perpAngle = angle - Math.PI / 2;

        var randomAngleOffset1 = (Math.random() - 0.5) * (Math.PI * 1.2);
        var randomAngleOffset2 = (Math.random() - 0.5) * (Math.PI * 1.2);

        var t1 = 0.25 + (Math.random() - 0.5) * 0.2;
        var t2 = 0.75 + (Math.random() - 0.5) * 0.2;

        var randomControlOffset1 = baseControlOffset * (0.1 + Math.random());
        var randomControlOffset2 = baseControlOffset * (0.1 + Math.random());

        var control1X =
            startX + deltaX * t1 + randomControlOffset1 * Math.cos(perpAngle + randomAngleOffset1);
        var control1Y =
            startY + deltaY * t1 + randomControlOffset1 * Math.sin(perpAngle + randomAngleOffset1);
        var control2X =
            startX + deltaX * t2 + randomControlOffset2 * Math.cos(perpAngle + randomAngleOffset2);
        var control2Y =
            startY + deltaY * t2 + randomControlOffset2 * Math.sin(perpAngle + randomAngleOffset2);

        var path = 'M ' + startX + ' ' + startY + ' C ' + control1X + ' ' + control1Y + ', ' + control2X + ' ' + control2Y + ', ' + targetX + ' ' + targetY;

        flyingTarget.style.offsetPath = 'path(\'' + path + '\')';
        flyingTarget.style.webkitOffsetPath = 'path(\'' + path + '\')';

        flyingTarget.style.offsetDistance = '0%';
        flyingTarget.style.webkitOffsetDistance = '0%';

        flyingTarget.style.transform = 'scale(' + gameScale + ')';

        flyingTarget.style.animation = 'flyAnimation ' + duration + 's ease-in-out forwards';
        flyingTarget.style.webkitAnimation = 'flyAnimation ' + duration + 's ease-in-out forwards';

        flyingTarget.addEventListener('animationend', function handleAnimationEnd() {
            flyingTarget.parentNode.removeChild(flyingTarget);

            finishElement.classList.add('target-hit');
            document.getElementById('collect_effect').play();
            finishElement.addEventListener('animationend', function handler() {
                finishElement.classList.remove('target-hit');
                finishElement.removeEventListener('animationend', handler);
            });

            if (callback) {
                callback();
            }
        });
    } else {
        flyingTarget.style.left = (startX - 20) + 'px';
        flyingTarget.style.top = (startY - 20) + 'px';

        flyingTarget.style.transform = 'translate(0px, 0px) scale(' + gameScale + ')';

        flyingTarget.offsetWidth;

        flyingTarget.style.transition = 'transform ' + duration + 's ease-in-out';

        flyingTarget.style.transform = 'translate(' + deltaX + 'px, ' + deltaY + 'px) scale(' + gameScale + ')';

        flyingTarget.addEventListener('transitionend', function handleTransitionEnd(e) {
            if (e.propertyName === 'transform') {
                flyingTarget.parentNode.removeChild(flyingTarget);

                finishElement.classList.add('target-hit');
                document.getElementById('collect_effect').play();
                finishElement.addEventListener('animationend', function handler() {
                    finishElement.classList.remove('target-hit');
                    finishElement.removeEventListener('animationend', handler);
                });

                if (callback) {
                    callback();
                }
            }
        });
    }
}

function wrapLetters(el) {
    el.style.visibility = 'visible';
    const text = el.textContent;
    el.innerHTML = '';

    Array.from(text).forEach((char, i) => {
        if (char === ' ') {
            el.appendChild(document.createTextNode('\u00A0'));
        } else {
            const span = document.createElement('span');
            span.className = 'fade-in-letter';
            span.textContent = char;
            span.style.animationDelay = `${i * 0.03}s`;
            el.appendChild(span);
        }
    });
}


function animateCount(el, start, end, duration) {
    let startTime = null;
    function tick(time) {
        if (!startTime) startTime = time;
        const progress = Math.min((time - startTime) / duration, 1);
        el.textContent = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            requestAnimationFrame(tick);
        } else {
            el.textContent = end;
        }
    }
    requestAnimationFrame(tick);
}
