function createTutorialShape(shape, shapeOffsets, cellSize) {
    var dragImage = shape.cloneNode(true);
    dragImage.style.position = "absolute";
    dragImage.style.pointerEvents = "none";
    dragImage.style.display = "grid";

    var maxRow = Math.max.apply(null, shapeOffsets.map(function(o) { return o.row; })) + 1;
    var maxCol = Math.max.apply(null, shapeOffsets.map(function(o) { return o.col; })) + 1;

    dragImage.style.gridTemplateRows = "repeat(" + maxRow + ", " + cellSize + "px)";
    dragImage.style.gridTemplateColumns = "repeat(" + maxCol + ", " + cellSize + "px)";
    dragImage.style.width = Math.ceil(cellSize * maxCol) + "px";
    dragImage.style.height = Math.ceil(cellSize * maxRow) + "px";
    dragImage.style.zIndex = "1000";

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
        finger.style.zIndex = 1000;
        finger.style.pointerEvents = "none";
        document.body.appendChild(finger);
    }

    function animateFinger() {
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
        finger.style.transform = "translate(0, 0)";
        finger.style.opacity = 1;
        void finger.offsetWidth;
        finger.style.transition = "transform 1s ease-out, opacity 1s ease-out";
        finger.style.zIndex = "9999";

        const cellSize = playingField.querySelector(".cell").offsetWidth;

        const blocks = shape.querySelectorAll(".block");
        let shapeOffsets = [];
        blocks.forEach(function(block) {
            var row = parseInt(block.style.gridRowStart) - 1;
            var col = parseInt(block.style.gridColumnStart) - 1;
            shapeOffsets.push({ row: row, col: col });
        });


        var scaledClone = createTutorialShape(shape, shapeOffsets, cellSize);

        scaledClone.style.opacity = 0.5;
        scaledClone.style.transition = "transform 1s ease-out, opacity 1s ease-out";


        var maxRow = Math.max.apply(null, shapeOffsets.map(o => o.row)) + 1;
        var maxCol = Math.max.apply(null, shapeOffsets.map(o => o.col)) + 1;
        var cloneWidth = cellSize * maxCol;
        var cloneHeight = cellSize * maxRow;

        scaledClone.style.left = (startX - cloneWidth / 2) + "px";
        scaledClone.style.top = (startY - cloneHeight / 2) + "px";

        document.body.appendChild(scaledClone);

        requestAnimationFrame(function() {
            var deltaX = endX - startX;
            var deltaY = endY - startY;
            finger.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
            scaledClone.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        });

        setTimeout(function() {
            finger.style.opacity = 0;
            scaledClone.style.opacity = 0;
        }, 1200);

        setTimeout(function() {
            if (scaledClone.parentNode) {
                scaledClone.parentNode.removeChild(scaledClone);
            }

            setTimeout(animateFinger, 800);
        }, 1300);
    }

    animateFinger();
}

function stopTutorialAnimation() {
    const finger = document.getElementById("tutorialFinger");
    if (finger) {
        finger.remove();
    }
}
