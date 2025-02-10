function createTutorialShape(shape, shapeOffsets, cellSize) {
    var dragImage = shape.cloneNode(true);
    dragImage.classList.add("tutorial-shape");
    var maxRow = Math.max.apply(null, shapeOffsets.map(function(o) { return o.row; })) + 1;
    var maxCol = Math.max.apply(null, shapeOffsets.map(function(o) { return o.col; })) + 1;
    dragImage.style.gridTemplateRows = "repeat(" + maxRow + ", " + cellSize + "px)";
    dragImage.style.gridTemplateColumns = "repeat(" + maxCol + ", " + cellSize + "px)";
    dragImage.style.width = Math.ceil(cellSize * maxCol) + "px";
    dragImage.style.height = Math.ceil(cellSize * maxRow) + "px";
    var blocks = dragImage.querySelectorAll(".block");
    for (var i = 0; i < blocks.length; i++) {
        var block = blocks[i];
        block.style.width = cellSize + "px";
        block.style.height = cellSize + "px";
        var crystal = block.querySelector(".crystal");
        if (crystal) {
            crystal.style.width = (cellSize * 0.5) + "px";
            crystal.style.height = (cellSize * 0.5) + "px";
        }
    }
    return dragImage;
}

function startTutorialAnimation() {
    const shape = shapesContainer.querySelector('.shape');
    if (!shape) return;
    let finger = document.getElementById("tutorialFinger");
    if (!finger) {
        finger = document.createElement('img');
        finger.src = "../images/finger.png";
        finger.id = "tutorialFinger";
        finger.style.position = "absolute";
        finger.style.pointerEvents = "none";
        finger.style.zIndex = "9999";
        document.body.appendChild(finger);
    }
    function animateCycle() {
        const scaleFactor = getScaleFactor();
        const shapeRect = shape.getBoundingClientRect();
        const startX = shapeRect.left + shapeRect.width / 2;
        const startY = shapeRect.top + shapeRect.height / 2;
        const targetCell = cells[59];
        const targetRect = targetCell.getBoundingClientRect();
        const endX = targetRect.left;
        const endY = targetRect.top;
        finger.style.transition = "none";
        finger.style.left = startX + "px";
        finger.style.top = startY + "px";
        finger.style.opacity = "1";
        finger.style.transformOrigin = "center center";
        finger.style.transform = "translate(-50%, -50%) translate(" + (40 * scaleFactor) + "px, " + (50 * scaleFactor) + "px) scale(" + scaleFactor + ")";
        void finger.offsetWidth;
        const cellSize = playingField.querySelector(".cell").offsetWidth;
        const blocks = shape.querySelectorAll(".block");
        let shapeOffsets = [];
        blocks.forEach(function(block) {
            const row = parseInt(block.style.gridRowStart) - 1;
            const col = parseInt(block.style.gridColumnStart) - 1;
            shapeOffsets.push({ row, col });
        });
        const scaledClone = createTutorialShape(shape, shapeOffsets, cellSize);
        scaledClone.id = "scaledClone";
        scaledClone.style.opacity = "0.5";
        scaledClone.style.transformOrigin = "center center";
        scaledClone.style.left = startX + "px";
        scaledClone.style.top = startY + "px";
        scaledClone.style.transform = "translate(-50%, -50%) scale(" + scaleFactor + ")";
        document.body.appendChild(scaledClone);
        void scaledClone.offsetWidth;
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const transitionStyle = "transform 1s ease-out, opacity 1s ease-out";
        finger.style.transition = transitionStyle;
        scaledClone.style.transition = transitionStyle;
        finger.style.transform = `translate(${deltaX}px, ${deltaY}px) translate(-50%, -50%) translate(${40 * scaleFactor}px, ${50 * scaleFactor}px) scale(${scaleFactor})`;
        scaledClone.style.transform = `translate(${deltaX}px, ${deltaY}px) translate(-50%, -50%) scale(${scaleFactor})`;
        setTimeout(() => {
            if (scaledClone.parentNode) {
                scaledClone.parentNode.removeChild(scaledClone);
            }
            finger.style.opacity = "0";
        }, 1000);
        function onFade(e) {
            if (e.propertyName === "opacity") {
                finger.removeEventListener("transitionend", onFade);
                setTimeout(animateCycle, 500);
            }
        }
        finger.addEventListener("transitionend", onFade);
    }
    animateCycle();
}

function stopTutorialAnimation() {
    const finger = document.getElementById("tutorialFinger");
    const scaledClone = document.getElementById("scaledClone");

    finger && finger.remove();
    scaledClone && scaledClone.remove();
}
